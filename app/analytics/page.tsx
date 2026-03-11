"use client";

import React, { useMemo } from "react";
import { ArrowUpRight, ChartNoAxesCombined, CircleDollarSign, PiggyBank } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Chart } from "@/components/ui/Chart";
import { DonutChart } from "@/components/ui/DonutChart";
import { EmptyState, StatusBanner, Tag } from "@/components/ui";
import { SkeletonCard } from "@/components/ui/Skeleton";
import {
  useMonthlyAnalytics,
  useSavingsSummary,
  useSpendingHistory,
} from "@/hooks/use-analytics";
import { useMe } from "@/hooks/use-auth";
import { formatCurrency } from "@/lib/utils/format";
import type { Currency } from "@/shared/types";

const COLORS = [
  "#4ADE80",
  "#38BDF8",
  "#F97373",
  "#F59E0B",
  "#8B5CF6",
  "#EC4899",
  "#10B981",
  "#6366F1",
];

function StatCardSkeleton() {
  return (
    <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.88),rgba(6,11,22,0.94))] p-6 animate-pulse">
      <div className="mb-4 h-3 w-24 rounded-full bg-white/10" />
      <div className="mb-3 h-9 w-32 rounded-full bg-white/10" />
      <div className="h-3 w-16 rounded-full bg-white/10" />
    </div>
  );
}

export default function AnalyticsPage() {
  const monthlyQuery = useMonthlyAnalytics();
  const historyQuery = useSpendingHistory();
  const savingsQuery = useSavingsSummary();
  const meQuery = useMe();

  const analytics = monthlyQuery.data?.data;
  const savings = savingsQuery.data?.data;
  const spendingHistory = useMemo(() => historyQuery.data?.data ?? [], [historyQuery.data]);
  const currency = (meQuery.data?.data?.currency ?? "USD") as Currency;
  const categoryBreakdown = useMemo(() => analytics?.categoryBreakdown ?? [], [analytics]);

  const categoryChartData = useMemo(
    () =>
      categoryBreakdown.map((item, index) => ({
        name: item.category,
        value: item.total,
        color: COLORS[index % COLORS.length],
      })),
    [categoryBreakdown]
  );

  const historyChartData = useMemo(
    () =>
      spendingHistory.map((item) => ({
        name: item.month,
        value: item.total,
      })),
    [spendingHistory]
  );

  const largestCategory = categoryBreakdown[0];
  const savingsRatio =
    analytics && savings && analytics.totalMonthlyCost > 0
      ? (savings.monthlySavings / analytics.totalMonthlyCost) * 100
      : 0;

  const averagePerActive =
    analytics && analytics.activeSubscriptions > 0
      ? analytics.totalMonthlyCost / analytics.activeSubscriptions
      : 0;

  const isLoading =
    monthlyQuery.isLoading || historyQuery.isLoading || savingsQuery.isLoading;

  if (isLoading) {
    return (
      <ProtectedRoute>
        <AppShell>
          <div className="p-8 md:p-10 lg:p-12">
            <div className="max-w-7xl space-y-8">
              <SkeletonCard />
              <div className="grid gap-4 md:grid-cols-3">
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </div>
              <div className="grid gap-8 lg:grid-cols-2">
                <SkeletonCard />
                <SkeletonCard />
              </div>
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
          <div className="mx-auto max-w-7xl space-y-8 animate-fade-in">
            <section className="rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(74,222,128,0.16),transparent_28%),linear-gradient(135deg,rgba(10,17,32,0.98),rgba(5,8,22,0.95))] p-7 md:p-8">
              <div className="grid gap-8 lg:grid-cols-[1.35fr_0.95fr]">
                <div className="space-y-4">
                  <Tag variant="success" size="md">
                    Spending intelligence
                  </Tag>
                  <div className="space-y-3">
                    <h1 className="text-4xl font-semibold tracking-tight text-[#F9FAFB] md:text-5xl">
                      Understand what is driving your recurring spend.
                    </h1>
                    <p className="max-w-2xl text-base leading-relaxed text-[#A5B4C3] md:text-lg">
                      Analytics should help you decide what to keep, what to downgrade, and what
                      no longer deserves space in your monthly budget.
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-[#6B7280]">Monthly spend</p>
                    <p className="mt-3 text-2xl font-semibold text-[#4ADE80]">
                      {formatCurrency(analytics?.totalMonthlyCost ?? 0, currency)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-[#6B7280]">Yearly spend</p>
                    <p className="mt-3 text-2xl font-semibold text-[#F9FAFB]">
                      {formatCurrency(analytics?.totalYearlyCost ?? 0, currency)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-[#6B7280]">Active subscriptions</p>
                    <p className="mt-3 text-2xl font-semibold text-[#7DD3FC]">
                      {analytics?.activeSubscriptions ?? 0}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-[#6B7280]">Avg per active</p>
                    <p className="mt-3 text-2xl font-semibold text-[#F9FAFB]">
                      {formatCurrency(averagePerActive, currency)}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {analytics?.activeSubscriptions ? (
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.88),rgba(6,11,22,0.94))] p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-2.5 text-[#4ADE80]">
                      <CircleDollarSign className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#F9FAFB]">Largest category</p>
                      <p className="text-sm text-[#94A3B8]">The biggest share of monthly spend.</p>
                    </div>
                  </div>
                  <p className="text-2xl font-semibold text-[#F9FAFB]">
                    {largestCategory?.category ?? "No category data"}
                  </p>
                  <p className="mt-2 text-sm text-[#94A3B8]">
                    {largestCategory
                      ? `${formatCurrency(largestCategory.total, currency)} across ${largestCategory.count} subscriptions`
                      : "Add subscriptions to see category concentration."}
                  </p>
                </div>

                <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.88),rgba(6,11,22,0.94))] p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-2.5 text-[#7DD3FC]">
                      <ChartNoAxesCombined className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#F9FAFB]">Trend read</p>
                      <p className="text-sm text-[#94A3B8]">How spending behaves over time.</p>
                    </div>
                  </div>
                  <p className="text-2xl font-semibold text-[#F9FAFB]">
                    {historyChartData.length > 1 ? "Trend available" : "Early data"}
                  </p>
                  <p className="mt-2 text-sm text-[#94A3B8]">
                    {historyChartData.length > 1
                      ? "Use the history chart below to judge whether recurring costs are creeping upward."
                      : "More monthly history is needed before trends become meaningful."}
                  </p>
                </div>

                <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.88),rgba(6,11,22,0.94))] p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-2.5 text-[#F59E0B]">
                      <PiggyBank className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#F9FAFB]">Savings potential</p>
                      <p className="text-sm text-[#94A3B8]">Unused services worth revisiting.</p>
                    </div>
                  </div>
                  <p className="text-2xl font-semibold text-[#F9FAFB]">
                    {formatCurrency(savings?.monthlySavings ?? 0, currency)}
                  </p>
                  <p className="mt-2 text-sm text-[#94A3B8]">
                    {savings?.unusedCount
                      ? `${savings.unusedCount} subscriptions currently look unused.`
                      : "No unused subscriptions detected right now."}
                  </p>
                </div>
              </div>
            ) : null}

            {savings && savings.unusedCount > 0 ? (
              <StatusBanner tone="error" title="Potential savings">
                Unused subscriptions account for {formatCurrency(savings.monthlySavings, currency)} per
                month, roughly {savingsRatio.toFixed(0)}% of total recurring spend.
              </StatusBanner>
            ) : null}

            <div className="grid gap-8 lg:grid-cols-2">
              <Card className="glass-hover">
                <CardHeader>
                  <CardTitle>Spending history</CardTitle>
                  <CardDescription>Monthly trend across the last recorded periods.</CardDescription>
                </CardHeader>
                <CardContent>
                  {historyChartData.length === 0 ? (
                    <EmptyState
                      title="Not enough history yet"
                      description="As you keep subscriptions active over time, ControlMe will show whether recurring spend is drifting upward or staying stable."
                    />
                  ) : (
                    <Chart
                      data={historyChartData}
                      dataKey="value"
                      type="area"
                      color="#4ADE80"
                    />
                  )}
                </CardContent>
              </Card>

              <Card className="glass-hover">
                <CardHeader>
                  <CardTitle>Category mix</CardTitle>
                  <CardDescription>How your monthly spend is distributed by category.</CardDescription>
                </CardHeader>
                <CardContent>
                  {categoryChartData.length === 0 ? (
                    <EmptyState
                      title="No category data yet"
                      description="Add subscriptions first to see which groups dominate your recurring costs."
                    />
                  ) : (
                    <DonutChart data={categoryChartData} />
                  )}
                </CardContent>
              </Card>
            </div>

            {categoryBreakdown.length > 0 ? (
              <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.88),rgba(6,11,22,0.94))] p-6">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-[#F9FAFB]">Category details</h2>
                    <p className="mt-1 text-sm text-[#94A3B8]">
                      The categories below are ordered by their monthly financial weight.
                    </p>
                  </div>
                  <Tag variant="info" size="md">
                    {categoryBreakdown.length} categories
                  </Tag>
                </div>

                <div className="space-y-3">
                  {categoryBreakdown.map((item, index) => (
                    <div
                      key={item.category}
                      className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <div>
                          <p className="font-medium text-[#F9FAFB]">{item.category}</p>
                          <p className="text-sm text-[#94A3B8]">
                            {item.count} subscription{item.count === 1 ? "" : "s"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-[#94A3B8]">
                          {(analytics?.totalMonthlyCost ?? 0) > 0
                            ? `${((item.total / (analytics?.totalMonthlyCost ?? 1)) * 100).toFixed(0)}% of monthly spend`
                            : "0% of monthly spend"}
                        </span>
                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#4ADE80]">
                          {formatCurrency(item.total, currency)}
                          <ArrowUpRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
