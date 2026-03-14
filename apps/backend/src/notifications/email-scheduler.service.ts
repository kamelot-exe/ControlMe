import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Cron } from "@nestjs/schedule";
import type { Prisma, Subscription } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { NotificationDeliveryService } from "./notification-delivery.service";
import { NotificationQueueService } from "./notification-queue.service";
import { buildRenewalEmail } from "./templates/renewal-email.template";
import { buildUnusedEmail } from "./templates/unused-email.template";
import { buildWeeklyDigestEmail } from "./templates/weekly-digest.template";
import { buildMonthlyDigestEmail } from "./templates/monthly-digest.template";
import type { NotificationEmailDeliveryPayload } from "./notification-queue.types";

type NotificationSettingsWithUser = Prisma.NotificationSettingsGetPayload<{
  include: { user: true };
}>;

interface LocalDateContext {
  timeZone: string;
  dateKey: string;
  monthKey: string;
  weekKey: string;
  weekday: number;
  dayOfMonth: number;
  minutesOfDay: number;
}

interface DigestRenewalItem {
  name: string;
  amount: number;
  when: string;
  chargeDate: string;
}

interface DigestSummary {
  activeSubscriptions: number;
  renewals: DigestRenewalItem[];
  totalDue: number;
  monthlyTotal: number;
  yearlyProjection: number;
  possibleSavings: number;
  highestCost: number;
  highestCostName: string;
  topCategory: string | null;
  overlapGroupsCount: number;
}

@Injectable()
export class EmailSchedulerService {
  private readonly logger = new Logger(EmailSchedulerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly delivery: NotificationDeliveryService,
    private readonly notificationQueue: NotificationQueueService,
  ) {}

  @Cron(process.env.EMAIL_REMINDER_CRON ?? "0 * * * *", {
    name: "subscription-email-jobs",
    timeZone: process.env.EMAIL_REMINDER_TIMEZONE ?? "UTC",
  })
  async runScheduledNotifications(): Promise<void> {
    await this.executeJob("renewal reminders", () =>
      this.sendRenewalReminders(),
    );
    await this.executeJob("unused subscription alerts", () =>
      this.sendUnusedSubscriptionEmails(),
    );
    await this.executeJob("weekly digest", () => this.sendWeeklyDigestEmails());
    await this.executeJob("monthly digest", () =>
      this.sendMonthlyDigestEmails(),
    );
  }

  async sendRenewalReminders(): Promise<{ sent: number; skipped: number }> {
    const settingsList = await this.getSettingsUsers({
      smartAlertsEnabled: true,
      renewalEmailsEnabled: true,
    });

    let sent = 0;
    let skipped = 0;
    const appUrl = this.getAppUrl();

    for (const settings of settingsList) {
      if (!settings.user.email) {
        skipped += 1;
        continue;
      }

      const localContext = this.getLocalDateContext(settings.timeZone ?? "UTC");
      const reminderWindow = Math.max(settings.prechargeReminderDays ?? 1, 0);
      const subscriptions = await this.prisma.subscription.findMany({
        where: {
          userId: settings.user.id,
          isActive: true,
        },
        orderBy: { nextChargeDate: "asc" },
      });

      const dueItems = subscriptions
        .map((subscription) => {
          const chargeDateKey = this.formatDateKeyInTimeZone(
            subscription.nextChargeDate,
            localContext.timeZone,
          );
          const daysUntil = this.diffDateKeys(
            localContext.dateKey,
            chargeDateKey,
          );

          return {
            subscription,
            chargeDateKey,
            daysUntil,
          };
        })
        .filter(
          (item) =>
            item.daysUntil >= 0 && item.daysUntil <= reminderWindow,
        );

      if (dueItems.length === 0) {
        skipped += 1;
        continue;
      }

      const rateLimit = await this.delivery.isUserRateLimited({
        userId: settings.user.id,
        dailyLimit: this.getUserDailyLimit(),
        minimumIntervalMinutes: this.getUserMinIntervalMinutes(),
      });

      if (rateLimit.limited) {
        this.logger.warn(
          `Skipping renewal reminder for ${settings.user.email}: ${rateLimit.reason}`,
        );
        skipped += 1;
        continue;
      }

      const reservedItems: Array<{
        subscription: Subscription;
        dedupeKey: string;
        when: string;
        chargeDate: string;
        chargeDateKey: string;
      }> = [];

      for (const item of dueItems) {
        const dedupeKey = `renewal:${settings.user.id}:${item.subscription.id}:${item.chargeDateKey}`;
        const reservation = await this.delivery.reserve({
          userId: settings.user.id,
          subscriptionId: item.subscription.id,
          type: "RENEWAL",
          dedupeKey,
          scheduledFor: item.subscription.nextChargeDate,
          maxAttempts: this.getMaxDeliveryAttempts(),
          payload: {
            name: item.subscription.name,
            amount: Number(item.subscription.price),
            billingPeriod: item.subscription.billingPeriod,
            chargeDateKey: item.chargeDateKey,
          },
        });

        if (!reservation.acquired) {
          continue;
        }

        reservedItems.push({
          subscription: item.subscription,
          dedupeKey,
          when: this.describeDaysUntil(item.daysUntil),
          chargeDate: this.formatDateForEmail(
            item.subscription.nextChargeDate,
            localContext.timeZone,
          ),
          chargeDateKey: item.chargeDateKey,
        });
      }

      if (reservedItems.length === 0) {
        skipped += 1;
        continue;
      }

      const currency = settings.user.currency ?? "USD";
      const html = buildRenewalEmail({
        userName: this.getUserName(settings.user.email),
        appUrl,
        items: reservedItems.map((item) => ({
          name: item.subscription.name,
          amount: this.formatCurrency(currency, Number(item.subscription.price)),
          when: item.when,
          chargeDate: item.chargeDate,
        })),
      });

      try {
        await this.enqueueNotificationEmail({
          jobId: `renewal:${settings.user.id}:${localContext.dateKey}`,
          to: settings.user.email,
          subject: `ControlMe: ${reservedItems.length} renewal${reservedItems.length > 1 ? "s" : ""} due soon`,
          html,
          deliveries: reservedItems.map((item) => ({
            dedupeKey: item.dedupeKey,
            payload: {
              name: item.subscription.name,
              amount: Number(item.subscription.price),
              billingPeriod: item.subscription.billingPeriod,
              chargeDateKey: item.chargeDateKey,
            },
          })),
        });

        sent += 1;
      } catch (error) {
        await this.markDeliveriesFailed(
          reservedItems.map((item) => ({
            dedupeKey: item.dedupeKey,
            payload: {
              name: item.subscription.name,
              amount: Number(item.subscription.price),
              billingPeriod: item.subscription.billingPeriod,
              chargeDateKey: item.chargeDateKey,
            },
          })),
          this.getErrorMessage(error),
        );
        skipped += 1;
      }
    }

    this.logger.log(`Renewal reminders: ${sent} queued, ${skipped} skipped`);
    return { sent, skipped };
  }

  async sendUnusedSubscriptionEmails(): Promise<{
    sent: number;
    skipped: number;
  }> {
    const settingsList = await this.getSettingsUsers({
      smartAlertsEnabled: true,
      unusedEmailsEnabled: true,
    });

    let sent = 0;
    let skipped = 0;
    const appUrl = this.getAppUrl();

    for (const settings of settingsList) {
      if (!settings.user.email) {
        skipped += 1;
        continue;
      }

      const localContext = this.getLocalDateContext(settings.timeZone ?? "UTC");
      const subscriptions = await this.prisma.subscription.findMany({
        where: { userId: settings.user.id, isActive: true },
        include: { usage: true },
        orderBy: { nextChargeDate: "asc" },
      });

      const unusedItems = subscriptions.filter((subscription) => {
        const lastUse = subscription.usage?.lastConfirmedUseAt;
        const referenceDate = lastUse ?? subscription.createdAt;
        const referenceKey = this.formatDateKeyInTimeZone(
          referenceDate,
          localContext.timeZone,
        );
        const inactiveDays = this.diffDateKeys(referenceKey, localContext.dateKey);

        return inactiveDays >= 30;
      });

      if (unusedItems.length === 0) {
        skipped += 1;
        continue;
      }

      const rateLimit = await this.delivery.isUserRateLimited({
        userId: settings.user.id,
        dailyLimit: this.getUserDailyLimit(),
        minimumIntervalMinutes: this.getUserMinIntervalMinutes(),
      });

      if (rateLimit.limited) {
        this.logger.warn(
          `Skipping unused subscription alert for ${settings.user.email}: ${rateLimit.reason}`,
        );
        skipped += 1;
        continue;
      }

      const dedupeKey = `unused:${settings.user.id}:${localContext.weekKey}`;
      const monthlySavings = unusedItems.reduce(
        (sum, subscription) => sum + this.toMonthlyCost(subscription),
        0,
      );
      const currency = settings.user.currency ?? "USD";
      const reservation = await this.delivery.reserve({
        userId: settings.user.id,
        type: "UNUSED",
        dedupeKey,
        scheduledFor: new Date(),
        maxAttempts: this.getMaxDeliveryAttempts(),
        payload: {
          subscriptionIds: unusedItems.map((subscription) => subscription.id),
          monthlySavings,
          yearlySavings: monthlySavings * 12,
        },
      });

      if (!reservation.acquired) {
        skipped += 1;
        continue;
      }

      const html = buildUnusedEmail({
        userName: this.getUserName(settings.user.email),
        appUrl,
        monthlySavings: this.formatCurrency(currency, monthlySavings),
        yearlySavings: this.formatCurrency(currency, monthlySavings * 12),
        items: unusedItems.map((subscription) => ({
          name: subscription.name,
          monthlyCost: this.formatCurrency(
            currency,
            this.toMonthlyCost(subscription),
          ),
          lastUsed: subscription.usage?.lastConfirmedUseAt
            ? this.formatDateForEmail(
                subscription.usage.lastConfirmedUseAt,
                localContext.timeZone,
              )
            : "No confirmed activity",
        })),
      });

      const deliveryPayload = {
        subscriptionIds: unusedItems.map((subscription) => subscription.id),
        monthlySavings,
        yearlySavings: monthlySavings * 12,
      };

      try {
        await this.enqueueNotificationEmail({
          jobId: dedupeKey,
          to: settings.user.email,
          subject: `ControlMe: ${unusedItems.length} inactive subscription${unusedItems.length > 1 ? "s" : ""} to review`,
          html,
          deliveries: [
            {
              dedupeKey,
              payload: deliveryPayload,
            },
          ],
        });

        sent += 1;
      } catch (error) {
        await this.markDeliveriesFailed(
          [
            {
              dedupeKey,
              payload: deliveryPayload,
            },
          ],
          this.getErrorMessage(error),
        );
        skipped += 1;
      }
    }

    this.logger.log(
      `Unused subscription emails: ${sent} queued, ${skipped} skipped`,
    );
    return { sent, skipped };
  }

  async sendWeeklyDigestEmails(): Promise<{ sent: number; skipped: number }> {
    const settingsList = await this.getSettingsUsers({
      weeklyDigestEnabled: true,
    });

    let sent = 0;
    let skipped = 0;
    const appUrl = this.getAppUrl();

    for (const settings of settingsList) {
      if (!settings.user.email) {
        skipped += 1;
        continue;
      }

      const localContext = this.getLocalDateContext(settings.timeZone ?? "UTC");

      if (
        settings.weeklyDigestDay !== localContext.weekday ||
        !this.hasReachedDigestTime(settings, localContext)
      ) {
        skipped += 1;
        continue;
      }

      const summary = await this.buildDigestSummary(
        settings.user.id,
        7,
        localContext,
      );

      if (!this.shouldSendWeeklyDigest(summary)) {
        skipped += 1;
        continue;
      }

      const rateLimit = await this.delivery.isUserRateLimited({
        userId: settings.user.id,
        dailyLimit: this.getUserDailyLimit(),
        minimumIntervalMinutes: this.getUserMinIntervalMinutes(),
      });

      if (rateLimit.limited) {
        this.logger.warn(
          `Skipping weekly digest for ${settings.user.email}: ${rateLimit.reason}`,
        );
        skipped += 1;
        continue;
      }

      const dedupeKey = `weekly:${settings.user.id}:${localContext.weekKey}`;
      const reservation = await this.delivery.reserve({
        userId: settings.user.id,
        type: "WEEKLY_DIGEST",
        dedupeKey,
        scheduledFor: new Date(),
        maxAttempts: this.getMaxDeliveryAttempts(),
        payload: {
          renewals: summary.renewals.length,
          totalDue: summary.totalDue,
          possibleSavings: summary.possibleSavings,
          overlapGroupsCount: summary.overlapGroupsCount,
        },
      });

      if (!reservation.acquired) {
        skipped += 1;
        continue;
      }

      const currency = settings.user.currency ?? "USD";
      const html = buildWeeklyDigestEmail({
        userName: this.getUserName(settings.user.email),
        appUrl,
        totalDue: this.formatCurrency(currency, summary.totalDue),
        highestCost: summary.highestCostName
          ? `${summary.highestCostName} • ${this.formatCurrency(currency, summary.highestCost)}/mo`
          : "No active subscriptions",
        possibleSavings: this.formatCurrency(currency, summary.possibleSavings),
        overlapWarning:
          summary.overlapGroupsCount > 0
            ? `${summary.overlapGroupsCount} overlapping service group${summary.overlapGroupsCount > 1 ? "s look redundant" : " looks redundant"} and deserve a plan comparison.`
            : "",
        renewals: summary.renewals.map((item) => ({
          ...item,
          amount: this.formatCurrency(currency, item.amount),
        })),
      });

      const deliveryPayload = {
        renewals: summary.renewals.length,
        totalDue: summary.totalDue,
        possibleSavings: summary.possibleSavings,
        overlapGroupsCount: summary.overlapGroupsCount,
      };

      try {
        await this.enqueueNotificationEmail({
          jobId: dedupeKey,
          to: settings.user.email,
          subject: "ControlMe weekly digest",
          html,
          deliveries: [
            {
              dedupeKey,
              payload: deliveryPayload,
            },
          ],
        });

        sent += 1;
      } catch (error) {
        await this.markDeliveriesFailed(
          [
            {
              dedupeKey,
              payload: deliveryPayload,
            },
          ],
          this.getErrorMessage(error),
        );
        skipped += 1;
      }
    }

    this.logger.log(`Weekly digests: ${sent} queued, ${skipped} skipped`);
    return { sent, skipped };
  }

  async sendMonthlyDigestEmails(): Promise<{ sent: number; skipped: number }> {
    const settingsList = await this.getSettingsUsers({
      monthlyDigestEnabled: true,
    });

    let sent = 0;
    let skipped = 0;
    const appUrl = this.getAppUrl();

    for (const settings of settingsList) {
      if (!settings.user.email) {
        skipped += 1;
        continue;
      }

      const localContext = this.getLocalDateContext(settings.timeZone ?? "UTC");

      if (
        settings.monthlyDigestDay !== localContext.dayOfMonth ||
        !this.hasReachedDigestTime(settings, localContext)
      ) {
        skipped += 1;
        continue;
      }

      const summary = await this.buildDigestSummary(
        settings.user.id,
        30,
        localContext,
      );

      if (!this.shouldSendMonthlyDigest(summary)) {
        skipped += 1;
        continue;
      }

      const rateLimit = await this.delivery.isUserRateLimited({
        userId: settings.user.id,
        dailyLimit: this.getUserDailyLimit(),
        minimumIntervalMinutes: this.getUserMinIntervalMinutes(),
      });

      if (rateLimit.limited) {
        this.logger.warn(
          `Skipping monthly digest for ${settings.user.email}: ${rateLimit.reason}`,
        );
        skipped += 1;
        continue;
      }

      const dedupeKey = `monthly:${settings.user.id}:${localContext.monthKey}`;
      const reservation = await this.delivery.reserve({
        userId: settings.user.id,
        type: "MONTHLY_DIGEST",
        dedupeKey,
        scheduledFor: new Date(),
        maxAttempts: this.getMaxDeliveryAttempts(),
        payload: {
          monthlyTotal: summary.monthlyTotal,
          yearlyProjection: summary.yearlyProjection,
          topCategory: summary.topCategory,
          renewals: summary.renewals.length,
        },
      });

      if (!reservation.acquired) {
        skipped += 1;
        continue;
      }

      const currency = settings.user.currency ?? "USD";
      const html = buildMonthlyDigestEmail({
        userName: this.getUserName(settings.user.email),
        appUrl,
        monthlyTotal: this.formatCurrency(currency, summary.monthlyTotal),
        yearlyProjection: this.formatCurrency(currency, summary.yearlyProjection),
        topCategory: summary.topCategory ?? "General subscriptions",
        highestCost: summary.highestCostName
          ? `${summary.highestCostName} • ${this.formatCurrency(currency, summary.highestCost)}/mo`
          : "No active subscriptions",
        possibleSavings: this.formatCurrency(currency, summary.possibleSavings),
        renewals: summary.renewals.map((item) => ({
          ...item,
          amount: this.formatCurrency(currency, item.amount),
        })),
      });

      const deliveryPayload = {
        monthlyTotal: summary.monthlyTotal,
        yearlyProjection: summary.yearlyProjection,
        topCategory: summary.topCategory,
        renewals: summary.renewals.length,
      };

      try {
        await this.enqueueNotificationEmail({
          jobId: dedupeKey,
          to: settings.user.email,
          subject: "ControlMe monthly digest",
          html,
          deliveries: [
            {
              dedupeKey,
              payload: deliveryPayload,
            },
          ],
        });

        sent += 1;
      } catch (error) {
        await this.markDeliveriesFailed(
          [
            {
              dedupeKey,
              payload: deliveryPayload,
            },
          ],
          this.getErrorMessage(error),
        );
        skipped += 1;
      }
    }

    this.logger.log(`Monthly digests: ${sent} queued, ${skipped} skipped`);
    return { sent, skipped };
  }

  async triggerRemindersNow() {
    return {
      renewal: await this.sendRenewalReminders(),
      unused: await this.sendUnusedSubscriptionEmails(),
      weekly: await this.sendWeeklyDigestEmails(),
      monthly: await this.sendMonthlyDigestEmails(),
    };
  }

  private async executeJob(
    name: string,
    job: () => Promise<{ sent: number; skipped: number }>,
  ) {
    try {
      await job();
    } catch (error) {
      this.logger.error(
        `Email job failed: ${name} -> ${this.getErrorMessage(error)}`,
      );
    }
  }

  private async enqueueNotificationEmail(params: {
    jobId: string;
    to: string;
    subject: string;
    html: string;
    deliveries: NotificationEmailDeliveryPayload[];
  }) {
    await this.notificationQueue.enqueueEmail({
      jobId: params.jobId,
      to: params.to,
      subject: params.subject,
      html: params.html,
      deliveries: params.deliveries,
    });
  }

  private async markDeliveriesFailed(
    deliveries: NotificationEmailDeliveryPayload[],
    error: string,
  ) {
    await Promise.all(
      deliveries.map((delivery) =>
        this.delivery.markFailed({
          dedupeKey: delivery.dedupeKey,
          error,
          payload: delivery.payload ?? undefined,
        }),
      ),
    );
  }

  private async getSettingsUsers(where: Record<string, unknown>) {
    return this.prisma.notificationSettings.findMany({
      where,
      include: { user: true },
    }) as Promise<NotificationSettingsWithUser[]>;
  }

  private async buildDigestSummary(
    userId: string,
    days: number,
    localContext: LocalDateContext,
  ): Promise<DigestSummary> {
    const subscriptions = await this.prisma.subscription.findMany({
      where: { userId, isActive: true },
      include: { usage: true },
      orderBy: { nextChargeDate: "asc" },
    });

    const renewals = subscriptions
      .map((subscription) => {
        const chargeDateKey = this.formatDateKeyInTimeZone(
          subscription.nextChargeDate,
          localContext.timeZone,
        );
        const daysUntil = this.diffDateKeys(
          localContext.dateKey,
          chargeDateKey,
        );

        return {
          name: subscription.name,
          amount: Number(subscription.price),
          when: this.describeDaysUntil(daysUntil),
          chargeDate: this.formatDateForEmail(
            subscription.nextChargeDate,
            localContext.timeZone,
          ),
          daysUntil,
        };
      })
      .filter((item) => item.daysUntil >= 0 && item.daysUntil <= days)
      .map(({ daysUntil, ...item }) => item);

    let monthlyTotal = 0;
    let yearlyProjection = 0;
    let possibleSavings = 0;
    let highestCost = 0;
    let highestCostName = "";
    const categoryMap = new Map<string, number>();
    const serviceGroupCounts = new Map<string, number>();

    for (const subscription of subscriptions) {
      const monthlyCost = this.toMonthlyCost(subscription);
      const yearlyCost = this.toYearlyCost(subscription);
      const category =
        subscription.serviceGroup?.trim() ||
        subscription.category?.trim() ||
        "Subscription";

      monthlyTotal += monthlyCost;
      yearlyProjection += yearlyCost;
      categoryMap.set(category, (categoryMap.get(category) ?? 0) + monthlyCost);

      if (subscription.serviceGroup) {
        serviceGroupCounts.set(
          subscription.serviceGroup,
          (serviceGroupCounts.get(subscription.serviceGroup) ?? 0) + 1,
        );
      }

      if (monthlyCost > highestCost) {
        highestCost = monthlyCost;
        highestCostName = subscription.name;
      }

      const lastUseKey = this.formatDateKeyInTimeZone(
        subscription.usage?.lastConfirmedUseAt ?? subscription.createdAt,
        localContext.timeZone,
      );
      const inactiveDays = this.diffDateKeys(lastUseKey, localContext.dateKey);

      if ((subscription.needScore ?? 70) < 45 || inactiveDays >= 30) {
        possibleSavings += monthlyCost;
      }
    }

    const topCategory =
      Array.from(categoryMap.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ??
      null;
    const overlapGroupsCount = Array.from(serviceGroupCounts.values()).filter(
      (count) => count > 1,
    ).length;

    return {
      activeSubscriptions: subscriptions.length,
      renewals,
      totalDue: renewals.reduce((sum, item) => sum + item.amount, 0),
      monthlyTotal,
      yearlyProjection,
      possibleSavings,
      highestCost,
      highestCostName,
      topCategory,
      overlapGroupsCount,
    };
  }

  private shouldSendWeeklyDigest(summary: DigestSummary) {
    return (
      summary.activeSubscriptions > 0 &&
      (summary.renewals.length > 0 ||
        summary.possibleSavings > 0 ||
        summary.overlapGroupsCount > 0)
    );
  }

  private shouldSendMonthlyDigest(summary: DigestSummary) {
    return summary.activeSubscriptions > 0;
  }

  private getAppUrl() {
    return this.config.get<string>("APP_URL") ?? "http://localhost:3000";
  }

  private getUserName(email: string) {
    return email.split("@")[0];
  }

  private getMaxDeliveryAttempts() {
    return Math.max(
      Number(this.config.get<string>("EMAIL_MAX_RETRIES") ?? 3),
      1,
    );
  }

  private getUserDailyLimit() {
    return Math.max(
      Number(this.config.get<string>("EMAIL_USER_DAILY_LIMIT") ?? 4),
      1,
    );
  }

  private getUserMinIntervalMinutes() {
    return Math.max(
      Number(
        this.config.get<string>("EMAIL_USER_MIN_INTERVAL_MINUTES") ?? 60,
      ),
      0,
    );
  }

  private formatCurrency(currency: string, amount: number) {
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch {
      return `${currency} ${amount.toFixed(2)}`;
    }
  }

  private describeDaysUntil(daysUntil: number) {
    if (daysUntil <= 0) {
      return "Today";
    }

    if (daysUntil === 1) {
      return "Tomorrow";
    }

    return `In ${daysUntil} days`;
  }

  private formatDateForEmail(date: Date, timeZone: string) {
    return new Intl.DateTimeFormat("en-US", {
      timeZone,
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  }

  private formatDateKeyInTimeZone(date: Date, timeZone: string) {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(date);

    return `${this.readPart(parts, "year")}-${this.readPart(parts, "month")}-${this.readPart(parts, "day")}`;
  }

  private diffDateKeys(fromDateKey: string, toDateKey: string) {
    const from = this.parseDateKey(fromDateKey);
    const to = this.parseDateKey(toDateKey);
    return Math.round((to.getTime() - from.getTime()) / 86_400_000);
  }

  private parseDateKey(dateKey: string) {
    const [year, month, day] = dateKey.split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, day));
  }

  private getLocalDateContext(timeZone: string, now: Date = new Date()): LocalDateContext {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(now);

    const year = this.readPart(parts, "year");
    const month = this.readPart(parts, "month");
    const day = this.readPart(parts, "day");
    const hour = this.readPart(parts, "hour");
    const minute = this.readPart(parts, "minute");

    return {
      timeZone,
      dateKey: `${year}-${month}-${day}`,
      monthKey: `${year}-${month}`,
      weekKey: this.getIsoWeekKey(Number(year), Number(month), Number(day)),
      weekday: this.getIsoWeekday(Number(year), Number(month), Number(day)),
      dayOfMonth: Number(day),
      minutesOfDay: Number(hour) * 60 + Number(minute),
    };
  }

  private getIsoWeekday(year: number, month: number, day: number) {
    const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
    return weekday === 0 ? 7 : weekday;
  }

  private getIsoWeekKey(year: number, month: number, day: number) {
    const target = new Date(Date.UTC(year, month - 1, day));
    const dayNumber = target.getUTCDay() || 7;
    target.setUTCDate(target.getUTCDate() + 4 - dayNumber);
    const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(
      ((target.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7,
    );

    return `${target.getUTCFullYear()}-${String(weekNo).padStart(2, "0")}`;
  }

  private readPart(
    parts: Intl.DateTimeFormatPart[],
    type: Intl.DateTimeFormatPartTypes,
  ) {
    return parts.find((part) => part.type === type)?.value ?? "00";
  }

  private hasReachedDigestTime(
    settings: Pick<NotificationSettingsWithUser, "digestTime">,
    localContext: LocalDateContext,
  ) {
    if (!settings.digestTime) {
      return true;
    }

    const [hours, minutes] = settings.digestTime.split(":").map(Number);
    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
      return true;
    }

    return localContext.minutesOfDay >= hours * 60 + minutes;
  }

  private toMonthlyCost(subscription: Subscription) {
    if (subscription.billingPeriod === "DAILY") {
      return Number(subscription.price) * 30;
    }

    if (subscription.billingPeriod === "YEARLY") {
      return Number(subscription.price) / 12;
    }

    return Number(subscription.price);
  }

  private toYearlyCost(subscription: Subscription) {
    if (subscription.billingPeriod === "DAILY") {
      return Number(subscription.price) * 365;
    }

    if (subscription.billingPeriod === "MONTHLY") {
      return Number(subscription.price) * 12;
    }

    return Number(subscription.price);
  }

  private getErrorMessage(error: unknown) {
    if (error instanceof Error) {
      return error.message;
    }

    return String(error);
  }
}
