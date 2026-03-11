"use client";

import { useMemo } from "react";
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
import { useMonthlyAnalytics, useSavingsSummary, useSpendingHistory } from "@/hooks/use-analytics";
import { useSmartAlerts } from "@/hooks/use-notifications";
import { useMe } from "@/hooks/use-auth";
import { useApiError } from "@/hooks/use-api-error";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDateShort, getDaysUntil, getUpcomingCharges } from "@/lib/utils/format";

const CHART_COLORS = ["#4ADE80", "#38BDF8", "#F59E0B", "#8B5CF6", "#F97373", "#10B981"];

function getTrend(current?: number, previous?: number) {
  if (current == null || previous == null || previous === 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

export default function DashboardPage() {
  const subscriptionsQuery = useSubscriptions();
  const analyticsQuery = useMonthlyAnalytics();
  const alertsQuery = useSmartAlerts();
  const savingsQuery = useSavingsSummary();
  const historyQuery = useSpendingHistory();
  const meQuery = useMe();

  const subscriptionsError = useApiError(subscriptionsQuery);
  const analyticsError = useApiError(analyticsQuery);

  const subscriptions = useMemo(() => subscriptionsQuery.data?.data ?? [], [subscriptionsQuery.data]);
  const analytics = analyticsQuery.data?.data;
  const alerts = alertsQuery.data?.data?.alerts ?? [];
  const savings = savingsQuery.data?.data;
  const spendingHistory = historyQuery.data?.data ?? [];
  const user = meQuery.data?.data;
  const currency = user?.currency ?? "USD";
  const budgetLimit = user?.budgetLimit ?? null;

  const isLoading =
    subscriptionsQuery.isLoading ||
    analyticsQuery.isLoading ||
    savingsQuery.isLoading ||
    historyQuery.isLoading;

  const hasConnectionError = subscriptionsError.isConnectionError || analyticsError.isConnectionError;

  const upcomingCharges = useMemo(() => getUpcomingCharges(subscriptions, 30), [subscriptions]);
  const urgentCharges = upcomingCharges.filter((item) => getDaysUntil(item.nextChargeDate) <= 7);
  const upcomingTotal = upcomingCharges.reduce((sum, item) => sum + item.price, 0);

  const topCategory = analytics?.categoryBreakdown?.length
    ? [...analytics.categoryBreakdown].sort((a, b) => b.total - a.total)[0]
    : null;

  const chartData = spendingHistory.map((entry) => ({ name: entry.month, value: entry.total }));
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
    budgetLimit && analytics ? Math.min((analytics.totalMonthlyCost / budgetLimit) * 100, 100) : null;

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
                Add a few services first and the dashboard will turn into a real command center for spending, renewals, and savings.
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
                  savingsQuery.refetch();
                  historyQuery.refetch();
                  alertsQuery.refetch();
                }}
              />
            ) : null}

            {(subscriptionsQuery.isError || analyticsQuery.isError) && !hasConnectionError ? (
              <ErrorState
                title="Unable to load dashboard data"
                message={subscriptionsError.errorMessage || analyticsError.errorMessage || "Please try again."}
                onRetry={() => {
                  subscriptionsQuery.refetch();
                  analyticsQuery.refetch();
                }}
              />
            ) : null}

            <section className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
              <div className="glass-hover rounded-3xl p-8">
                <div className="flex flex-wrap items-start justify-between gap-6">
                  <div className="space-y-4 max-w-2xl">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.24em] text-[#9CA3AF]">
                      Dashboard
                    </div>
                    <div>
                      <p className="text-sm text-[#9CA3AF] mb-2">Current monthly exposure</p>
                      <h1 className="text-5xl md:text-6xl font-semibold tracking-tight text-[#F9FAFB]">
                        {analytics ? formatCurrency(analytics.totalMonthlyCost, currency) : "—"}
                      </h1>
                    </div>
                    <p className="text-base text-[#B8C0C7] leading-relaxed max-w-xl">
                      Track, understand, and control every subscription from one view: renewals, category concentration, unused spend, and changes in monthly cost.
                    </p>
                  </div>

                  <div className="w-full max-w-sm space-y-3">
                    <div className="glass-light rounded-2xl p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-[#9CA3AF] mb-2">Quick signals</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-[#9CA3AF]">Upcoming in 7 days</span>
                          <span className="text-[#F9FAFB] font-medium">{urgentCharges.length}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#9CA3AF]">Unused spend</span>
                          <span className="text-[#F9FAFB] font-medium">
                            {savings ? formatCurrency(savings.monthlySavings, currency) : "—"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#9CA3AF]">Top category</span>
                          <span className="text-[#F9FAFB] font-medium">{topCategory?.category ?? "—"}</span>
                        </div>
                      </div>
                    </div>

                    {budgetLimit && analytics ? (
                      <div className="glass-light rounded-2xl p-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-[#9CA3AF]">Budget progress</span>
                          <span
                            className={cn(
                              "font-medium",
                              budgetPercent && budgetPercent >= 100
                                ? "text-[#F97373]"
                                : budgetPercent && budgetPercent >= 80
                                  ? "text-[#F59E0B]"
                                  : "text-[#4ADE80]"
                            )}
                          >
                            {formatCurrency(analytics.totalMonthlyCost, currency)} / {formatCurrency(budgetLimit, currency)}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-white/8 overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              budgetPercent && budgetPercent >= 100
                                ? "bg-[#F97373]"
                                : budgetPercent && budgetPercent >= 80
                                  ? "bg-[#F59E0B]"
                                  : "bg-[#4ADE80]"
                            )}
                            style={{ width: `${budgetPercent ?? 0}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <StatusBanner tone="neutral" title="Budget tracking is off">
                        Add a budget limit in settings to compare your monthly recurring spend against a target.
                      </StatusBanner>
                    )}
                  </div>
                </div>
              </div>

              <div className="glass-hover rounded-3xl p-6">
                <p className="text-xs uppercase tracking-[0.2em] text-[#9CA3AF] mb-2">This month</p>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-[#9CA3AF]">Trend vs previous month</p>
                    <p
                      className={cn(
                        "text-4xl font-semibold tracking-tight",
                        monthlyTrend == null
                          ? "text-[#F9FAFB]"
                          : monthlyTrend > 0
                            ? "text-[#F59E0B]"
                            : monthlyTrend < 0
                              ? "text-[#4ADE80]"
                              : "text-[#38BDF8]"
                      )}
                    >
                      {monthlyTrend == null ? "—" : `${monthlyTrend > 0 ? "+" : ""}${monthlyTrend}%`}
                    </p>
                  </div>
                  <div className="space-y-3 pt-2 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#9CA3AF]">Yearly equivalent</span>
                      <span className="text-sm font-medium text-[#F9FAFB]">
                        {analytics ? formatCurrency(analytics.totalYearlyCost, currency) : "—"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#9CA3AF]">Active subscriptions</span>
                      <span className="text-sm font-medium text-[#F9FAFB]">
                        {analytics?.activeSubscriptions ?? subscriptions.length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#9CA3AF]">30-day charge total</span>
                      <span className="text-sm font-medium text-[#F9FAFB]">
                        {formatCurrency(upcomingTotal, currency)}
                      </span>
                    </div>
                  </div>
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
                  label: "Potential savings",
                  value: savings ? formatCurrency(savings.monthlySavings, currency) : "—",
                  tone: savings && savings.monthlySavings > 0 ? "text-[#F97373]" : "text-[#F9FAFB]",
                  detail: savings && savings.unusedCount > 0 ? `${savings.unusedCount} items likely unused` : "No unused items detected",
                },
                {
                  label: "Category leader",
                  value: topCategory?.category ?? "—",
                  tone: "text-[#38BDF8]",
                  detail: topCategory ? `${formatCurrency(topCategory.total, currency)} / month` : "Waiting for enough data",
                },
              ].map((item) => (
                <div key={item.label} className="glass-hover rounded-3xl p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-[#9CA3AF] mb-2">{item.label}</p>
                  <p className={cn("text-3xl font-semibold tracking-tight mb-2", item.tone)}>{item.value}</p>
                  <p className="text-sm text-[#9CA3AF]">{item.detail}</p>
                </div>
              ))}
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="glass-hover rounded-3xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-xl font-semibold text-[#F9FAFB]">Upcoming charges</h2>
                    <p className="text-sm text-[#9CA3AF]">Your next seven renewals in chronological order</p>
                  </div>
                  <Link href="/subscriptions" className="text-sm text-[#38BDF8] hover:text-[#7DD3FC] transition-colors">
                    Manage list
                  </Link>
                </div>

                {upcomingCharges.length === 0 ? (
                  <StatusBanner tone="neutral" title="Nothing scheduled">
                    No active subscriptions are due in the next 30 days.
                  </StatusBanner>
                ) : (
                  <div className="space-y-3">
                    {upcomingCharges.slice(0, 7).map((subscription) => {
                      const daysUntil = getDaysUntil(subscription.nextChargeDate);
                      return (
                        <Link
                          key={subscription.id}
                          href={`/subscriptions/${subscription.id}`}
                          className="glass-light rounded-2xl p-4 flex items-center justify-between gap-4 hover:bg-white/8 transition-colors"
                        >
                          <div className="min-w-0">
                            <p className="text-[#F9FAFB] font-medium truncate">{subscription.name}</p>
                            <p className="text-sm text-[#9CA3AF]">
                              {formatDateShort(subscription.nextChargeDate)}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-semibold text-[#F9FAFB]">
                              {formatCurrency(subscription.price, currency)}
                            </p>
                            <Tag
                              variant={daysUntil <= 2 ? "error" : daysUntil <= 7 ? "warning" : "info"}
                              size="sm"
                            >
                              {daysUntil <= 0 ? "Today" : daysUntil === 1 ? "Tomorrow" : `${daysUntil} days`}
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
                  <h2 className="text-xl font-semibold text-[#F9FAFB] mb-1">Category concentration</h2>
                  <p className="text-sm text-[#9CA3AF] mb-5">Where your monthly recurring budget is concentrated</p>
                  {categoryData.length > 0 ? (
                    <DonutChart data={categoryData} />
                  ) : (
                    <StatusBanner tone="neutral" title="No category data yet">
                      Add subscriptions with categories to understand where spending clusters.
                    </StatusBanner>
                  )}
                </div>

                <div className="glass-hover rounded-3xl p-6">
                  <h2 className="text-xl font-semibold text-[#F9FAFB] mb-1">Smart signals</h2>
                  <p className="text-sm text-[#9CA3AF] mb-5">Useful changes and risks detected from current usage</p>
                  {alerts.length > 0 ? (
                    <div className="space-y-3">
                      {alerts.slice(0, 4).map((alert, index) => (
                        <StatusBanner
                          key={`${alert.type}-${index}`}
                          tone={alert.type === "UNUSED" ? "error" : alert.type === "PRECHARGE" ? "info" : "neutral"}
                          title={alert.type === "UNUSED" ? "Unused subscription" : alert.type === "PRECHARGE" ? "Upcoming charge" : "Insight"}
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
              <h2 className="text-xl font-semibold text-[#F9FAFB] mb-1">Spending trend</h2>
              <p className="text-sm text-[#9CA3AF] mb-5">Six-month view of recurring expense movement</p>
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
