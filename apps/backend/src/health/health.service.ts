import {
  Injectable,
  ServiceUnavailableException,
  type INestApplication,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import { RedisService } from "../common/redis/redis.service";
import { NotificationQueueService } from "../notifications/notification-queue.service";

@Injectable()
export class HealthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
    private readonly notificationQueueService: NotificationQueueService,
  ) {}

  async getLiveness() {
    return {
      status: "ok",
      service: "controlme-backend",
      version: this.configService.get<string>("APP_VERSION") ?? "0.1.0",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
    };
  }

  async getReadiness() {
    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkNotificationQueue(),
    ]);

    const result = {
      status: checks.every((check) => check.status === "fulfilled")
        ? "ok"
        : "degraded",
      timestamp: new Date().toISOString(),
      checks: {
        database:
          checks[0].status === "fulfilled"
            ? checks[0].value
            : { status: "down", message: checks[0].reason.message },
        redis:
          checks[1].status === "fulfilled"
            ? checks[1].value
            : { status: "down", message: checks[1].reason.message },
        queue:
          checks[2].status === "fulfilled"
            ? checks[2].value
            : { status: "down", message: checks[2].reason.message },
      },
    };

    if (result.status !== "ok") {
      throw new ServiceUnavailableException(result);
    }

    return result;
  }

  async getMetrics() {
    const [queueStats, databaseConnected, redisConnected] = await Promise.all([
      this.notificationQueueService.getStats(),
      this.checkDatabase().then(() => 1).catch(() => 0),
      this.checkRedis().then(() => 1).catch(() => 0),
    ]);

    const memory = process.memoryUsage();
    const metrics = [
      "# HELP controlme_process_uptime_seconds Process uptime in seconds.",
      "# TYPE controlme_process_uptime_seconds gauge",
      `controlme_process_uptime_seconds ${process.uptime().toFixed(2)}`,
      "# HELP controlme_process_resident_memory_bytes Resident set size in bytes.",
      "# TYPE controlme_process_resident_memory_bytes gauge",
      `controlme_process_resident_memory_bytes ${memory.rss}`,
      "# HELP controlme_database_up Database availability.",
      "# TYPE controlme_database_up gauge",
      `controlme_database_up ${databaseConnected}`,
      "# HELP controlme_redis_up Redis availability.",
      "# TYPE controlme_redis_up gauge",
      `controlme_redis_up ${redisConnected}`,
      "# HELP controlme_notification_queue_waiting_jobs Waiting notification jobs.",
      "# TYPE controlme_notification_queue_waiting_jobs gauge",
      `controlme_notification_queue_waiting_jobs ${queueStats.waiting}`,
      "# HELP controlme_notification_queue_active_jobs Active notification jobs.",
      "# TYPE controlme_notification_queue_active_jobs gauge",
      `controlme_notification_queue_active_jobs ${queueStats.active}`,
      "# HELP controlme_notification_queue_delayed_jobs Delayed notification jobs.",
      "# TYPE controlme_notification_queue_delayed_jobs gauge",
      `controlme_notification_queue_delayed_jobs ${queueStats.delayed}`,
      "# HELP controlme_notification_queue_failed_jobs Failed notification jobs.",
      "# TYPE controlme_notification_queue_failed_jobs gauge",
      `controlme_notification_queue_failed_jobs ${queueStats.failed}`,
      "# HELP controlme_notification_queue_completed_jobs Completed notification jobs.",
      "# TYPE controlme_notification_queue_completed_jobs gauge",
      `controlme_notification_queue_completed_jobs ${queueStats.completed}`,
    ];

    return metrics.join("\n");
  }

  async enableGracefulShutdown(app: INestApplication) {
    app.enableShutdownHooks();
  }

  private async checkDatabase() {
    await this.prisma.$queryRawUnsafe("SELECT 1");
    return { status: "up" };
  }

  private async checkRedis() {
    const response = await this.redisService.ping();
    return { status: response === "PONG" ? "up" : "down" };
  }

  private async checkNotificationQueue() {
    const queue = await this.notificationQueueService.checkConnection();
    return {
      status: queue.status,
      counts: queue.counts,
    };
  }
}
