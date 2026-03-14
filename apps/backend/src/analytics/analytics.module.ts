import { Module } from "@nestjs/common";
import { CacheModule } from "../cache/cache.module";
import { AnalyticsService } from "./analytics.service";
import { AnalyticsController } from "./analytics.controller";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule, CacheModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
