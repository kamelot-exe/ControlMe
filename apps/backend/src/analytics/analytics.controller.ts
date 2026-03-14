import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../auth/interfaces/authenticated-user.interface";
import { AnalyticsService } from "./analytics.service";
import { AnalyticsHistoryQueryDto } from "./dto/analytics-history-query.dto";

@Controller("analytics")
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get("monthly")
  getMonthly(@CurrentUser() user: AuthenticatedUser) {
    return this.analyticsService.getMonthlyAnalytics(user.id);
  }

  @Get("overview")
  getOverview(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: AnalyticsHistoryQueryDto,
  ) {
    return this.analyticsService.getOverview(user.id, query.months);
  }

  @Get("categories")
  getCategories(@CurrentUser() user: AuthenticatedUser) {
    return this.analyticsService.getCategoryBreakdown(user.id);
  }

  @Get("savings")
  getSavings(@CurrentUser() user: AuthenticatedUser) {
    return this.analyticsService.getSavingsSummary(user.id);
  }

  @Get("history")
  getHistory(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: AnalyticsHistoryQueryDto,
  ) {
    return this.analyticsService.getSpendingHistory(user.id, query.months);
  }
}
