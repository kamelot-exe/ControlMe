import { Module } from "@nestjs/common";
import { CacheModule } from "../cache/cache.module";
import { ExportService } from "./export.service";
import { ExportController } from "./export.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { AnalyticsModule } from "../analytics/analytics.module";

@Module({
  imports: [PrismaModule, AnalyticsModule, CacheModule],
  controllers: [ExportController],
  providers: [ExportService],
})
export class ExportModule {}
