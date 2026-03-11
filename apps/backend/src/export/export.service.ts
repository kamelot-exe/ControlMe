import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AnalyticsService } from "../analytics/analytics.service";
import PDFDocument from "pdfkit";
import { Response } from "express";

@Injectable()
export class ExportService {
  constructor(
    private prisma: PrismaService,
    private analyticsService: AnalyticsService,
  ) {}

  async generatePDF(userId: string, res: Response) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const subscriptions = await this.prisma.subscription.findMany({
      where: { userId },
      orderBy: { nextChargeDate: "asc" },
    });

    const analytics = await this.analyticsService.getMonthlyAnalytics(userId);

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=controlme-export-${Date.now()}.pdf`,
    );

    doc.pipe(res);

    // Header
    doc.fontSize(20).text("ControlMe - Financial Summary", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Generated: ${new Date().toLocaleDateString()}`, {
      align: "center",
    });
    doc.moveDown(2);

    // Summary
    doc.fontSize(16).text("Monthly Summary", { underline: true });
    doc.moveDown();
    doc
      .fontSize(12)
      .text(
        `Total Monthly Cost: ${user.currency} ${analytics.totalMonthlyCost.toFixed(2)}`,
      );
    doc.text(
      `Total Yearly Cost: ${user.currency} ${analytics.totalYearlyCost.toFixed(2)}`,
    );
    doc.text(`Active Subscriptions: ${analytics.activeSubscriptions}`);
    doc.moveDown(2);

    // Category Breakdown
    if (analytics.categoryBreakdown.length > 0) {
      doc.fontSize(16).text("Category Breakdown", { underline: true });
      doc.moveDown();
      analytics.categoryBreakdown.forEach((cat) => {
        doc
          .fontSize(12)
          .text(
            `${cat.category}: ${user.currency} ${cat.total.toFixed(2)} (${cat.count} subscriptions)`,
          );
      });
      doc.moveDown(2);
    }

    // Subscriptions List
    doc.fontSize(16).text("Subscriptions", { underline: true });
    doc.moveDown();

    subscriptions.forEach((sub, index) => {
      if (index > 0 && index % 5 === 0) {
        doc.addPage();
      }

      doc.fontSize(12).text(`${sub.name}`, { continued: true });
      doc.fontSize(10);
      doc.fillColor(sub.isActive ? "black" : "gray");
      doc.text(
        ` - ${user.currency} ${Number(sub.price).toFixed(2)}/${sub.billingPeriod.toLowerCase()}`,
      );
      doc.fillColor("black"); // Reset to black
      doc.text(
        `Next Charge: ${new Date(sub.nextChargeDate).toLocaleDateString()}`,
      );
      doc.text(`Category: ${sub.category}`);
      if (sub.notes) {
        doc.text(`Notes: ${sub.notes}`);
      }
      doc.moveDown();
    });

    doc.end();
  }

  async exportSubscriptionsCsv(userId: string): Promise<string> {
    const subscriptions = await this.prisma.subscription.findMany({
      where: { userId },
      include: { usage: true },
      orderBy: { createdAt: "asc" },
    });

    const escapeField = (value: string | null | undefined): string => {
      if (value === null || value === undefined) return "";
      const str = String(value);
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const headers =
      "Name,Price,Billing Period,Category,Next Charge Date,Active,Notes";

    const rows = subscriptions.map((sub) => {
      const fields = [
        escapeField(sub.name),
        escapeField(String(Number(sub.price))),
        escapeField(sub.billingPeriod),
        escapeField(sub.category),
        escapeField(new Date(sub.nextChargeDate).toLocaleDateString()),
        escapeField(sub.isActive ? "Yes" : "No"),
        escapeField(sub.notes),
      ];
      return fields.join(",");
    });

    return [headers, ...rows].join("\n");
  }
}
