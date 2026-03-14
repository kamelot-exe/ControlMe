import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import type { AuthenticatedUser } from "../auth/interfaces/authenticated-user.interface";
import { CreateSubscriptionDto } from "./dto/create-subscription.dto";
import { ImportSubscriptionsDto } from "./dto/import-subscriptions.dto";
import { ListSubscriptionsQueryDto } from "./dto/list-subscriptions-query.dto";
import { UpdateSubscriptionDto } from "./dto/update-subscription.dto";
import { SubscriptionsService } from "./subscriptions.service";

@Controller("subscriptions")
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Throttle({ global: { limit: 5, ttl: 60000 } })
  @Post("import")
  importCsv(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ImportSubscriptionsDto,
  ) {
    return this.subscriptionsService.importFromCsv(user.id, dto.csv);
  }

  @Get("list")
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListSubscriptionsQueryDto,
  ) {
    return this.subscriptionsService.findPage(user.id, query);
  }

  @Get("overview")
  overview(@CurrentUser() user: AuthenticatedUser) {
    return this.subscriptionsService.getOverview(user.id);
  }

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() createSubscriptionDto: CreateSubscriptionDto,
  ) {
    return this.subscriptionsService.create(user.id, createSubscriptionDto);
  }

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.subscriptionsService.findAll(user.id);
  }

  @Get(":id")
  findOne(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.subscriptionsService.findOne(id, user.id);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
  ) {
    return this.subscriptionsService.update(id, user.id, updateSubscriptionDto);
  }

  @Put(":id")
  replace(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
  ) {
    return this.subscriptionsService.update(id, user.id, updateSubscriptionDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.subscriptionsService.remove(id, user.id);
  }
}
