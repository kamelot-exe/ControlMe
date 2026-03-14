import { Injectable } from "@nestjs/common";
import { ThrottlerStorage } from "@nestjs/throttler";
import { RedisService } from "../redis/redis.service";

type ThrottlerStorageRecord = Awaited<
  ReturnType<ThrottlerStorage["increment"]>
>;

@Injectable()
export class RedisThrottlerStorage implements ThrottlerStorage {
  constructor(private readonly redisService: RedisService) {}

  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    throttlerName: string,
  ): Promise<ThrottlerStorageRecord> {
    const client = this.redisService.getClient();
    await this.redisService.ensureReady();

    const hitsKey = `throttle:${throttlerName}:${key}`;
    const blockKey = `throttle:${throttlerName}:block:${key}`;

    const blockTtl = await client.pttl(blockKey);
    if (blockTtl > 0) {
      const [rawHits, hitsTtl] = await Promise.all([
        client.get(hitsKey),
        client.pttl(hitsKey),
      ]);

      return {
        totalHits: Number(rawHits ?? limit),
        timeToExpire: Math.max(hitsTtl, 0),
        isBlocked: true,
        timeToBlockExpire: blockTtl,
      };
    }

    const totalHits = await client.incr(hitsKey);
    if (totalHits === 1) {
      await client.pexpire(hitsKey, ttl);
    }

    const timeToExpire = Math.max(await client.pttl(hitsKey), 0);

    if (totalHits > limit) {
      const effectiveBlockDuration = blockDuration > 0 ? blockDuration : ttl;
      await client.set(blockKey, "1", "PX", effectiveBlockDuration);

      return {
        totalHits,
        timeToExpire,
        isBlocked: true,
        timeToBlockExpire: effectiveBlockDuration,
      };
    }

    return {
      totalHits,
      timeToExpire,
      isBlocked: false,
      timeToBlockExpire: 0,
    };
  }
}
