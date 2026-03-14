import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { APP_GUARD } from "@nestjs/core";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { ScheduleModule } from "@nestjs/schedule";
import { AuthModule } from "./auth/auth.module";
import { SubscriptionsModule } from "./subscriptions/subscriptions.module";
import { AnalyticsModule } from "./analytics/analytics.module";
import { ExportModule } from "./export/export.module";
import { PrismaModule } from "./prisma/prisma.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { CatalogModule } from "./catalog/catalog.module";
import { CacheModule } from "./cache/cache.module";
import { LoggerMiddleware } from "./common/middleware/logger.middleware";
import { validateEnvironment } from "./config/environment";
import { RedisModule } from "./common/redis/redis.module";
import { RedisService } from "./common/redis/redis.service";
import { RedisThrottlerStorage } from "./common/throttling/redis-throttler.storage";
import { HealthModule } from "./health/health.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      validate: validateEnvironment,
    }),
    RedisModule,
    ScheduleModule.forRoot(),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule, RedisModule],
      inject: [ConfigService, RedisService],
      useFactory: async (
        configService: ConfigService,
        redisService: RedisService,
      ) => ({
        storage: new RedisThrottlerStorage(redisService),
        throttlers: [
          {
            name: "global",
            ttl: configService.get<number>("THROTTLE_TTL_MS") ?? 60_000,
            limit: configService.get<number>("THROTTLE_LIMIT") ?? 100,
            blockDuration:
              configService.get<number>("THROTTLE_BLOCK_MS") ?? 300_000,
          },
        ],
        setHeaders: true,
      }),
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          url: configService.get<string>("REDIS_URL"),
        },
        prefix: configService.get<string>("QUEUE_PREFIX") ?? "controlme",
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: "exponential",
            delay: 1_000,
          },
          removeOnComplete: 100,
          removeOnFail: 200,
        },
      }),
    }),
    CacheModule,
    PrismaModule,
    AuthModule,
    SubscriptionsModule,
    AnalyticsModule,
    ExportModule,
    NotificationsModule,
    CatalogModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes("*");
  }
}
