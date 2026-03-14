import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CacheModule } from "../cache/cache.module";
import { InternalJobGuard } from "../common/guards/internal-job.guard";
import { PrismaModule } from "../prisma/prisma.module";
import { EmailSchedulerService } from "./email-scheduler.service";
import { EmailService } from "./email.service";
import { NotificationDeliveryService } from "./notification-delivery.service";
import { NotificationEmailProcessor } from "./notification-email.processor";
import { NotificationsEmailController } from "./notifications-email.controller";
import { NotificationQueueService } from "./notification-queue.service";
import { NOTIFICATIONS_QUEUE } from "./notification-queue.types";
import { NotificationSettingsController } from "./notification-settings.controller";
import { NotificationsController } from "./notifications.controller";
import { NotificationsService } from "./notifications.service";

@Module({
  imports: [
    PrismaModule,
    ConfigModule,
    CacheModule,
    BullModule.registerQueue({
      name: NOTIFICATIONS_QUEUE,
    }),
  ],
  controllers: [
    NotificationsController,
    NotificationSettingsController,
    NotificationsEmailController,
  ],
  providers: [
    NotificationsService,
    EmailService,
    EmailSchedulerService,
    NotificationDeliveryService,
    NotificationQueueService,
    NotificationEmailProcessor,
    InternalJobGuard,
  ],
  exports: [EmailService, NotificationDeliveryService, NotificationQueueService],
})
export class NotificationsModule {}
