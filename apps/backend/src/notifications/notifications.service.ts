import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateNotificationSettingsDto } from './dto/update-notification-settings.dto';

type NotificationAlertType = 'PRECHARGE' | 'UNUSED' | 'SPENDING_INCREASE' | 'DUPLICATE';

export interface NotificationAlert {
  type: NotificationAlertType;
  message: string;
  subscriptionId?: string;
  daysUntil?: number;
  percent?: number;
}

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

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
      },
    });
  }

  async updateNotificationSettings(
    userId: string,
    dto: UpdateNotificationSettingsDto,
  ) {
    await this.getOrCreateNotificationSettings(userId);

    return this.prisma.notificationSettings.update({
      where: { userId },
      data: dto,
    });
  }

  async getSmartAlerts(userId: string): Promise<NotificationAlert[]> {
    const settings = await this.getOrCreateNotificationSettings(userId);

    if (!settings.smartAlertsEnabled) {
      return [];
    }

    const prechargeDays = settings?.prechargeReminderDays ?? 1;
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const unusedCutoff = new Date(startOfToday);
    unusedCutoff.setDate(unusedCutoff.getDate() - 30);

    const subscriptions = await this.prisma.subscription.findMany({
      where: { userId, isActive: true },
      include: { usage: true },
      orderBy: { nextChargeDate: 'asc' },
    });

    const alerts: NotificationAlert[] = [];

    let currentMonthlyTotal = 0;
    let previousMonthlyTotal = 0;
    const previousCutoff = new Date(startOfToday);
    previousCutoff.setDate(previousCutoff.getDate() - 30);

    for (const sub of subscriptions) {
      const monthlyPrice =
        sub.billingPeriod === 'MONTHLY'
          ? Number(sub.price)
          : Number(sub.price) / 12;

      currentMonthlyTotal += monthlyPrice;
      if (sub.createdAt <= previousCutoff) {
        previousMonthlyTotal += monthlyPrice;
      }

      const chargeDate = new Date(
        sub.nextChargeDate.getFullYear(),
        sub.nextChargeDate.getMonth(),
        sub.nextChargeDate.getDate(),
      );
      const daysUntil = Math.floor(
        (chargeDate.getTime() - startOfToday.getTime()) / 86_400_000,
      );

      if (daysUntil >= 0 && daysUntil <= prechargeDays) {
        alerts.push({
          type: 'PRECHARGE',
          message:
            daysUntil === 0
              ? `Charge today: ${sub.name}`
              : daysUntil === 1
                ? `Charge tomorrow: ${sub.name}`
                : `Charge in ${daysUntil} days: ${sub.name}`,
          subscriptionId: sub.id,
          daysUntil,
        });
      }

      const lastUse = sub.usage?.lastConfirmedUseAt ?? sub.createdAt;
      if (lastUse && lastUse <= unusedCutoff) {
        alerts.push({
          type: 'UNUSED',
          message: `Unused subscription for 30+ days: ${sub.name}`,
          subscriptionId: sub.id,
        });
      }
    }

    if (previousMonthlyTotal > 0) {
      const increaseRatio = currentMonthlyTotal / previousMonthlyTotal;
      const percentIncrease = Math.round((increaseRatio - 1) * 100);
      if (percentIncrease >= 12) {
        alerts.push({
          type: 'SPENDING_INCREASE',
          message: `Your monthly spending increased by ${percentIncrease}% in the last 30 days`,
          percent: percentIncrease,
        });
      }
    }

    // Duplicate detection
    const seenPairs = new Set<string>();
    for (let i = 0; i < subscriptions.length; i++) {
      for (let j = i + 1; j < subscriptions.length; j++) {
        const sub1 = subscriptions[i];
        const sub2 = subscriptions[j];
        const nameA = sub1.name.toLowerCase().trim();
        const nameB = sub2.name.toLowerCase().trim();

        if (nameA.includes(nameB) || nameB.includes(nameA)) {
          const pairKey = [sub1.id, sub2.id].sort().join(':');
          if (!seenPairs.has(pairKey)) {
            seenPairs.add(pairKey);
            alerts.push({
              type: 'DUPLICATE',
              message: `Possible duplicate: "${sub1.name}" and "${sub2.name}"`,
              subscriptionId: sub1.id,
            });
          }
        }
      }
    }

    return alerts;
  }
}
