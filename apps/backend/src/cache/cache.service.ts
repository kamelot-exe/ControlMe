import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";

type CacheValue = {
  expiresAt: number;
  value: string;
};

@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private readonly memoryStore = new Map<string, CacheValue>();
  private readonly redis: Redis | null;

  constructor(private readonly configService: ConfigService) {
    const redisUrl = this.configService.get<string>("REDIS_URL");
    const redisHost = this.configService.get<string>("REDIS_HOST");
    const redisPort = this.configService.get<number>("REDIS_PORT");

    if (redisUrl) {
      this.redis = new Redis(redisUrl, {
        lazyConnect: true,
        maxRetriesPerRequest: 1,
      });
      void this.connectRedis();
      return;
    }

    if (redisHost) {
      this.redis = new Redis({
        host: redisHost,
        port: redisPort ?? 6379,
        password: this.configService.get<string>("REDIS_PASSWORD"),
        lazyConnect: true,
        maxRetriesPerRequest: 1,
      });
      void this.connectRedis();
      return;
    }

    this.redis = null;
    this.logger.log("Redis cache not configured. Falling back to in-memory cache.");
  }

  async get<T>(key: string): Promise<T | null> {
    if (this.redis) {
      const value = await this.redis.get(key);
      return value ? (JSON.parse(value) as T) : null;
    }

    const cached = this.memoryStore.get(key);
    if (!cached) {
      return null;
    }

    if (cached.expiresAt <= Date.now()) {
      this.memoryStore.delete(key);
      return null;
    }

    return JSON.parse(cached.value) as T;
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    const serialized = JSON.stringify(value);

    if (this.redis) {
      await this.redis.set(key, serialized, "EX", ttlSeconds);
      return;
    }

    this.memoryStore.set(key, {
      expiresAt: Date.now() + ttlSeconds * 1000,
      value: serialized,
    });
  }

  async wrap<T>(
    key: string,
    ttlSeconds: number,
    loader: () => Promise<T>,
  ): Promise<{ cached: boolean; value: T }> {
    const cachedValue = await this.get<T>(key);
    if (cachedValue !== null) {
      return {
        cached: true,
        value: cachedValue,
      };
    }

    const value = await loader();
    await this.set(key, value, ttlSeconds);

    return {
      cached: false,
      value,
    };
  }

  async invalidatePrefix(prefix: string): Promise<void> {
    if (this.redis) {
      let cursor = "0";
      do {
        const [nextCursor, keys] = await this.redis.scan(
          cursor,
          "MATCH",
          `${prefix}*`,
          "COUNT",
          "100",
        );
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
        cursor = nextCursor;
      } while (cursor !== "0");

      return;
    }

    for (const key of this.memoryStore.keys()) {
      if (key.startsWith(prefix)) {
        this.memoryStore.delete(key);
      }
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
    }
  }

  private async connectRedis(): Promise<void> {
    if (!this.redis) {
      return;
    }

    try {
      await this.redis.connect();
      this.logger.log("Redis cache connected.");
    } catch (error) {
      this.logger.warn(
        `Redis connection failed. Falling back to in-memory cache: ${(error as Error).message}`,
      );
    }
  }
}
