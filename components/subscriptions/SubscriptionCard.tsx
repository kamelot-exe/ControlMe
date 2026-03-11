"use client";

import Link from "next/link";
import { CheckCircle2, Pencil } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import type { Subscription, Currency } from "@/shared/types";
import { formatCurrency, formatDate, getDaysUntil } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import { useConfirmUse } from "@/hooks/use-subscriptions";

interface SubscriptionCardProps {
  subscription: Subscription;
  currency?: Currency;
  onEdit?: (subscription: Subscription) => void;
}

const categoryIcons: Record<string, string> = {
  Streaming: "📺",
  Software: "💻",
  Gym: "💪",
  Music: "🎵",
  Cloud: "☁️",
  News: "📰",
  Education: "📚",
  Gaming: "🎮",
  Finance: "💰",
  Other: "📦",
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

export function SubscriptionCard({ subscription, currency = "USD", onEdit }: SubscriptionCardProps) {
  const confirmUse = useConfirmUse();
  const daysUntil = getDaysUntil(subscription.nextChargeDate);
  const isUpcoming = daysUntil <= 7 && daysUntil >= 0;
  const isOverdue = daysUntil < 0;
  const isToday = daysUntil === 0;
  const isTomorrow = daysUntil === 1;

  const icon = categoryIcons[subscription.category] || categoryIcons.Other;
  const categoryColor = categoryColors[subscription.category] ?? "#9CA3AF";

  const getStatusBadge = () => {
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
  };

  const getUsageStatus = (): "active" | "at_risk" | "unused" => {
    if (!subscription.isActive) return "unused";
    const lastUse = subscription.usage?.lastConfirmedUseAt;
    if (!lastUse) {
      const created = subscription.createdAt ? new Date(subscription.createdAt) : new Date();
      const days = (Date.now() - created.getTime()) / 86_400_000;
      if (days < 14) return "active";
      if (days < 30) return "at_risk";
      return "unused";
    }
    const days = (Date.now() - new Date(lastUse).getTime()) / 86_400_000;
    if (days < 14) return "active";
    if (days < 30) return "at_risk";
    return "unused";
  };

  const usageStatus = getUsageStatus();
  const usageTagVariant =
    usageStatus === "active" ? "success" : usageStatus === "at_risk" ? "warning" : "error";
  const usageLabel =
    usageStatus === "active" ? "Active" : usageStatus === "at_risk" ? "At Risk" : "Unused";

  return (
    <Link href={`/subscriptions/${subscription.id}`}>
      <Card className="glass-hover h-full group cursor-pointer transition-all duration-[120ms] hover:-translate-y-1 overflow-hidden">
        {/* Category color stripe */}
        <div style={{ height: "3px", background: categoryColor, borderRadius: "24px 24px 0 0" }} />

        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="text-3xl flex-shrink-0 group-hover:scale-110 transition-transform duration-[120ms]">
                {icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-semibold text-[#F9FAFB] truncate group-hover:text-white transition-colors">
                  {subscription.name}
                </h3>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <Tag variant="info" size="sm" className="text-xs">
                    {subscription.category}
                  </Tag>
                  {subscription.isActive && (
                    <Tag variant={usageTagVariant} size="sm">{usageLabel}</Tag>
                  )}
                  {getStatusBadge()}
                </div>
              </div>
            </div>
            {onEdit && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onEdit(subscription);
                }}
                className="opacity-0 group-hover:opacity-100 flex-shrink-0 p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#4ADE80] hover:bg-[#4ADE80]/10 transition-all duration-150"
                title="Quick edit"
              >
                <Pencil size={14} />
              </button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-baseline justify-between">
            <span
              className={cn(
                "text-3xl font-bold",
                subscription.isActive ? "text-[#4ADE80]" : "text-[#9CA3AF]"
              )}
            >
              {formatCurrency(subscription.price, currency)}
            </span>
            <Tag size="sm" className="bg-white/10">
              {subscription.billingPeriod}
            </Tag>
          </div>

          <div className="pt-4 border-t border-white/10 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#9CA3AF]">Next charge</span>
              <span
                className={cn(
                  "font-medium",
                  isOverdue && "text-[#F97373]",
                  isToday && "text-[#F59E0B]",
                  isTomorrow && "text-[#F59E0B]",
                  isUpcoming && "text-[#F59E0B]/80",
                  !isUpcoming && !isOverdue && "text-[#F9FAFB]"
                )}
              >
                {formatDate(subscription.nextChargeDate)}
                {daysUntil >= 0 && ` (${daysUntil}d)`}
              </span>
            </div>
          </div>

          {subscription.isActive && (usageStatus === "at_risk" || usageStatus === "unused") && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                confirmUse.mutate(subscription.id);
              }}
              disabled={confirmUse.isPending}
              className="flex items-center gap-1.5 text-xs text-[#4ADE80] hover:text-[#4ADE80]/80 transition-colors disabled:opacity-50 mt-3 pt-3 border-t border-white/8 w-full"
            >
              <CheckCircle2 size={14} />
              {confirmUse.isPending ? "Saving..." : "Mark as used"}
            </button>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
