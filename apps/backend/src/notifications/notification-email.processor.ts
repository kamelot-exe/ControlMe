import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { Job } from "bullmq";
import { EmailService } from "./email.service";
import { NotificationDeliveryService } from "./notification-delivery.service";
import {
  NOTIFICATIONS_QUEUE,
  SEND_NOTIFICATION_EMAIL_JOB,
  type NotificationEmailJobData,
} from "./notification-queue.types";

@Processor(NOTIFICATIONS_QUEUE, {
  concurrency: Number(process.env.QUEUE_CONCURRENCY ?? 5),
})
export class NotificationEmailProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationEmailProcessor.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly deliveryService: NotificationDeliveryService,
  ) {
    super();
  }

  async process(job: Job<NotificationEmailJobData>) {
    if (job.name !== SEND_NOTIFICATION_EMAIL_JOB) {
      throw new Error(`Unsupported notification job: ${job.name}`);
    }

    try {
      await this.emailService.send({
        to: job.data.to,
        subject: job.data.subject,
        html: job.data.html,
      });

      await Promise.all(
        job.data.deliveries.map((delivery) =>
          this.deliveryService.markSent({
            dedupeKey: delivery.dedupeKey,
            payload: delivery.payload ?? undefined,
          }),
        ),
      );

      return {
        delivered: true,
        deliveries: job.data.deliveries.length,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown queue delivery error";

      await Promise.all(
        job.data.deliveries.map((delivery) =>
          this.deliveryService.markFailed({
            dedupeKey: delivery.dedupeKey,
            error: message,
            payload: delivery.payload ?? undefined,
          }),
        ),
      );

      this.logger.error(
        `Notification job ${job.id ?? "unknown"} failed: ${message}`,
      );
      throw error;
    }
  }
}
