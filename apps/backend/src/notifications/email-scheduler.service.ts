import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Cron } from "@nestjs/schedule";
import { PrismaService } from "../prisma/prisma.service";
import { EmailService } from "./email.service";

@Injectable()
export class EmailSchedulerService {
  private readonly logger = new Logger(EmailSchedulerService.name);

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private email: EmailService,
  ) {}

  /**
   * Runs on a configurable cron schedule and sends precharge reminder emails.
   */
  @Cron(process.env.EMAIL_REMINDER_CRON ?? "0 8 * * *", {
    name: "daily-charge-reminders",
    timeZone: process.env.EMAIL_REMINDER_TIMEZONE ?? "UTC",
  })
  async sendDailyChargeReminders(): Promise<void> {
    this.logger.log("Running daily charge-reminder job...");

    const today = new Date();
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );

    const usersWithSettings = await this.prisma.notificationSettings.findMany({
      where: { smartAlertsEnabled: true },
      include: { user: true },
    });

    let sent = 0;
    let skipped = 0;

    for (const { user, prechargeReminderDays } of usersWithSettings) {
      if (!user.email) {
        skipped++;
        continue;
      }

      const reminderWindow = prechargeReminderDays ?? 1;
      const cutoff = new Date(startOfToday);
      cutoff.setDate(cutoff.getDate() + reminderWindow);

      const upcoming = await this.prisma.subscription.findMany({
        where: {
          userId: user.id,
          isActive: true,
          nextChargeDate: {
            gte: startOfToday,
            lte: cutoff,
          },
        },
        orderBy: { nextChargeDate: "asc" },
      });

      if (upcoming.length === 0) {
        skipped++;
        continue;
      }

      const items = upcoming.map((sub) => {
        const chargeDate = new Date(
          sub.nextChargeDate.getFullYear(),
          sub.nextChargeDate.getMonth(),
          sub.nextChargeDate.getDate(),
        );
        const daysUntil = Math.floor(
          (chargeDate.getTime() - startOfToday.getTime()) / 86_400_000,
        );

        return {
          name: sub.name,
          price: Number(sub.price),
          currency: user.currency ?? "USD",
          daysUntil,
        };
      });

      const userName = user.email.split("@")[0];
      const appUrl =
        this.config.get<string>("APP_URL") ?? "http://localhost:3000";
      const html = EmailService.buildChargeReminderHtml(
        userName,
        items,
        appUrl,
      );

      await this.email.send({
        to: user.email,
        subject: `ControlMe: ${upcoming.length} subscription${upcoming.length > 1 ? "s" : ""} charging soon`,
        html,
      });

      sent++;
    }

    this.logger.log(`Daily reminders: ${sent} sent, ${skipped} skipped`);
  }

  /**
   * Expose manual trigger for testing (POST /notifications/trigger-reminders)
   */
  async triggerRemindersNow(): Promise<{ sent: number }> {
    await this.sendDailyChargeReminders();
    return { sent: 1 };
  }
}
