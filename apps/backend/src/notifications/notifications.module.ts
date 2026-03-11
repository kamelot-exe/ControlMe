import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "../prisma/prisma.module";
import { NotificationsController } from "./notifications.controller";
import { NotificationsService } from "./notifications.service";
import { NotificationSettingsController } from "./notification-settings.controller";
import { EmailService } from "./email.service";
import { EmailSchedulerService } from "./email-scheduler.service";
import { NotificationsEmailController } from "./notifications-email.controller";

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [
    NotificationsController,
    NotificationSettingsController,
    NotificationsEmailController,
  ],
  providers: [NotificationsService, EmailService, EmailSchedulerService],
  exports: [EmailService],
})
export class NotificationsModule {}
