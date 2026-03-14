import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../auth/interfaces/authenticated-user.interface";
import { ListNotificationHistoryQueryDto } from "./dto/list-notification-history-query.dto";
import { NotificationsService } from "./notifications.service";

@Controller("notifications")
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get("smart")
  async getSmartAlerts(@CurrentUser() user: AuthenticatedUser) {
    const alerts = await this.notificationsService.getSmartAlerts(user.id);
    return { alerts };
  }

  @Get("history")
  async getHistory(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListNotificationHistoryQueryDto,
  ) {
    return this.notificationsService.getHistory(user.id, query);
  }
}
