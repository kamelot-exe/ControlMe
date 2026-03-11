import { Controller, Get, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('monthly')
  getMonthly(@CurrentUser() user: AuthenticatedUser) {
    return this.analyticsService.getMonthlyAnalytics(user.id);
  }

  @Get('categories')
  getCategories(@CurrentUser() user: AuthenticatedUser) {
    return this.analyticsService.getCategoryBreakdown(user.id);
  }

  @Get('savings')
  getSavings(@CurrentUser() user: AuthenticatedUser) {
    return this.analyticsService.getSavingsSummary(user.id);
  }

  @Get('history')
  getHistory(@CurrentUser() user: AuthenticatedUser) {
    return this.analyticsService.getSpendingHistory(user.id);
  }
}
