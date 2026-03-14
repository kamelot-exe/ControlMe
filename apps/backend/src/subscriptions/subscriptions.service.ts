import { Injectable, NotFoundException } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import type {
  Subscription,
  SubscriptionOverview,
  UpcomingCharge,
} from "@/shared/types";
import { CacheService } from "../cache/cache.service";
import { buildPaginatedResponse } from "../common/utils/pagination.util";
import { PrismaService } from "../prisma/prisma.service";
import { CreateSubscriptionDto } from "./dto/create-subscription.dto";
import { ListSubscriptionsQueryDto } from "./dto/list-subscriptions-query.dto";
import { UpdateSubscriptionDto } from "./dto/update-subscription.dto";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  private resolveCategory(
    category?: string | null,
    serviceGroup?: string | null,
  ) {
    if (category && !["General", "Subscription"].includes(category)) {
      return category;
    }

    if (serviceGroup) {
      return serviceGroup;
    }

    return "Subscription";
  }

  async create(userId: string, dto: CreateSubscriptionDto) {
    const subscription = await this.prisma.subscription.create({
      data: {
        ...dto,
        userId,
        price: dto.price,
        category: this.resolveCategory(dto.category, dto.serviceGroup),
        serviceGroup: dto.serviceGroup || null,
        needScore: dto.needScore ?? 70,
        websiteUrl: dto.websiteUrl || null,
        notes: dto.notes || null,
        nextChargeDate: new Date(dto.nextChargeDate),
      },
      include: {
        usage: true,
      },
    });

    await this.invalidateUserCaches(userId);
    return this.mapSubscription(subscription);
  }

  async findAll(userId: string) {
    const subscriptions = await this.prisma.subscription.findMany({
      where: { userId },
      include: {
        usage: true,
      },
      orderBy: {
        nextChargeDate: "asc",
      },
    });

    return subscriptions.map((subscription) => this.mapSubscription(subscription));
  }

  async findPage(userId: string, query: ListSubscriptionsQueryDto) {
    const cacheKey = `subscriptions:${userId}:list:${JSON.stringify(query)}`;

    const { value } = await this.cacheService.wrap(cacheKey, 60, async () => {
      const where = this.buildWhereClause(userId, query);
      const orderBy: Prisma.SubscriptionOrderByWithRelationInput = {
        [query.sortBy ?? "nextChargeDate"]: query.sortOrder ?? "asc",
      };

      const [total, subscriptions] = await this.prisma.$transaction([
        this.prisma.subscription.count({ where }),
        this.prisma.subscription.findMany({
          where,
          include: { usage: true },
          orderBy,
          skip: query.skip,
          take: query.pageSize,
        }),
      ]);

      return buildPaginatedResponse(
        subscriptions.map((subscription) => this.mapSubscription(subscription)),
        total,
        query.page,
        query.pageSize,
      );
    });

    return value;
  }

  async getOverview(userId: string): Promise<SubscriptionOverview> {
    const cacheKey = `subscriptions:${userId}:overview`;

    const { value } = await this.cacheService.wrap(cacheKey, 60, async () => {
      const subscriptions = await this.prisma.subscription.findMany({
        where: { userId },
        include: { usage: true },
        orderBy: { nextChargeDate: "asc" },
      });

      const now = new Date();
      const upcomingCutoff = new Date(now.getTime() + THIRTY_DAYS_MS);
      const inactiveCutoff = new Date(now.getTime() - THIRTY_DAYS_MS);

      let totalMonthlyCost = 0;
      let activeSubscriptions = 0;
      let inactiveCandidates = 0;
      const upcomingCharges: UpcomingCharge[] = [];

      for (const subscription of subscriptions) {
        const monthlyCost = this.toMonthlyCost(subscription);
        if (subscription.isActive) {
          totalMonthlyCost += monthlyCost;
          activeSubscriptions++;
        }

        const lastUsed =
          subscription.usage?.lastConfirmedUseAt ?? subscription.createdAt;
        if (
          (subscription.needScore ?? 70) < 45 ||
          (lastUsed !== null && lastUsed <= inactiveCutoff)
        ) {
          inactiveCandidates++;
        }

        if (
          subscription.isActive &&
          subscription.nextChargeDate >= now &&
          subscription.nextChargeDate <= upcomingCutoff
        ) {
          upcomingCharges.push({
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
          });
        }
      }

      return {
        totalSubscriptions: subscriptions.length,
        activeSubscriptions,
        totalMonthlyCost: Number(totalMonthlyCost.toFixed(2)),
        upcomingCharges: upcomingCharges.slice(0, 5),
        inactiveCandidates,
      };
    });

    return value;
  }

  async findOne(id: string, userId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        usage: true,
      },
    });

    if (!subscription) {
      throw new NotFoundException("Subscription not found");
    }

    return this.mapSubscription(subscription);
  }

  async update(id: string, userId: string, dto: UpdateSubscriptionDto) {
    await this.findOne(id, userId);

    const updateData: Prisma.SubscriptionUpdateInput = {};

    if (dto.name !== undefined) {
      updateData.name = dto.name;
    }
    if (dto.price !== undefined) {
      updateData.price = dto.price;
    }
    if (dto.billingPeriod !== undefined) {
      updateData.billingPeriod = dto.billingPeriod;
    }
    if (dto.nextChargeDate !== undefined) {
      updateData.nextChargeDate = new Date(dto.nextChargeDate);
    }
    if (dto.category !== undefined || dto.serviceGroup !== undefined) {
      updateData.category = this.resolveCategory(
        dto.category,
        dto.serviceGroup,
      );
    }
    if (dto.serviceGroup !== undefined) {
      updateData.serviceGroup = dto.serviceGroup || null;
    }
    if (dto.needScore !== undefined) {
      updateData.needScore = dto.needScore;
    }
    if (dto.websiteUrl !== undefined) {
      updateData.websiteUrl = dto.websiteUrl || null;
    }
    if (dto.notes !== undefined) {
      updateData.notes = dto.notes || null;
    }
    if (dto.isActive !== undefined) {
      updateData.isActive = dto.isActive;
    }

    const subscription = await this.prisma.subscription.update({
      where: { id },
      data: updateData,
      include: {
        usage: true,
      },
    });

    await this.invalidateUserCaches(userId);
    return this.mapSubscription(subscription);
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);

    const deleted = await this.prisma.subscription.delete({
      where: { id },
    });

    await this.invalidateUserCaches(userId);
    return {
      id: deleted.id,
      success: true,
    };
  }

  async importFromCsv(userId: string, csvContent: string) {
    const lines = csvContent.trim().split("\n");
    if (lines.length < 2) {
      return { imported: 0, errors: ["Empty CSV"] };
    }

    const headers = lines[0]
      .toLowerCase()
      .split(",")
      .map((header) => header.trim());
    const nameIdx = headers.indexOf("name");
    const priceIdx = headers.indexOf("price");
    const periodIdx = headers.indexOf("billingperiod");
    const categoryIdx = headers.indexOf("category");
    const dateIdx = headers.indexOf("startdate");

    if (nameIdx === -1 || priceIdx === -1) {
      return { imported: 0, errors: ["CSV must have name and price columns"] };
    }

    let imported = 0;
    const errors: string[] = [];

    for (let index = 1; index < lines.length; index++) {
      const cols = lines[index]
        .split(",")
        .map((column) => column.trim().replace(/^"|"$/g, ""));
      if (cols.every((column) => !column)) {
        continue;
      }

      try {
        const name = cols[nameIdx];
        const price = Number.parseFloat(cols[priceIdx]);
        if (!name || Number.isNaN(price)) {
          errors.push(`Row ${index}: invalid name or price`);
          continue;
        }

        const billingPeriod =
          periodIdx !== -1 && cols[periodIdx]?.toUpperCase() === "YEARLY"
            ? "YEARLY"
            : "MONTHLY";
        const category =
          categoryIdx !== -1 && cols[categoryIdx] ? cols[categoryIdx] : "Other";
        const parsedDate =
          dateIdx !== -1 && cols[dateIdx]
            ? new Date(cols[dateIdx])
            : new Date();
        const nextChargeDate = Number.isNaN(parsedDate.getTime())
          ? new Date()
          : parsedDate;

        await this.prisma.subscription.create({
          data: {
            userId,
            name,
            price,
            billingPeriod,
            category,
            serviceGroup: null,
            needScore: 70,
            isActive: true,
            nextChargeDate,
          },
        });
        imported++;
      } catch (error) {
        errors.push(
          `Row ${index}: ${error instanceof Error ? error.message : "unknown error"}`,
        );
      }
    }

    await this.invalidateUserCaches(userId);
    return { imported, errors };
  }

  private buildWhereClause(
    userId: string,
    query: ListSubscriptionsQueryDto,
  ): Prisma.SubscriptionWhereInput {
    const where: Prisma.SubscriptionWhereInput = {
      userId,
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: "insensitive" } },
              { category: { contains: query.search, mode: "insensitive" } },
              { serviceGroup: { contains: query.search, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(query.category ? { category: query.category } : {}),
      ...(query.billingPeriod ? { billingPeriod: query.billingPeriod } : {}),
      ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
    };

    if (query.upcomingWithinDays !== undefined) {
      const now = new Date();
      const cutoff = new Date(
        now.getTime() + query.upcomingWithinDays * 24 * 60 * 60 * 1000,
      );
      where.nextChargeDate = {
        gte: now,
        lte: cutoff,
      };
    }

    return where;
  }

  private mapSubscription<T extends { price: Prisma.Decimal }>(
    subscription: T,
  ): T & Subscription {
    return {
      ...subscription,
      price: Number(subscription.price),
    } as T & Subscription;
  }

  private toMonthlyCost(subscription: { billingPeriod: string; price: Prisma.Decimal }) {
    if (subscription.billingPeriod === "DAILY") {
      return Number(subscription.price) * 30;
    }
    if (subscription.billingPeriod === "YEARLY") {
      return Number(subscription.price) / 12;
    }
    return Number(subscription.price);
  }

  private async invalidateUserCaches(userId: string) {
    await Promise.all([
      this.cacheService.invalidatePrefix(`subscriptions:${userId}:`),
      this.cacheService.invalidatePrefix(`analytics:${userId}:`),
      this.cacheService.invalidatePrefix(`notifications:${userId}:`),
      this.cacheService.invalidatePrefix(`export:${userId}:`),
    ]);
  }
}
