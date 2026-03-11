import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Put,
  Param,
  Delete,
  UseGuards,
} from "@nestjs/common";
import { SubscriptionsService } from "./subscriptions.service";
import { CreateSubscriptionDto } from "./dto/create-subscription.dto";
import { UpdateSubscriptionDto } from "./dto/update-subscription.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../auth/interfaces/authenticated-user.interface";

@Controller("subscriptions")
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post("import")
  importCsv(@CurrentUser() user: AuthenticatedUser, @Body("csv") csv: string) {
    return this.subscriptionsService.importFromCsv(user.id, csv);
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

  @Post(":id/confirm-use")
  confirmUse(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.subscriptionsService.confirmUse(id, user.id);
  }
}
