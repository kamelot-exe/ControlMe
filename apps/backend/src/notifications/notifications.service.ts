import { Injectable } from "@nestjs/common";
import type {
  NotificationAlert,
  NotificationDeliverySummary,
  PaginatedResponse,
} from "@/shared/types";
import { CacheService } from "../cache/cache.service";
import { buildPaginatedResponse } from "../common/utils/pagination.util";
import { PrismaService } from "../prisma/prisma.service";
import { ListNotificationHistoryQueryDto } from "./dto/list-notification-history-query.dto";
import { UpdateNotificationSettingsDto } from "./dto/update-notification-settings.dto";

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  async getOrCreateNotificationSettings(userId: string) {
    const existingSettings = await this.prisma.notificationSettings.findUnique({
      where: { userId },
    });

    if (existingSettings) {
      return existingSettings;
    }

    return this.prisma.notificationSettings.create({
      data: {
        userId,
        prechargeReminderDays: 1,
        smartAlertsEnabled: true,
        renewalEmailsEnabled: true,
        unusedEmailsEnabled: false,
        weeklyDigestEnabled: true,
        monthlyDigestEnabled: true,
        weeklyDigestDay: 1,
        monthlyDigestDay: 1,
        digestTime: "08:00",
        timeZone: "UTC",
      },
    });
  }

  async updateNotificationSettings(
    userId: string,
    dto: UpdateNotificationSettingsDto,
  ) {
    await this.getOrCreateNotificationSettings(userId);

    const settings = await this.prisma.notificationSettings.update({
      where: { userId },
      data: dto,
    });

    await this.cacheService.invalidatePrefix(`notifications:${userId}:`);
    return settings;
  }

  async getSmartAlerts(userId: string): Promise<NotificationAlert[]> {
    const cacheKey = `notifications:${userId}:smart-alerts`;

    const { value } = await this.cacheService.wrap(cacheKey, 60, async () => {
      const settings = await this.getOrCreateNotificationSettings(userId);

      if (!settings.smartAlertsEnabled) {
        return [];
      }

      const prechargeDays = settings.prechargeReminderDays ?? 1;
      const now = new Date();
      const startOfToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      );
      const unusedCutoff = new Date(startOfToday);
      unusedCutoff.setDate(unusedCutoff.getDate() - 30);

      const subscriptions = await this.prisma.subscription.findMany({
        where: { userId, isActive: true },
        include: { usage: true },
        orderBy: { nextChargeDate: "asc" },
      });

      const alerts: NotificationAlert[] = [];

      let currentMonthlyTotal = 0;
      let previousMonthlyTotal = 0;
      const previousCutoff = new Date(startOfToday);
      previousCutoff.setDate(previousCutoff.getDate() - 30);

      for (const subscription of subscriptions) {
        const monthlyPrice =
          subscription.billingPeriod === "DAILY"
            ? Number(subscription.price) * 30
            : subscription.billingPeriod === "MONTHLY"
              ? Number(subscription.price)
              : Number(subscription.price) / 12;

        currentMonthlyTotal += monthlyPrice;
        if (subscription.createdAt <= previousCutoff) {
          previousMonthlyTotal += monthlyPrice;
        }

        const chargeDate = new Date(
          subscription.nextChargeDate.getFullYear(),
          subscription.nextChargeDate.getMonth(),
          subscription.nextChargeDate.getDate(),
        );
        const daysUntil = Math.floor(
          (chargeDate.getTime() - startOfToday.getTime()) / 86_400_000,
        );

        if (daysUntil >= 0 && daysUntil <= prechargeDays) {
          alerts.push({
            type: "PRECHARGE",
            message:
              daysUntil === 0
                ? `Charge today: ${subscription.name}`
                : daysUntil === 1
                  ? `Charge tomorrow: ${subscription.name}`
                  : `Charge in ${daysUntil} days: ${subscription.name}`,
            subscriptionId: subscription.id,
            daysUntil,
          });
        }

        const lastUse =
          subscription.usage?.lastConfirmedUseAt ?? subscription.createdAt;
        if (lastUse && lastUse <= unusedCutoff) {
          alerts.push({
            type: "UNUSED",
            message: `Unused subscription for 30+ days: ${subscription.name}`,
            subscriptionId: subscription.id,
          });
        }
      }

      if (previousMonthlyTotal > 0) {
        const increaseRatio = currentMonthlyTotal / previousMonthlyTotal;
        const percentIncrease = Math.round((increaseRatio - 1) * 100);
        if (percentIncrease >= 12) {
          alerts.push({
            type: "SPENDING_INCREASE",
            message: `Your monthly spending increased by ${percentIncrease}% in the last 30 days`,
            percent: percentIncrease,
          });
        }
      }

      const seenPairs = new Set<string>();
      for (let left = 0; left < subscriptions.length; left++) {
        for (let right = left + 1; right < subscriptions.length; right++) {
          const subscriptionA = subscriptions[left];
          const subscriptionB = subscriptions[right];
          const nameA = subscriptionA.name.toLowerCase().trim();
          const nameB = subscriptionB.name.toLowerCase().trim();

          if (nameA.includes(nameB) || nameB.includes(nameA)) {
            const pairKey = [subscriptionA.id, subscriptionB.id].sort().join(":");
            if (!seenPairs.has(pairKey)) {
              seenPairs.add(pairKey);
              alerts.push({
                type: "DUPLICATE",
                message: `Possible duplicate: "${subscriptionA.name}" and "${subscriptionB.name}"`,
                subscriptionId: subscriptionA.id,
              });
            }
          }
        }
      }

      return alerts;
    });

    return value;
  }

  async getHistory(
    userId: string,
    query: ListNotificationHistoryQueryDto,
  ): Promise<PaginatedResponse<NotificationDeliverySummary>> {
    const where = {
      userId,
      ...(query.type ? { type: query.type } : {}),
      ...(query.status ? { status: query.status } : {}),
    };

    const [total, items] = await this.prisma.$transaction([
      this.prisma.notificationDelivery.count({ where }),
      this.prisma.notificationDelivery.findMany({
        where,
        select: {
          id: true,
          type: true,
          status: true,
          subscriptionId: true,
          scheduledFor: true,
          sentAt: true,
          createdAt: true,
          payload: true,
        },
        orderBy: { createdAt: "desc" },
        skip: query.skip,
        take: query.pageSize,
      }),
    ]);

    return buildPaginatedResponse(items, total, query.page, query.pageSize);
  }
}
