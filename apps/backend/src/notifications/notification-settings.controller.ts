import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../auth/interfaces/authenticated-user.interface";
import { NotificationsService } from "./notifications.service";
import { UpdateNotificationSettingsDto } from "./dto/update-notification-settings.dto";
import type { NotificationSettings } from "@/shared/types";

@Controller("settings/notifications")
@UseGuards(JwtAuthGuard)
export class NotificationSettingsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getSettings(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<NotificationSettings> {
    return this.notificationsService.getOrCreateNotificationSettings(user.id);
  }

  @Patch()
  async updateSettings(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateNotificationSettingsDto,
  ): Promise<NotificationSettings> {
    return this.notificationsService.updateNotificationSettings(user.id, dto);
  }
}
