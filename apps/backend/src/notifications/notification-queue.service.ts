import { InjectQueue } from "@nestjs/bullmq";
import { Injectable } from "@nestjs/common";
import { Queue } from "bullmq";
import {
  NOTIFICATIONS_QUEUE,
  SEND_NOTIFICATION_EMAIL_JOB,
  type NotificationEmailJobData,
} from "./notification-queue.types";

@Injectable()
export class NotificationQueueService {
  constructor(
    @InjectQueue(NOTIFICATIONS_QUEUE)
    private readonly queue: Queue<NotificationEmailJobData>,
  ) {}

  async enqueueEmail(data: NotificationEmailJobData) {
    return this.queue.add(SEND_NOTIFICATION_EMAIL_JOB, data, {
      jobId: data.jobId,
    });
  }

  async getStats() {
    const counts = await this.queue.getJobCounts(
      "waiting",
      "active",
      "completed",
      "failed",
      "delayed",
    );

    return {
      waiting: counts.waiting ?? 0,
      active: counts.active ?? 0,
      completed: counts.completed ?? 0,
      failed: counts.failed ?? 0,
      delayed: counts.delayed ?? 0,
    };
  }

  async checkConnection() {
    const counts = await this.getStats();
    return {
      status: "up" as const,
      counts,
    };
  }
}
