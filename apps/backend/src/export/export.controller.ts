import { Controller, Get, UseGuards, Res } from "@nestjs/common";
import { Response } from "express";
import { ExportService } from "./export.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../auth/interfaces/authenticated-user.interface";

@Controller("export")
@UseGuards(JwtAuthGuard)
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Get("pdf")
  async getPDF(@CurrentUser() user: AuthenticatedUser, @Res() res: Response) {
    return this.exportService.generatePDF(user.id, res);
  }

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
