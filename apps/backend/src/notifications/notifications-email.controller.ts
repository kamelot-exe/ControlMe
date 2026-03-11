import { Controller, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../auth/interfaces/authenticated-user.interface";
import { EmailSchedulerService } from "./email-scheduler.service";

@Controller("notifications")
export class NotificationsEmailController {
  constructor(private scheduler: EmailSchedulerService) {}

  /**
   * POST /notifications/trigger-reminders
   * Manually fires the daily charge-reminder job.
   * Useful for testing without waiting for the cron window.
   */
  @Post("trigger-reminders")
  @UseGuards(JwtAuthGuard)
  async triggerReminders(@CurrentUser() user: AuthenticatedUser) {
    void user;
    return this.scheduler.triggerRemindersNow();
  }
}
