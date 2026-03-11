"use client";

import React, { useMemo } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppShell } from "@/components/layout/AppShell";
import { DonutChart } from "@/components/ui/DonutChart";
import { Chart } from "@/components/ui/Chart";
import { Tag } from "@/components/ui/Tag";
import { ConnectionError } from "@/components/errors/ConnectionError";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { useSubscriptions } from "@/hooks/use-subscriptions";
import { useMonthlyAnalytics, useSavingsSummary, useSpendingHistory } from "@/hooks/use-analytics";
import { useSmartAlerts } from "@/hooks/use-notifications";
import { useMe } from "@/hooks/use-auth";
import { useApiError } from "@/hooks/use-api-error";
import { formatCurrency, formatDateShort, getDaysUntil, getUpcomingCharges } from "@/lib/utils/format";
import { OnboardingEmpty } from "@/components/ui/OnboardingEmpty";
import Link from "next/link";
import { cn } from "@/lib/utils";

const COLORS = ["#4ADE80", "#38BDF8", "#F97373", "#F59E0B", "#8B5CF6", "#EC4899", "#10B981", "#6366F1"];

const categoryColors: Record<string, string> = {
  Streaming: "#38BDF8", Software: "#4ADE80", Gym: "#F87171",
  Music: "#8B5CF6", Cloud: "#38BDF8", News: "#9CA3AF",
  Education: "#F59E0B", Gaming: "#8B5CF6", Finance: "#4ADE80", Other: "#9CA3AF",
};

// Generate next 30 days calendar
function buildCalendar(upcomingCharges: ReturnType<typeof getUpcomingCharges>) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days: { date: Date; charges: { name: string; price: number }[] }[] = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const charges = upcomingCharges.filter((sub) => {
      const cd = new Date(sub.nextChargeDate);
      cd.setHours(0, 0, 0, 0);
      return cd.getTime() === d.getTime();
    }).map((sub) => ({ name: sub.name, price: sub.price }));
    days.push({ date: d, charges });
  }
  return days;
}

export default function DashboardPage() {
  const subscriptionsQuery = useSubscriptions();
  const analyticsQuery = useMonthlyAnalytics();
  const alertsQuery = useSmartAlerts();
  const meQuery = useMe();
  const savingsQuery = useSavingsSummary();
  const historyQuery = useSpendingHistory();

  const subscriptionsError = useApiError(subscriptionsQuery);
  const analyticsError = useApiError(analyticsQuery);

  const subscriptions = subscriptionsQuery.data?.data ?? [];
  const analytics = analyticsQuery.data?.data;
  const alerts = alertsQuery.data?.data?.alerts ?? [];
  const me = meQuery.data?.data;
  const currency = me?.currency ?? "USD";
  const budgetLimit = (me as any)?.budgetLimit as number | null | undefined;
  const savings = savingsQuery.data?.data;
  const spendingHistory = historyQuery.data?.data ?? [];

  const upcomingCharges = getUpcomingCharges(subscriptions, 30);
  const calendarDays = useMemo(() => buildCalendar(upcomingCharges), [upcomingCharges]);

  const categoryChartData = analytics?.categoryBreakdown.map((item, index) => ({
    name: item.category,
    value: item.total,
    color: COLORS[index % COLORS.length],
  })) ?? [];

  const historyChartData = spendingHistory.map((item) => ({
    name: item.month,
    value: item.total,
  }));

  const budgetPercent = budgetLimit && analytics
    ? Math.min((analytics.totalMonthlyCost / budgetLimit) * 100, 100)
    : null;

  const isLoading = subscriptionsQuery.isLoading || analyticsQuery.isLoading;

  if (isLoading) {
    return (
      <ProtectedRoute>
        <AppShell>
          <div className="p-8 md:p-10 lg:p-12">
            <div className="max-w-7xl space-y-8 animate-fade-in">
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2"><SkeletonCard /></div>
                <div className="space-y-4"><SkeletonCard /><SkeletonCard /></div>
              </div>
              <div className="grid gap-6 lg:grid-cols-2"><SkeletonCard /><SkeletonCard /></div>
            </div>
          </div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  const hasConnectionError = subscriptionsError.isConnectionError || analyticsError.isConnectionError;

  if (subscriptions.length === 0 && !subscriptionsQuery.isError) {
    return (
      <ProtectedRoute>
        <AppShell>
          <div className="p-8 md:p-10">
            <OnboardingEmpty />
          </div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="p-8 md:p-10 lg:p-12">
          <div className="max-w-7xl space-y-6 animate-fade-in">

          {hasConnectionError && (
            <ConnectionError onRetry={() => { subscriptionsQuery.refetch(); analyticsQuery.refetch(); }} />
          )}
          {(subscriptionsQuery.isError || analyticsQuery.isError) && !hasConnectionError && (
            <ErrorState
              title="Unable to load dashboard data"
              message={subscriptionsError.errorMessage || analyticsError.errorMessage || "Please try again."}
              onRetry={() => { subscriptionsQuery.refetch(); analyticsQuery.refetch(); }}
            />
          )}

          {/* ── HERO ZONE ── */}
          <div className="grid gap-5 lg:grid-cols-3">
            {/* Main hero card */}
            <div className="lg:col-span-2 glass-hover rounded-3xl p-8 animate-slide-up">
              <p className="text-xs text-[#9CA3AF] uppercase tracking-widest mb-3">Monthly Total</p>
              <h1 className="text-5xl md:text-6xl font-semibold text-[#F9FAFB] tracking-tight animate-count-up leading-none mb-4">
                {analytics ? formatCurrency(analytics.totalMonthlyCost, currency) : "—"}
              </h1>
              <p className="text-[#9CA3AF]">
                Yearly:{" "}
                <span className="text-[#F9FAFB] font-medium">
                  {analytics ? formatCurrency(analytics.totalYearlyCost, currency) : "—"}
                </span>
              </p>

              {/* Budget progress bar */}
              {budgetLimit && analytics && (
                <div className="mt-5">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-[#9CA3AF]">Budget</span>
                    <span className={cn(
                      "font-medium",
                      budgetPercent! >= 100 ? "text-[#F87171]" : budgetPercent! >= 80 ? "text-[#F59E0B]" : "text-[#4ADE80]"
                    )}>
                      {formatCurrency(analytics.totalMonthlyCost, currency)} / {formatCurrency(budgetLimit, currency)}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-700",
                        budgetPercent! >= 100 ? "bg-[#F87171]" : budgetPercent! >= 80 ? "bg-[#F59E0B]" : "bg-[#4ADE80]"
                      )}
                      style={{ width: `${budgetPercent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Side stats */}
            <div className="space-y-4">
              <div className="glass-hover rounded-3xl p-6 animate-slide-up" style={{ animationDelay: "0.05s" }}>
                <p className="text-xs text-[#9CA3AF] uppercase tracking-widest mb-2">Active Subscriptions</p>
                <p className="text-4xl font-semibold text-[#38BDF8] tracking-tight animate-count-up">
                  {analytics?.activeSubscriptions ?? "—"}
                </p>
              </div>
              {savings && savings.unusedCount > 0 && (
                <div
                  className="rounded-3xl p-6 animate-slide-up border border-[#F87171]/25"
                  style={{ background: "rgba(248,113,113,0.06)", animationDelay: "0.1s" }}
                >
                  <p className="text-xs text-[#F87171] uppercase tracking-widest mb-2">Potential Savings</p>
                  <p className="text-3xl font-semibold text-[#F87171] tracking-tight animate-count-up">
                    {formatCurrency(savings.monthlySavings, currency)}
                  </p>
                  <p className="text-xs text-[#9CA3AF] mt-1">{savings.unusedCount} unused/mo</p>
                </div>
              )}
            </div>
          </div>

          {/* ── UPCOMING + DONUT ── */}
          <div className="grid gap-5 lg:grid-cols-2">
            {/* Upcoming charges — timeline style */}
            <div className="glass-hover rounded-3xl p-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <h2 className="text-lg font-semibold text-[#F9FAFB] mb-1">Upcoming Charges</h2>
              <p className="text-sm text-[#9CA3AF] mb-5">Next 30 days</p>

              {upcomingCharges.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-4xl mb-3">📅</p>
                  <p className="text-[#9CA3AF] text-sm">No upcoming charges</p>
                </div>
              ) : (
                <div className="relative space-y-1">
                  {upcomingCharges.slice(0, 7).map((sub, index) => {
                    const daysUntil = getDaysUntil(sub.nextChargeDate);
                    const dotColor = daysUntil <= 2 ? "#F87171" : daysUntil <= 7 ? "#F59E0B" : "#4ADE80";
                    const isLast = index === Math.min(upcomingCharges.length, 7) - 1;

                    return (
                      <Link key={sub.id} href={`/subscriptions/${sub.id}`}>
                        <div className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 transition-all duration-[120ms] group">
                          {/* Timeline dot + line */}
                          <div className="flex flex-col items-center flex-shrink-0 w-5">
                            <div
                              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                              style={{ background: dotColor, boxShadow: `0 0 8px ${dotColor}60` }}
                            />
                            {!isLast && <div className="w-px flex-1 bg-white/10 mt-1" style={{ minHeight: "20px" }} />}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#F9FAFB] truncate group-hover:text-white transition-colors">
                              {sub.name}
                            </p>
                            <p className="text-xs text-[#9CA3AF]">{formatDateShort(sub.nextChargeDate)}</p>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            {daysUntil <= 7 && (
                              <Tag variant={daysUntil <= 2 ? "error" : "warning"} size="sm">
                                {daysUntil === 0 ? "Today" : daysUntil === 1 ? "Tomorrow" : `${daysUntil}d`}
                              </Tag>
                            )}
                            <span className="text-sm font-semibold text-[#F9FAFB]">
                              {formatCurrency(sub.price, currency)}
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Category donut */}
            <div className="glass-hover rounded-3xl p-6 animate-slide-up" style={{ animationDelay: "0.15s" }}>
              <h2 className="text-lg font-semibold text-[#F9FAFB] mb-1">Category Breakdown</h2>
              <p className="text-sm text-[#9CA3AF] mb-5">Monthly spending by category</p>

              {categoryChartData.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-4xl mb-3">📊</p>
                  <p className="text-[#9CA3AF] text-sm">Add subscriptions to see breakdown</p>
                </div>
              ) : (
                <DonutChart data={categoryChartData} />
              )}
            </div>
          </div>

          {/* ── BILLING CALENDAR ── */}
          <div className="glass-hover rounded-3xl p-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <h2 className="text-lg font-semibold text-[#F9FAFB] mb-1">Billing Calendar</h2>
            <p className="text-sm text-[#9CA3AF] mb-5">Next 30 days</p>

            <div className="grid grid-cols-7 gap-1 text-center">
              {/* Weekday headers */}
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                <div key={d} className="text-xs text-[#9CA3AF] font-medium pb-2">{d}</div>
              ))}

              {/* Empty cells before first day */}
              {Array.from({ length: (calendarDays[0].date.getDay() + 6) % 7 }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}

              {/* Day cells */}
              {calendarDays.map(({ date, charges }, idx) => {
                const isToday = idx === 0;
                const hasCharge = charges.length > 0;

                return (
                  <div
                    key={idx}
                    className={cn(
                      "rounded-xl p-1.5 min-h-[52px] flex flex-col items-center gap-0.5 transition-all duration-[120ms]",
                      isToday && "ring-1 ring-[#4ADE80]/60",
                      hasCharge && "bg-white/5 hover:bg-white/10 cursor-pointer"
                    )}
                  >
                    <span className={cn(
                      "text-xs font-medium",
                      isToday ? "text-[#4ADE80]" : "text-[#9CA3AF]"
                    )}>
                      {date.getDate()}
                    </span>
                    {charges.slice(0, 2).map((c, ci) => (
                      <div
                        key={ci}
                        className="w-full px-1 py-0.5 rounded text-[9px] leading-tight truncate text-center font-medium"
                        style={{ background: "rgba(74,222,128,0.15)", color: "#4ADE80" }}
                        title={`${c.name}: ${formatCurrency(c.price, currency)}`}
                      >
                        {c.name.length > 8 ? c.name.slice(0, 7) + "…" : c.name}
                      </div>
                    ))}
                    {charges.length > 2 && (
                      <span className="text-[9px] text-[#9CA3AF]">+{charges.length - 2}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── SPENDING HISTORY ── */}
          {historyChartData.length > 0 && (
            <div className="glass-hover rounded-3xl p-6 animate-slide-up" style={{ animationDelay: "0.25s" }}>
              <h2 className="text-lg font-semibold text-[#F9FAFB] mb-1">Spending History</h2>
              <p className="text-sm text-[#9CA3AF] mb-5">Last 6 months</p>
              <Chart
                data={historyChartData}
                dataKey="value"
                type="area"
                color="#4ADE80"
              />
            </div>
          )}

          {/* ── SMART SIGNALS ── */}
          {alerts.length > 0 && (
            <div className="glass-hover rounded-3xl p-6 animate-slide-up" style={{ animationDelay: "0.3s" }}>
              <h2 className="text-lg font-semibold text-[#F9FAFB] mb-1">Smart Signals</h2>
              <p className="text-sm text-[#9CA3AF] mb-5">Things that need your attention</p>
              <div className="space-y-2">
                {alerts.map((alert, index) => {
                  const config: Record<string, { variant: "warning" | "error" | "info" | "purple"; label: string }> = {
                    PRECHARGE: { variant: "warning", label: "Upcoming" },
                    UNUSED:    { variant: "error",   label: "Unused" },
                    SPENDING_INCREASE: { variant: "info", label: "Trend" },
                    DUPLICATE: { variant: "purple",  label: "Duplicate" },
                  };
                  const { variant, label } = config[alert.type] ?? { variant: "info", label: alert.type };

                  return (
                    <div
                      key={index}
                      className="glass-light rounded-2xl p-4 flex items-center justify-between gap-4 animate-fade-in"
                      style={{ animationDelay: `${index * 0.04}s` }}
                    >
                      <p className="text-sm text-[#F9FAFB]">{alert.message}</p>
                      <Tag variant={variant} size="sm" className="flex-shrink-0">{label}</Tag>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
