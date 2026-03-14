import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import type {
  AnalyticsOverview,
  CategoryBreakdown,
  MonthlyAnalytics,
  SavingsSummary,
  SpendingHistory,
  UpcomingCharge,
} from "@/shared/types";
import { CacheService } from "../cache/cache.service";
import { PrismaService } from "../prisma/prisma.service";

function normalizeCategory(
  category?: string | null,
  serviceGroup?: string | null,
) {
  const trimmedCategory = category?.trim();
  const trimmedGroup = serviceGroup?.trim();

  if (
    trimmedCategory &&
    !["General", "Subscription"].includes(trimmedCategory)
  ) {
    return trimmedCategory;
  }

  if (trimmedGroup) {
    return trimmedGroup;
  }

  return trimmedCategory || trimmedGroup || "Subscription";
}

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  async getMonthlyAnalytics(userId: string): Promise<MonthlyAnalytics> {
    const cacheKey = `analytics:${userId}:monthly`;

    const { value } = await this.cacheService.wrap(cacheKey, 60, async () => {
      const subscriptions = await this.prisma.subscription.findMany({
        where: {
          userId,
          isActive: true,
        },
      });

      let totalMonthlyCost = 0;
      let totalYearlyCost = 0;
      const categoryMap = new Map<string, { total: number; count: number }>();

      subscriptions.forEach((subscription) => {
        const monthlyPrice = this.toMonthlyCost(subscription);
        const yearlyPrice = this.toYearlyCost(subscription);

        totalMonthlyCost += monthlyPrice;
        totalYearlyCost += yearlyPrice;

        const category = normalizeCategory(
          subscription.category,
          subscription.serviceGroup,
        );
        const existing = categoryMap.get(category) || { total: 0, count: 0 };
        categoryMap.set(category, {
          total: existing.total + monthlyPrice,
          count: existing.count + 1,
        });
      });

      const categoryBreakdown: CategoryBreakdown[] = Array.from(
        categoryMap.entries(),
      )
        .map(([category, data]) => ({
          category,
          total: Number(data.total.toFixed(2)),
          count: data.count,
        }))
        .sort((left, right) => right.total - left.total);

      return {
        totalMonthlyCost: Number(totalMonthlyCost.toFixed(2)),
        totalYearlyCost: Number(totalYearlyCost.toFixed(2)),
        activeSubscriptions: subscriptions.length,
        categoryBreakdown,
      };
    });

    return value;
  }

  async getOverview(userId: string, months = 6): Promise<AnalyticsOverview> {
    const cacheKey = `analytics:${userId}:overview:${months}`;

    const { value } = await this.cacheService.wrap(cacheKey, 60, async () => {
      const [monthly, savings, history, subscriptions] = await Promise.all([
        this.getMonthlyAnalytics(userId),
        this.getSavingsSummary(userId),
        this.getSpendingHistory(userId, months),
        this.prisma.subscription.findMany({
          where: { userId, isActive: true },
          orderBy: { nextChargeDate: "asc" },
        }),
      ]);

      return {
        monthly,
        savings,
        history,
        upcomingCharges: this.buildUpcomingCharges(subscriptions),
        topCategories: monthly.categoryBreakdown.slice(0, 5),
      };
    });

    return value;
  }

  async getCategoryBreakdown(userId: string) {
    const analytics = await this.getMonthlyAnalytics(userId);
    return analytics.categoryBreakdown;
  }

  async getSavingsSummary(userId: string): Promise<SavingsSummary> {
    const cacheKey = `analytics:${userId}:savings`;

    const { value } = await this.cacheService.wrap(cacheKey, 60, async () => {
      const subscriptions = await this.prisma.subscription.findMany({
        where: {
          userId,
          isActive: true,
        },
        include: { usage: true },
      });

      const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      let monthlySavings = 0;
      let unusedCount = 0;

      for (const subscription of subscriptions) {
        const lastUse = subscription.usage?.lastConfirmedUseAt ?? null;
        const isUnused = lastUse === null || lastUse < cutoff;

        if (isUnused) {
          monthlySavings += this.toMonthlyCost(subscription);
          unusedCount++;
        }
      }

      return {
        monthlySavings: Number(monthlySavings.toFixed(2)),
        yearlySavings: Number((monthlySavings * 12).toFixed(2)),
        unusedCount,
      };
    });

    return value;
  }

  async getSpendingHistory(
    userId: string,
    months = 6,
  ): Promise<SpendingHistory[]> {
    const cacheKey = `analytics:${userId}:history:${months}`;

    const { value } = await this.cacheService.wrap(cacheKey, 60, async () => {
      const subscriptions = await this.prisma.subscription.findMany({
        where: {
          userId,
          isActive: true,
        },
        select: {
          billingPeriod: true,
          createdAt: true,
          price: true,
        },
      });

      const now = new Date();
      const buckets = Array.from({ length: months }, (_value, index) => {
        const date = new Date(now.getFullYear(), now.getMonth() - (months - index - 1), 1);
        return {
          date,
          month: date.toLocaleString("en-US", { month: "short" }),
          total: 0,
        };
      });

      for (const subscription of subscriptions) {
        const monthlyCost = this.toMonthlyCost(subscription);

        for (const bucket of buckets) {
          const endOfMonth = new Date(
            bucket.date.getFullYear(),
            bucket.date.getMonth() + 1,
            0,
            23,
            59,
            59,
            999,
          );

          if (subscription.createdAt <= endOfMonth) {
            bucket.total += monthlyCost;
          }
        }
      }

      return buckets.map((bucket) => ({
        month: bucket.month,
        total: Number(bucket.total.toFixed(2)),
      }));
    });

    return value;
  }

  private buildUpcomingCharges(
    subscriptions: Array<{
      billingPeriod: string;
      id: string;
      name: string;
      nextChargeDate: Date;
      price: Prisma.Decimal;
    }>,
  ): UpcomingCharge[] {
    const now = new Date();
    const cutoff = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    return subscriptions
      .filter(
        (subscription) =>
          subscription.nextChargeDate >= now &&
          subscription.nextChargeDate <= cutoff,
      )
      .slice(0, 5)
      .map((subscription) => ({
        subscriptionId: subscription.id,
        name: subscription.name,
        amount: Number(subscription.price),
        billingPeriod: subscription.billingPeriod as UpcomingCharge["billingPeriod"],
        nextChargeDate: subscription.nextChargeDate,
        daysUntil: Math.max(
          0,
          Math.ceil(
            (subscription.nextChargeDate.getTime() - now.getTime()) /
              (24 * 60 * 60 * 1000),
          ),
        ),
      }));
  }

  private toMonthlyCost(subscription: {
    billingPeriod: string;
    price: Prisma.Decimal;
  }) {
    if (subscription.billingPeriod === "DAILY") {
      return Number(subscription.price) * 30;
    }
    if (subscription.billingPeriod === "YEARLY") {
      return Number(subscription.price) / 12;
    }
    return Number(subscription.price);
  }

  private toYearlyCost(subscription: {
    billingPeriod: string;
    price: Prisma.Decimal;
  }) {
    if (subscription.billingPeriod === "DAILY") {
      return Number(subscription.price) * 365;
    }
    if (subscription.billingPeriod === "MONTHLY") {
      return Number(subscription.price) * 12;
    }
    return Number(subscription.price);
  }
}
