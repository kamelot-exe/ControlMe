import { Module } from "@nestjs/common";
import { CacheModule } from "../cache/cache.module";
import { PrismaModule } from "../prisma/prisma.module";
import { CatalogMatchingService } from "./catalog-matching.service";
import { CatalogController } from "./catalog.controller";
import { CatalogService } from "./catalog.service";

@Module({
  imports: [PrismaModule, CacheModule],
  controllers: [CatalogController],
  providers: [CatalogService, CatalogMatchingService],
  exports: [CatalogService, CatalogMatchingService],
})
export class CatalogModule {}
