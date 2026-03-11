"use client";

import Link from "next/link";
import { Pencil } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import type { Currency, Subscription } from "@/shared/types";
import { evaluateSubscriptionReview } from "@/lib/subscriptions/review";
import { cn } from "@/lib/utils";
import {
  formatBillingPeriod,
  formatCurrency,
  formatDate,
  getDaysUntil,
} from "@/lib/utils/format";

interface SubscriptionCardProps {
  subscription: Subscription;
  allSubscriptions: Subscription[];
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
  General: "SUB",
  Subscription: "SUB",
};

export function SubscriptionCard({
  subscription,
  allSubscriptions,
  currency = "USD",
  onEdit,
}: SubscriptionCardProps) {
  const daysUntil = getDaysUntil(subscription.nextChargeDate);
  const isUpcoming = daysUntil <= 7 && daysUntil >= 0;
  const isOverdue = daysUntil < 0;
  const isToday = daysUntil === 0;
  const isTomorrow = daysUntil === 1;
  const categoryToken = categoryTokens[subscription.category] ?? categoryTokens.Other;
  const review = evaluateSubscriptionReview(subscription, allSubscriptions);

  const statusTag = (() => {
    if (!subscription.isActive) {
      return (
        <Tag variant="error" size="sm">
          Inactive
        </Tag>
      );
    }
    if (isOverdue) {
      return (
        <Tag variant="error" size="sm">
          Overdue
        </Tag>
      );
    }
    if (isToday) {
      return (
        <Tag variant="warning" size="sm">
          Today
        </Tag>
      );
    }
    if (isTomorrow) {
      return (
        <Tag variant="warning" size="sm">
          Tomorrow
        </Tag>
      );
    }
    if (isUpcoming) {
      return (
        <Tag variant="warning" size="sm">
          {daysUntil}d
        </Tag>
      );
    }
    return null;
  })();

  return (
    <Link href={`/subscriptions/${subscription.id}`}>
      <Card
        className={cn(
          "glass-hover group h-full min-h-[290px] cursor-pointer overflow-hidden transition-all duration-150 hover:-translate-y-1",
          review.status === "keep" &&
            "bg-[linear-gradient(180deg,rgba(74,222,128,0.08),rgba(255,255,255,0.04))] shadow-[0_0_0_1px_rgba(74,222,128,0.12)]",
          review.status === "review" &&
            "bg-[linear-gradient(180deg,rgba(245,158,11,0.08),rgba(255,255,255,0.04))] shadow-[0_0_0_1px_rgba(245,158,11,0.14)]",
          review.status === "cancel_candidate" &&
            "bg-[linear-gradient(180deg,rgba(249,115,115,0.08),rgba(255,255,255,0.04))] shadow-[0_0_0_1px_rgba(249,115,115,0.16)]",
        )}
      >
        <div
          style={{
            height: "3px",
            background:
              review.status === "keep"
                ? "#4ADE80"
                : review.status === "review"
                  ? "#F59E0B"
                  : "#F97373",
            borderRadius: "24px 24px 0 0",
          }}
        />

        <CardHeader className="px-6 pb-5 pt-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-[10px] font-semibold tracking-[0.18em] text-[#D8E2EA] transition group-hover:scale-105">
                {categoryToken}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-[1.05rem] font-semibold text-[#F9FAFB] transition group-hover:text-white">
                  {subscription.name}
                </h3>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex h-3.5 w-3.5 rounded-full ring-4 ring-white/[0.03]",
                      review.status === "keep" && "bg-[#4ADE80]",
                      review.status === "review" && "bg-[#F59E0B]",
                      review.status === "cancel_candidate" && "bg-[#F97373]",
                    )}
                  />
                  <Tag
                    variant={
                      review.status === "keep"
                        ? "success"
                        : review.status === "review"
                          ? "warning"
                          : "error"
                    }
                    size="sm"
                  >
                    {review.label}
                  </Tag>
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

        <CardContent className="space-y-4 px-6 pb-6">
          <div className="flex items-baseline justify-between gap-3">
            <span
              className={cn(
                "text-[1.85rem] font-bold",
                subscription.isActive ? "text-[#4ADE80]" : "text-[#9CA3AF]",
              )}
            >
              {formatCurrency(subscription.price, currency)}
            </span>
            <Tag size="sm" className="bg-white/10">
              {formatBillingPeriod(subscription.billingPeriod)}
            </Tag>
          </div>

          <div className="space-y-2.5 border-t border-white/10 pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#9CA3AF]">Next charge</span>
              <span
                className={cn(
                  "font-medium",
                  isOverdue && "text-[#F97373]",
                  (isToday || isTomorrow || isUpcoming) && "text-[#F59E0B]",
                  !isUpcoming && !isOverdue && "text-[#F9FAFB]",
                )}
              >
                {formatDate(subscription.nextChargeDate)}
                {daysUntil >= 0 ? ` (${daysUntil}d)` : ""}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#9CA3AF]">Need score</span>
              <span className="font-medium text-[#DCE6EE]">{subscription.needScore}%</span>
            </div>
            {subscription.serviceGroup ? (
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#9CA3AF]">Group</span>
                <span className="font-medium text-[#DCE6EE]">
                  {subscription.serviceGroup}
                </span>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
