"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppShell } from "@/components/layout/AppShell";
import { ConnectionError } from "@/components/errors/ConnectionError";
import { OnboardingEmpty } from "@/components/ui/OnboardingEmpty";
import { ErrorState } from "@/components/ui/ErrorState";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { DonutChart } from "@/components/ui/DonutChart";
import { Chart } from "@/components/ui/Chart";
import { StatusBanner } from "@/components/ui/StatusBanner";
import { Tag } from "@/components/ui/Tag";
import { useSubscriptions } from "@/hooks/use-subscriptions";
import { useMonthlyAnalytics, useSpendingHistory } from "@/hooks/use-analytics";
import { useSmartAlerts } from "@/hooks/use-notifications";
import { useMe } from "@/hooks/use-auth";
import { useApiError } from "@/hooks/use-api-error";
import { cn } from "@/lib/utils";
import {
  formatCurrency,
  formatDateShort,
  getDaysUntil,
  getUpcomingCharges,
} from "@/lib/utils/format";

const CHART_COLORS = [
  "#4ADE80",
  "#38BDF8",
  "#F59E0B",
  "#8B5CF6",
  "#F97373",
  "#10B981",
];

function getTrend(current?: number, previous?: number) {
  if (current == null || previous == null || previous === 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

export default function DashboardPage() {
  const [upcomingView, setUpcomingView] = useState<"timeline" | "list">("timeline");
  const subscriptionsQuery = useSubscriptions();
  const analyticsQuery = useMonthlyAnalytics();
  const alertsQuery = useSmartAlerts();
  const historyQuery = useSpendingHistory();
  const meQuery = useMe();

  const subscriptionsError = useApiError(subscriptionsQuery);
  const analyticsError = useApiError(analyticsQuery);

  const subscriptions = useMemo(
    () => subscriptionsQuery.data?.data ?? [],
    [subscriptionsQuery.data],
  );
  const analytics = analyticsQuery.data?.data;
  const alerts = alertsQuery.data?.data?.alerts ?? [];
  const spendingHistory = historyQuery.data?.data ?? [];
  const user = meQuery.data?.data;
  const currency = user?.currency ?? "USD";
  const budgetLimit = user?.budgetLimit ?? null;

  const isLoading =
    subscriptionsQuery.isLoading ||
    analyticsQuery.isLoading ||
    historyQuery.isLoading;

  const hasConnectionError =
    subscriptionsError.isConnectionError || analyticsError.isConnectionError;

  const upcomingCharges = useMemo(
    () => getUpcomingCharges(subscriptions, 30),
    [subscriptions],
  );
  const urgentCharges = upcomingCharges.filter(
    (item) => getDaysUntil(item.nextChargeDate) <= 7,
  );
  const upcomingTotal = upcomingCharges.reduce(
    (sum, item) => sum + item.price,
    0,
  );

  const topCategory = analytics?.categoryBreakdown?.length
    ? [...analytics.categoryBreakdown].sort((a, b) => b.total - a.total)[0]
    : null;

  const chartData = spendingHistory.map((entry) => ({
    name: entry.month,
    value: entry.total,
  }));

  const categoryData =
    analytics?.categoryBreakdown.map((item, index) => ({
      name: item.category,
      value: item.total,
      color: CHART_COLORS[index % CHART_COLORS.length],
    })) ?? [];

  const currentMonth = spendingHistory[spendingHistory.length - 1]?.total;
  const previousMonth = spendingHistory[spendingHistory.length - 2]?.total;
  const monthlyTrend = getTrend(currentMonth, previousMonth);

  const budgetPercent =
    budgetLimit && analytics
      ? Math.min((analytics.totalMonthlyCost / budgetLimit) * 100, 100)
      : null;

  if (isLoading) {
    return (
      <ProtectedRoute>
        <AppShell>
          <div className="p-8 md:p-10 lg:p-12">
            <div className="max-w-7xl space-y-6">
              <SkeletonCard />
              <div className="grid gap-4 lg:grid-cols-4">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                <SkeletonCard />
                <SkeletonCard />
              </div>
              <SkeletonCard />
            </div>
          </div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  if (subscriptions.length === 0 && !subscriptionsQuery.isError) {
    return (
      <ProtectedRoute>
        <AppShell>
          <div className="p-8 md:p-10 lg:p-12">
            <div className="max-w-6xl space-y-6">
              <StatusBanner tone="info" title="Start with your first recurring cost">
                Add a few services first and the dashboard will turn into a real control center
                for renewals, timing, and recurring spend.
              </StatusBanner>
              <OnboardingEmpty />
            </div>
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
            {hasConnectionError ? (
              <ConnectionError
                onRetry={() => {
                  subscriptionsQuery.refetch();
                  analyticsQuery.refetch();
                  historyQuery.refetch();
                  alertsQuery.refetch();
                }}
              />
            ) : null}

            {(subscriptionsQuery.isError || analyticsQuery.isError) &&
            !hasConnectionError ? (
              <ErrorState
                title="Unable to load dashboard data"
                message={
                  subscriptionsError.errorMessage ||
                  analyticsError.errorMessage ||
                  "Please try again."
                }
                onRetry={() => {
                  subscriptionsQuery.refetch();
                  analyticsQuery.refetch();
                }}
              />
            ) : null}

            <section className="grid gap-5 lg:grid-cols-3">
              <div className="glass-hover rounded-3xl p-8 lg:col-span-2">
                <p className="mb-3 text-xs uppercase tracking-widest text-[#9CA3AF]">
                  Monthly total
                </p>
                <h1 className="mb-4 text-5xl font-semibold leading-none tracking-tight text-[#F9FAFB] md:text-6xl">
                  {analytics ? formatCurrency(analytics.totalMonthlyCost, currency) : "-"}
                </h1>
                <p className="text-[#9CA3AF]">
                  Yearly:{" "}
                  <span className="font-medium text-[#F9FAFB]">
                    {analytics ? formatCurrency(analytics.totalYearlyCost, currency) : "-"}
                  </span>
                </p>

                {budgetLimit && analytics ? (
                  <div className="mt-5">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-[#9CA3AF]">Budget</span>
                      <span
                        className={cn(
                          "font-medium",
                          budgetPercent && budgetPercent >= 100
                            ? "text-[#F87171]"
                            : budgetPercent && budgetPercent >= 80
                              ? "text-[#F59E0B]"
                              : "text-[#4ADE80]",
                        )}
                      >
                        {formatCurrency(analytics.totalMonthlyCost, currency)} /{" "}
                        {formatCurrency(budgetLimit, currency)}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-700",
                          budgetPercent && budgetPercent >= 100
                            ? "bg-[#F87171]"
                            : budgetPercent && budgetPercent >= 80
                              ? "bg-[#F59E0B]"
                              : "bg-[#4ADE80]",
                        )}
                        style={{ width: `${budgetPercent ?? 0}%` }}
                      />
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="space-y-4">
                <div className="glass-hover rounded-3xl p-6">
                  <p className="mb-2 text-xs uppercase tracking-widest text-[#9CA3AF]">
                    Active subscriptions
                  </p>
                  <p className="text-4xl font-semibold tracking-tight text-[#38BDF8]">
                    {analytics?.activeSubscriptions ?? subscriptions.length}
                  </p>
                </div>

                <div className="glass-hover rounded-3xl p-6">
                  <p className="mb-2 text-xs uppercase tracking-widest text-[#9CA3AF]">
                    This month
                  </p>
                  <p
                    className={cn(
                      "text-4xl font-semibold tracking-tight",
                      monthlyTrend == null
                        ? "text-[#F9FAFB]"
                        : monthlyTrend > 0
                          ? "text-[#F59E0B]"
                          : monthlyTrend < 0
                            ? "text-[#4ADE80]"
                            : "text-[#38BDF8]",
                    )}
                  >
                    {monthlyTrend == null ? "-" : `${monthlyTrend > 0 ? "+" : ""}${monthlyTrend}%`}
                  </p>
                  <p className="mt-2 text-sm text-[#9CA3AF]">
                    Trend vs previous month
                  </p>
                </div>
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  label: "Active subscriptions",
                  value: String(analytics?.activeSubscriptions ?? subscriptions.length),
                  tone: "text-[#F9FAFB]",
                  detail: "Currently billing or available",
                },
                {
                  label: "Urgent renewals",
                  value: String(urgentCharges.length),
                  tone: urgentCharges.length > 0 ? "text-[#F59E0B]" : "text-[#F9FAFB]",
                  detail: "Due within the next 7 days",
                },
                {
                  label: "Next 30-day total",
                  value: formatCurrency(upcomingTotal, currency),
                  tone: "text-[#F9FAFB]",
                  detail: "Projected total of scheduled charges in the next 30 days",
                },
                {
                  label: "Category leader",
                  value: topCategory?.category ?? "-",
                  tone: "text-[#38BDF8]",
                  detail: topCategory
                    ? `${formatCurrency(topCategory.total, currency)} / month`
                    : "Waiting for enough data",
                },
              ].map((item) => (
                <div key={item.label} className="glass-hover rounded-3xl p-5">
                  <p className="mb-2 text-xs uppercase tracking-[0.2em] text-[#9CA3AF]">
                    {item.label}
                  </p>
                  <p className={cn("mb-2 text-3xl font-semibold tracking-tight", item.tone)}>
                    {item.value}
                  </p>
                  <p className="text-sm text-[#9CA3AF]">{item.detail}</p>
                </div>
              ))}
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="glass-hover rounded-3xl p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-[#F9FAFB]">Upcoming charges</h2>
                    <p className="text-sm text-[#9CA3AF]">
                      Switch between the classic timeline and the compact list
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex rounded-2xl border border-white/10 bg-white/5 p-1">
                      <button
                        type="button"
                        onClick={() => setUpcomingView("timeline")}
                        className={cn(
                          "rounded-xl px-3 py-2 text-xs font-medium uppercase tracking-[0.18em] transition",
                          upcomingView === "timeline"
                            ? "bg-[#4ADE80] text-[#05111A]"
                            : "text-[#9CA3AF] hover:text-[#F9FAFB]",
                        )}
                      >
                        Classic
                      </button>
                      <button
                        type="button"
                        onClick={() => setUpcomingView("list")}
                        className={cn(
                          "rounded-xl px-3 py-2 text-xs font-medium uppercase tracking-[0.18em] transition",
                          upcomingView === "list"
                            ? "bg-[#4ADE80] text-[#05111A]"
                            : "text-[#9CA3AF] hover:text-[#F9FAFB]",
                        )}
                      >
                        Compact
                      </button>
                    </div>
                    <Link
                      href="/subscriptions"
                      className="text-sm text-[#38BDF8] transition-colors hover:text-[#7DD3FC]"
                    >
                      Manage list
                    </Link>
                  </div>
                </div>

                {upcomingCharges.length === 0 ? (
                  <StatusBanner tone="neutral" title="Nothing scheduled">
                    No active subscriptions are due in the next 30 days.
                  </StatusBanner>
                ) : upcomingView === "timeline" ? (
                  <div className="space-y-1">
                    {upcomingCharges.slice(0, 7).map((subscription, index) => {
                      const daysUntil = getDaysUntil(subscription.nextChargeDate);
                      const dotColor =
                        daysUntil <= 2 ? "#F87171" : daysUntil <= 7 ? "#F59E0B" : "#4ADE80";
                      const isLast = index === Math.min(upcomingCharges.length, 7) - 1;

                      return (
                        <Link
                          key={subscription.id}
                          href={`/subscriptions/${subscription.id}`}
                          className="group flex items-center gap-4 rounded-2xl p-3 transition-all duration-[120ms] hover:bg-white/5"
                        >
                          <div className="flex w-5 flex-shrink-0 flex-col items-center">
                            <div
                              className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                              style={{ background: dotColor, boxShadow: `0 0 8px ${dotColor}60` }}
                            />
                            {!isLast ? (
                              <div className="mt-1 w-px flex-1 bg-white/10" style={{ minHeight: "20px" }} />
                            ) : null}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-[#F9FAFB] transition-colors group-hover:text-white">
                              {subscription.name}
                            </p>
                            <p className="text-xs text-[#9CA3AF]">
                              {formatDateShort(subscription.nextChargeDate)}
                            </p>
                          </div>

                          <div className="flex flex-shrink-0 items-center gap-2">
                            {daysUntil <= 7 ? (
                              <Tag variant={daysUntil <= 2 ? "error" : "warning"} size="sm">
                                {daysUntil === 0 ? "Today" : daysUntil === 1 ? "Tomorrow" : `${daysUntil}d`}
                              </Tag>
                            ) : null}
                            <span className="text-sm font-semibold text-[#F9FAFB]">
                              {formatCurrency(subscription.price, currency)}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingCharges.slice(0, 7).map((subscription) => {
                      const daysUntil = getDaysUntil(subscription.nextChargeDate);

                      return (
                        <Link
                          key={subscription.id}
                          href={`/subscriptions/${subscription.id}`}
                          className="glass-light flex items-center justify-between gap-4 rounded-2xl p-4 transition-colors hover:bg-white/8"
                        >
                          <div className="min-w-0">
                            <p className="truncate font-medium text-[#F9FAFB]">
                              {subscription.name}
                            </p>
                            <p className="text-sm text-[#9CA3AF]">
                              {formatDateShort(subscription.nextChargeDate)}
                            </p>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="text-sm font-semibold text-[#F9FAFB]">
                              {formatCurrency(subscription.price, currency)}
                            </p>
                            <Tag
                              variant={
                                daysUntil <= 2
                                  ? "error"
                                  : daysUntil <= 7
                                    ? "warning"
                                    : "info"
                              }
                              size="sm"
                            >
                              {daysUntil <= 0
                                ? "Today"
                                : daysUntil === 1
                                  ? "Tomorrow"
                                  : `${daysUntil} days`}
                            </Tag>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="grid gap-6">
                <div className="glass-hover rounded-3xl p-6">
                  <h2 className="mb-1 text-xl font-semibold text-[#F9FAFB]">
                    Category concentration
                  </h2>
                  <p className="mb-5 text-sm text-[#9CA3AF]">
                    Where your monthly recurring budget is concentrated
                  </p>
                  {categoryData.length > 0 ? (
                    <DonutChart data={categoryData} />
                  ) : (
                    <StatusBanner tone="neutral" title="No category data yet">
                      Add subscriptions with categories to understand where spending clusters.
                    </StatusBanner>
                  )}
                </div>

                <div className="glass-hover rounded-3xl p-6">
                  <h2 className="mb-1 text-xl font-semibold text-[#F9FAFB]">
                    Smart signals
                  </h2>
                  <p className="mb-5 text-sm text-[#9CA3AF]">
                    Useful billing events and anomalies detected from current data
                  </p>
                  {alerts.length > 0 ? (
                    <div className="space-y-3">
                      {alerts.slice(0, 4).map((alert, index) => (
                        <StatusBanner
                          key={`${alert.type}-${index}`}
                          tone={alert.type === "PRECHARGE" ? "info" : "neutral"}
                          title={alert.type === "PRECHARGE" ? "Upcoming charge" : "Billing insight"}
                        >
                          {alert.message}
                        </StatusBanner>
                      ))}
                    </div>
                  ) : (
                    <StatusBanner tone="success" title="No urgent anomalies">
                      Nothing looks unusually risky right now. Your recurring spend appears stable.
                    </StatusBanner>
                  )}
                </div>
              </div>
            </section>

            <section className="glass-hover rounded-3xl p-6">
              <h2 className="mb-1 text-xl font-semibold text-[#F9FAFB]">Spending trend</h2>
              <p className="mb-5 text-sm text-[#9CA3AF]">
                Six-month view of recurring expense movement
              </p>
              {chartData.length > 0 ? (
                <Chart data={chartData} dataKey="value" type="area" color="#4ADE80" />
              ) : (
                <StatusBanner tone="neutral" title="Waiting for trend data">
                  A few subscriptions are enough to start building a useful monthly history.
                </StatusBanner>
              )}
            </section>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
