import { Module } from "@nestjs/common";
import { CacheModule } from "../cache/cache.module";
import { SubscriptionsService } from "./subscriptions.service";
import { SubscriptionsController } from "./subscriptions.controller";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule, CacheModule],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
