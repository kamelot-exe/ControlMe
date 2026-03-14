import { Injectable, NotFoundException } from "@nestjs/common";
import type { ExportPreview, Subscription } from "@/shared/types";
import PDFDocument from "pdfkit";
import { Response } from "express";
import { CacheService } from "../cache/cache.service";
import { AnalyticsService } from "../analytics/analytics.service";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ExportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly analyticsService: AnalyticsService,
    private readonly cacheService: CacheService,
  ) {}

  async getPreview(userId: string, limit = 25): Promise<ExportPreview> {
    const cacheKey = `export:${userId}:preview:${limit}`;

    const { value } = await this.cacheService.wrap(cacheKey, 60, async () => {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          currency: true,
        },
      });

      if (!user) {
        throw new NotFoundException("User not found");
      }

      const [summary, savings, subscriptions] = await Promise.all([
        this.analyticsService.getMonthlyAnalytics(userId),
        this.analyticsService.getSavingsSummary(userId),
        this.prisma.subscription.findMany({
          where: { userId },
          include: { usage: true },
          orderBy: { nextChargeDate: "asc" },
          take: limit,
        }),
      ]);

      return {
        generatedAt: new Date().toISOString(),
        currency: user.currency,
        summary,
        savings,
        subscriptions: subscriptions.map(
          (subscription): Subscription => ({
            ...subscription,
            billingPeriod: subscription.billingPeriod as Subscription["billingPeriod"],
            price: Number(subscription.price),
          }),
        ),
      };
    });

    return value;
  }

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

    doc.fontSize(20).text("ControlMe - Financial Summary", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Generated: ${new Date().toLocaleDateString()}`, {
      align: "center",
    });
    doc.moveDown(2);

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

    if (analytics.categoryBreakdown.length > 0) {
      doc.fontSize(16).text("Category Breakdown", { underline: true });
      doc.moveDown();
      analytics.categoryBreakdown.forEach((category) => {
        doc
          .fontSize(12)
          .text(
            `${category.category}: ${user.currency} ${category.total.toFixed(2)} (${category.count} subscriptions)`,
          );
      });
      doc.moveDown(2);
    }

    doc.fontSize(16).text("Subscriptions", { underline: true });
    doc.moveDown();

    subscriptions.forEach((subscription, index) => {
      if (index > 0 && index % 5 === 0) {
        doc.addPage();
      }

      doc.fontSize(12).text(`${subscription.name}`, { continued: true });
      doc.fontSize(10);
      doc.fillColor(subscription.isActive ? "black" : "gray");
      doc.text(
        ` - ${user.currency} ${Number(subscription.price).toFixed(2)}/${subscription.billingPeriod.toLowerCase()}`,
      );
      doc.fillColor("black");
      doc.text(
        `Next Charge: ${new Date(subscription.nextChargeDate).toLocaleDateString()}`,
      );
      doc.text(`Category: ${subscription.category}`);
      if (subscription.notes) {
        doc.text(`Notes: ${subscription.notes}`);
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

    const rows = subscriptions.map((subscription) => {
      const fields = [
        escapeField(subscription.name),
        escapeField(String(Number(subscription.price))),
        escapeField(subscription.billingPeriod),
        escapeField(subscription.category),
        escapeField(new Date(subscription.nextChargeDate).toLocaleDateString()),
        escapeField(subscription.isActive ? "Yes" : "No"),
        escapeField(subscription.notes),
      ];
      return fields.join(",");
    });

    return [headers, ...rows].join("\n");
  }
}
