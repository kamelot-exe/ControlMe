import type { Prisma } from "@prisma/client";

export const NOTIFICATIONS_QUEUE = "notifications";
export const SEND_NOTIFICATION_EMAIL_JOB = "send-notification-email";

export interface NotificationEmailDeliveryPayload {
  dedupeKey: string;
  payload?: Prisma.InputJsonValue | null;
}

export interface NotificationEmailJobData {
  jobId: string;
  to: string;
  subject: string;
  html: string;
  deliveries: NotificationEmailDeliveryPayload[];
}
