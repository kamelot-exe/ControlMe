"use client";

import Link from "next/link";
import { CheckCircle2, Pencil } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import type { Currency, Subscription } from "@/shared/types";
import { useConfirmUse } from "@/hooks/use-subscriptions";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDate, getDaysUntil } from "@/lib/utils/format";

interface SubscriptionCardProps {
  subscription: Subscription;
  currency?: Currency;
  onEdit?: (subscription: Subscription) => void;
}

const categoryTokens: Record<string, string> = {
  Streaming: "TV",
  Software: "APP",
  Gym: "FIT",
  Music: "SND",
  Cloud: "CLD",
  News: "NWS",
  Education: "EDU",
  Gaming: "GME",
  Finance: "FIN",
  Other: "SUB",
};

const categoryColors: Record<string, string> = {
  Streaming: "#38BDF8",
  Software: "#4ADE80",
  Gym: "#F87171",
  Music: "#8B5CF6",
  Cloud: "#38BDF8",
  News: "#9CA3AF",
  Education: "#F59E0B",
  Gaming: "#8B5CF6",
  Finance: "#4ADE80",
  Other: "#9CA3AF",
};

export function SubscriptionCard({
  subscription,
  currency = "USD",
  onEdit,
}: SubscriptionCardProps) {
  const confirmUse = useConfirmUse();
  const daysUntil = getDaysUntil(subscription.nextChargeDate);
  const isUpcoming = daysUntil <= 7 && daysUntil >= 0;
  const isOverdue = daysUntil < 0;
  const isToday = daysUntil === 0;
  const isTomorrow = daysUntil === 1;

  const usageStatus = (() => {
    if (!subscription.isActive) return "unused";
    const lastUse = subscription.usage?.lastConfirmedUseAt;

    if (!lastUse) {
      const createdAt = subscription.createdAt ? new Date(subscription.createdAt) : new Date();
      const ageDays = (Date.now() - createdAt.getTime()) / 86_400_000;
      if (ageDays < 14) return "active";
      if (ageDays < 30) return "at_risk";
      return "unused";
    }

    const lastUsedDays = (Date.now() - new Date(lastUse).getTime()) / 86_400_000;
    if (lastUsedDays < 14) return "active";
    if (lastUsedDays < 30) return "at_risk";
    return "unused";
  })();

  const usageVariant =
    usageStatus === "active" ? "success" : usageStatus === "at_risk" ? "warning" : "error";
  const usageLabel =
    usageStatus === "active" ? "Healthy" : usageStatus === "at_risk" ? "At risk" : "Unused";
  const categoryColor = categoryColors[subscription.category] ?? "#9CA3AF";
  const categoryToken = categoryTokens[subscription.category] ?? categoryTokens.Other;

  const statusTag = (() => {
    if (!subscription.isActive) {
      return <Tag variant="error" size="sm">Inactive</Tag>;
    }
    if (isOverdue) {
      return <Tag variant="error" size="sm">Overdue</Tag>;
    }
    if (isToday) {
      return <Tag variant="warning" size="sm">Today</Tag>;
    }
    if (isTomorrow) {
      return <Tag variant="warning" size="sm">Tomorrow</Tag>;
    }
    if (isUpcoming) {
      return <Tag variant="warning" size="sm">{daysUntil}d</Tag>;
    }
    return null;
  })();

  return (
    <Link href={`/subscriptions/${subscription.id}`}>
      <Card className="glass-hover group h-full cursor-pointer overflow-hidden transition-all duration-150 hover:-translate-y-1">
        <div style={{ height: "3px", background: categoryColor, borderRadius: "24px 24px 0 0" }} />

        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-xs font-semibold tracking-[0.22em] text-[#D8E2EA] transition group-hover:scale-105">
                {categoryToken}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-xl font-semibold text-[#F9FAFB] transition group-hover:text-white">
                  {subscription.name}
                </h3>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <Tag variant="info" size="sm" className="text-xs">
                    {subscription.category}
                  </Tag>
                  {subscription.isActive ? (
                    <Tag variant={usageVariant} size="sm">
                      {usageLabel}
                    </Tag>
                  ) : null}
                  {statusTag}
                </div>
              </div>
            </div>

            {onEdit ? (
              <button
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onEdit(subscription);
                }}
                className="rounded-lg p-1.5 text-[#9CA3AF] opacity-0 transition-all duration-150 hover:bg-[#4ADE80]/10 hover:text-[#4ADE80] group-hover:opacity-100"
                title="Quick edit"
              >
                <Pencil size={14} />
              </button>
            ) : null}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-baseline justify-between gap-3">
            <span
              className={cn(
                "text-3xl font-bold",
                subscription.isActive ? "text-[#4ADE80]" : "text-[#9CA3AF]"
              )}
            >
              {formatCurrency(subscription.price, currency)}
            </span>
            <Tag size="sm" className="bg-white/10">
              {subscription.billingPeriod === "MONTHLY" ? "Monthly" : "Yearly"}
            </Tag>
          </div>

          <div className="space-y-2 border-t border-white/10 pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#9CA3AF]">Next charge</span>
              <span
                className={cn(
                  "font-medium",
                  isOverdue && "text-[#F97373]",
                  (isToday || isTomorrow || isUpcoming) && "text-[#F59E0B]",
                  !isUpcoming && !isOverdue && "text-[#F9FAFB]"
                )}
              >
                {formatDate(subscription.nextChargeDate)}
                {daysUntil >= 0 ? ` (${daysUntil}d)` : ""}
              </span>
            </div>
          </div>

          {subscription.isActive && (usageStatus === "at_risk" || usageStatus === "unused") ? (
            <button
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                confirmUse.mutate(subscription.id);
              }}
              disabled={confirmUse.isPending}
              className="mt-3 flex w-full items-center gap-1.5 border-t border-white/10 pt-3 text-xs text-[#4ADE80] transition hover:text-[#86E8AA] disabled:opacity-50"
            >
              <CheckCircle2 size={14} />
              {confirmUse.isPending ? "Saving..." : "Mark as used"}
            </button>
          ) : null}
        </CardContent>
      </Card>
    </Link>
  );
}
