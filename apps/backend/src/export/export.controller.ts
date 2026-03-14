import { Controller, Get, Query, Res, UseGuards } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { Response } from "express";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../auth/interfaces/authenticated-user.interface";
import { ExportPreviewQueryDto } from "./dto/export-preview-query.dto";
import { ExportService } from "./export.service";

@Controller("export")
@UseGuards(JwtAuthGuard)
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Throttle({ global: { limit: 10, ttl: 60000 } })
  @Get("preview")
  async preview(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ExportPreviewQueryDto,
  ) {
    return this.exportService.getPreview(user.id, query.limit);
  }

  @Throttle({ global: { limit: 3, ttl: 60000 } })
  @Get("pdf")
  async getPDF(@CurrentUser() user: AuthenticatedUser, @Res() res: Response) {
    return this.exportService.generatePDF(user.id, res);
  }

  @Throttle({ global: { limit: 5, ttl: 60000 } })
  @Get("csv")
  async exportCsv(
    @CurrentUser() user: AuthenticatedUser,
    @Res() res: Response,
  ) {
    const csv = await this.exportService.exportSubscriptionsCsv(user.id);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="subscriptions.csv"',
    );
    res.send(csv);
  }
}
