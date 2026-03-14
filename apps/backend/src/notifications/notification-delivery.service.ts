import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { PrismaService } from "../prisma/prisma.service";

export type NotificationDeliveryType =
  | "RENEWAL"
  | "UNUSED"
  | "WEEKLY_DIGEST"
  | "MONTHLY_DIGEST";

export type NotificationDeliveryStatus =
  | "PENDING"
  | "SENT"
  | "SKIPPED"
  | "FAILED";

type DeliveryRecord = Awaited<
  ReturnType<PrismaService["notificationDelivery"]["findUnique"]>
>;

export interface ReserveNotificationDeliveryParams {
  userId: string;
  subscriptionId?: string | null;
  type: NotificationDeliveryType;
  dedupeKey: string;
  scheduledFor?: Date | null;
  payload?: Prisma.InputJsonValue | null;
  maxAttempts?: number;
}

export interface ReserveNotificationDeliveryResult {
  acquired: boolean;
  reason:
    | "created"
    | "pending"
    | "sent"
    | "skipped"
    | "retry"
    | "max-attempts"
    | "missing";
  delivery: DeliveryRecord;
}

@Injectable()
export class NotificationDeliveryService {
  constructor(private readonly prisma: PrismaService) {}

  async exists(
    dedupeKey: string,
    statuses: NotificationDeliveryStatus[] = ["PENDING", "SENT", "SKIPPED"],
  ) {
    const delivery = await this.prisma.notificationDelivery.findUnique({
      where: { dedupeKey },
      select: { id: true, status: true },
    });

    return !!delivery && statuses.includes(delivery.status as NotificationDeliveryStatus);
  }

  async reserve(
    params: ReserveNotificationDeliveryParams,
  ): Promise<ReserveNotificationDeliveryResult> {
    const now = new Date();
    const maxAttempts = Math.max(params.maxAttempts ?? 3, 1);

    try {
      const created = await this.prisma.notificationDelivery.create({
        data: {
          userId: params.userId,
          subscriptionId: params.subscriptionId ?? null,
          type: params.type,
          dedupeKey: params.dedupeKey,
          status: "PENDING",
          scheduledFor: params.scheduledFor ?? null,
          attemptCount: 1,
          lastAttemptAt: now,
          lastError: null,
          payload: params.payload ?? undefined,
        },
      });

      return {
        acquired: true,
        reason: "created",
        delivery: created,
      };
    } catch (error) {
      if (
        !(error instanceof PrismaClientKnownRequestError) ||
        error.code !== "P2002"
      ) {
        throw error;
      }
    }

    const existing = await this.prisma.notificationDelivery.findUnique({
      where: { dedupeKey: params.dedupeKey },
    });

    if (!existing) {
      return {
        acquired: false,
        reason: "missing",
        delivery: existing,
      };
    }

    if (existing.status === "SENT") {
      return { acquired: false, reason: "sent", delivery: existing };
    }

    if (existing.status === "SKIPPED") {
      return { acquired: false, reason: "skipped", delivery: existing };
    }

    if (existing.status === "PENDING") {
      return { acquired: false, reason: "pending", delivery: existing };
    }

    if (existing.attemptCount >= maxAttempts) {
      return { acquired: false, reason: "max-attempts", delivery: existing };
    }

    const retried = await this.prisma.notificationDelivery.update({
      where: { dedupeKey: params.dedupeKey },
      data: {
        status: "PENDING",
        subscriptionId: params.subscriptionId ?? existing.subscriptionId,
        scheduledFor: params.scheduledFor ?? existing.scheduledFor,
        attemptCount: { increment: 1 },
        lastAttemptAt: now,
        lastError: null,
        payload: params.payload ?? existing.payload ?? undefined,
      },
    });

    return {
      acquired: true,
      reason: "retry",
      delivery: retried,
    };
  }

  async markSent(params: {
    dedupeKey: string;
    payload?: Prisma.InputJsonValue | null;
  }) {
    return this.prisma.notificationDelivery.update({
      where: { dedupeKey: params.dedupeKey },
      data: {
        status: "SENT",
        sentAt: new Date(),
        lastError: null,
        payload: params.payload ?? undefined,
      },
    });
  }

  async markFailed(params: {
    dedupeKey: string;
    error: string;
    payload?: Prisma.InputJsonValue | null;
  }) {
    return this.prisma.notificationDelivery.update({
      where: { dedupeKey: params.dedupeKey },
      data: {
        status: "FAILED",
        lastError: params.error.slice(0, 1000),
        payload: params.payload ?? undefined,
      },
    });
  }

  async isUserRateLimited(params: {
    userId: string;
    dailyLimit: number;
    minimumIntervalMinutes: number;
    now?: Date;
  }) {
    const now = params.now ?? new Date();
    const since = new Date(now.getTime() - 86_400_000);

    const [sentCount24h, latestSent] = await Promise.all([
      params.dailyLimit > 0
        ? this.prisma.notificationDelivery.count({
            where: {
              userId: params.userId,
              status: "SENT",
              sentAt: {
                gte: since,
              },
            },
          })
        : Promise.resolve(0),
      params.minimumIntervalMinutes > 0
        ? this.prisma.notificationDelivery.findFirst({
            where: {
              userId: params.userId,
              status: "SENT",
              sentAt: { not: null },
            },
            orderBy: { sentAt: "desc" },
            select: { sentAt: true },
          })
        : Promise.resolve(null),
    ]);

    if (params.dailyLimit > 0 && sentCount24h >= params.dailyLimit) {
      return {
        limited: true,
        reason: "daily-limit" as const,
        sentCount24h,
        latestSentAt: latestSent?.sentAt ?? null,
      };
    }

    if (
      params.minimumIntervalMinutes > 0 &&
      latestSent?.sentAt &&
      now.getTime() - latestSent.sentAt.getTime() <
        params.minimumIntervalMinutes * 60_000
    ) {
      return {
        limited: true,
        reason: "cooldown" as const,
        sentCount24h,
        latestSentAt: latestSent.sentAt,
      };
    }

    return {
      limited: false,
      reason: null,
      sentCount24h,
      latestSentAt: latestSent?.sentAt ?? null,
    };
  }

  async record(params: {
    userId: string;
    subscriptionId?: string | null;
    type: NotificationDeliveryType;
    dedupeKey: string;
    status: NotificationDeliveryStatus;
    scheduledFor?: Date | null;
    sentAt?: Date | null;
    attemptCount?: number;
    lastAttemptAt?: Date | null;
    lastError?: string | null;
    payload?: Prisma.InputJsonValue | null;
  }) {
    return this.prisma.notificationDelivery.upsert({
      where: { dedupeKey: params.dedupeKey },
      create: {
        userId: params.userId,
        subscriptionId: params.subscriptionId ?? null,
        type: params.type,
        dedupeKey: params.dedupeKey,
        status: params.status,
        scheduledFor: params.scheduledFor ?? null,
        sentAt: params.sentAt ?? null,
        attemptCount: params.attemptCount ?? 0,
        lastAttemptAt: params.lastAttemptAt ?? null,
        lastError: params.lastError ?? null,
        payload: params.payload ?? undefined,
      },
      update: {
        status: params.status,
        scheduledFor: params.scheduledFor ?? null,
        sentAt: params.sentAt ?? null,
        attemptCount: params.attemptCount,
        lastAttemptAt: params.lastAttemptAt ?? null,
        lastError: params.lastError ?? null,
        payload: params.payload ?? undefined,
      },
    });
  }
}
