import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: Redis;

  constructor(private readonly configService: ConfigService) {
    const redisUrl = this.configService.get<string>("REDIS_URL");
    if (!redisUrl) {
      throw new Error("REDIS_URL environment variable is required");
    }

    this.client = new Redis(redisUrl, {
      enableReadyCheck: true,
      lazyConnect: true,
      maxRetriesPerRequest: null,
      connectTimeout:
        this.configService.get<number>("REDIS_CONNECT_TIMEOUT_MS") ?? 10_000,
    });

    this.client.on("connect", () => {
      this.logger.log("Redis connection established");
    });

    this.client.on("error", (error) => {
      this.logger.error(`Redis error: ${error.message}`);
    });
  }

  getClient() {
    return this.client;
  }

  async ensureReady() {
    if (this.client.status === "ready" || this.client.status === "connect") {
      return;
    }

    if (this.client.status === "connecting") {
      await this.client.ping();
      return;
    }

    await this.client.connect();
  }

  async ping() {
    await this.ensureReady();
    return this.client.ping();
  }

  async onModuleDestroy() {
    if (this.client.status !== "end") {
      await this.client.quit();
    }
  }
}
