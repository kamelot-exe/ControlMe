import { Controller, Post, UseGuards } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { InternalJobGuard } from "../common/guards/internal-job.guard";
import { EmailSchedulerService } from "./email-scheduler.service";

@Controller("notifications")
export class NotificationsEmailController {
  constructor(private readonly scheduler: EmailSchedulerService) {}

  @Throttle({ global: { limit: 3, ttl: 60000 } })
  @Post("trigger-reminders")
  @UseGuards(InternalJobGuard)
  async triggerReminders() {
    return this.scheduler.triggerRemindersNow();
  }
}
