import { Injectable } from "@nestjs/common";
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
  constructor(private prisma: PrismaService) {}

  async getMonthlyAnalytics(userId: string) {
    const subscriptions = await this.prisma.subscription.findMany({
      where: {
        userId,
        isActive: true,
      },
    });

    let totalMonthlyCost = 0;
    let totalYearlyCost = 0;
    const categoryMap = new Map<string, { total: number; count: number }>();

    subscriptions.forEach((sub) => {
      const monthlyPrice =
        sub.billingPeriod === "DAILY"
          ? Number(sub.price) * 30
          : sub.billingPeriod === "MONTHLY"
            ? Number(sub.price)
            : Number(sub.price) / 12;

      const yearlyPrice =
        sub.billingPeriod === "DAILY"
          ? Number(sub.price) * 365
          : sub.billingPeriod === "YEARLY"
            ? Number(sub.price)
            : Number(sub.price) * 12;

      totalMonthlyCost += monthlyPrice;
      totalYearlyCost += yearlyPrice;

      const category = normalizeCategory(sub.category, sub.serviceGroup);
      const existing = categoryMap.get(category) || { total: 0, count: 0 };
      categoryMap.set(category, {
        total: existing.total + monthlyPrice,
        count: existing.count + 1,
      });
    });

    const categoryBreakdown = Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        total: data.total,
        count: data.count,
      }))
      .sort((a, b) => b.total - a.total);

    return {
      totalMonthlyCost: Math.round(totalMonthlyCost * 100) / 100,
      totalYearlyCost: Math.round(totalYearlyCost * 100) / 100,
      activeSubscriptions: subscriptions.length,
      categoryBreakdown,
    };
  }

  async getCategoryBreakdown(userId: string) {
    const analytics = await this.getMonthlyAnalytics(userId);
    return analytics.categoryBreakdown;
  }

  async getSavingsSummary(userId: string) {
    const subscriptions = await this.prisma.subscription.findMany({
      where: {
        userId,
        isActive: true,
      },
      include: { usage: true },
    });

    const now = new Date();
    const cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    let monthlySavings = 0;
    let unusedCount = 0;

    for (const sub of subscriptions) {
      const lastUse = sub.usage?.lastConfirmedUseAt ?? null;
      const isUnused = lastUse === null || lastUse < cutoff;

      if (isUnused) {
        const monthlyPrice =
          sub.billingPeriod === "DAILY"
            ? Number(sub.price) * 30
            : sub.billingPeriod === "MONTHLY"
              ? Number(sub.price)
              : Number(sub.price) / 12;
        monthlySavings += monthlyPrice;
        unusedCount++;
      }
    }

    const yearlySavings = monthlySavings * 12;

    return {
      monthlySavings: Math.round(monthlySavings * 100) / 100,
      yearlySavings: Math.round(yearlySavings * 100) / 100,
      unusedCount,
    };
  }

  async getSpendingHistory(userId: string) {
    const now = new Date();
    const months: { month: string; total: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const endOfMonth = new Date(
        date.getFullYear(),
        date.getMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      );

      const subscriptions = await this.prisma.subscription.findMany({
        where: {
          userId,
          isActive: true,
          createdAt: { lte: endOfMonth },
        },
      });

      let total = 0;
      for (const sub of subscriptions) {
        const monthlyPrice =
          sub.billingPeriod === "DAILY"
            ? Number(sub.price) * 30
            : sub.billingPeriod === "MONTHLY"
              ? Number(sub.price)
              : Number(sub.price) / 12;
        total += monthlyPrice;
      }

      const monthName = date.toLocaleString("en-US", { month: "short" });
      months.push({ month: monthName, total: Math.round(total * 100) / 100 });
    }

    return months;
  }
}
