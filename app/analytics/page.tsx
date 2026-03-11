"use client";

import React from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Chart } from "@/components/ui/Chart";
import { DonutChart } from "@/components/ui/DonutChart";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  useMonthlyAnalytics,
  useSpendingHistory,
  useSavingsSummary,
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
    <div className="glass rounded-3xl p-6 animate-pulse">
      <div className="h-3 w-24 bg-white/10 rounded-full mb-4" />
      <div className="h-9 w-32 bg-white/10 rounded-full mb-3" />
      <div className="h-3 w-16 bg-white/10 rounded-full" />
    </div>
  );
}

export default function AnalyticsPage() {
  const { data: monthlyData, isLoading: monthlyLoading } = useMonthlyAnalytics();
  const { data: historyData, isLoading: historyLoading } = useSpendingHistory();
  const { data: savingsData, isLoading: savingsLoading } = useSavingsSummary();
  const { data: meData } = useMe();

  const analytics = monthlyData?.data;
  const spendingHistory = historyData?.data ?? [];
  const savingsSummary = savingsData?.data;
  const currency = (meData?.data?.currency ?? "USD") as Currency;

  const categoryChartData =
    analytics?.categoryBreakdown.map((item, index) => ({
      name: item.category,
      value: item.total,
      color: COLORS[index % COLORS.length],
    })) ?? [];

  const spendingChartData = spendingHistory.map((item) => ({
    name: item.month,
    value: item.total,
  }));

  const isLoading = monthlyLoading || historyLoading || savingsLoading;

  if (isLoading) {
    return (
      <ProtectedRoute>
        <AppShell>
          <div className="p-8 md:p-10 lg:p-12">
            <div className="max-w-7xl space-y-8 animate-fade-in">
            <div className="space-y-3">
              <div className="h-12 w-48 bg-white/10 rounded-2xl animate-pulse" />
              <div className="h-5 w-72 bg-white/5 rounded-xl animate-pulse" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </div>
            <div className="grid gap-8 lg:grid-cols-2">
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

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="p-8 md:p-10 lg:p-12">
          <div className="max-w-7xl space-y-8 animate-fade-in">

          {/* Page Title */}
          <div className="space-y-3 animate-slide-up">
            <h1 className="text-5xl font-bold text-[#F9FAFB] tracking-tight">Analytics</h1>
            <p className="text-lg text-[#9CA3AF]">
              Detailed insights into your subscription spending
            </p>
          </div>

          {/* Summary Row */}
          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-slide-up"
            style={{ animationDelay: "0.05s" }}
          >
            {/* Monthly Total */}
            <div className="glass rounded-3xl p-6">
              <p className="text-xs text-[#9CA3AF] uppercase tracking-wider mb-2">Monthly Total</p>
              <p className="text-3xl font-bold text-[#4ADE80] tracking-tight">
                {formatCurrency(analytics?.totalMonthlyCost ?? 0, currency)}
              </p>
              <p className="text-sm text-[#9CA3AF] mt-1">Per month</p>
            </div>

            {/* Yearly Total */}
            <div className="glass rounded-3xl p-6">
              <p className="text-xs text-[#9CA3AF] uppercase tracking-wider mb-2">Yearly Total</p>
              <p className="text-3xl font-bold text-[#F9FAFB] tracking-tight">
                {formatCurrency(analytics?.totalYearlyCost ?? 0, currency)}
              </p>
              <p className="text-sm text-[#9CA3AF] mt-1">Per year</p>
            </div>

            {/* Active Subscriptions */}
            <div className="glass rounded-3xl p-6">
              <p className="text-xs text-[#9CA3AF] uppercase tracking-wider mb-2">Active Subs</p>
              <p className="text-3xl font-bold text-[#38BDF8] tracking-tight">
                {analytics?.activeSubscriptions ?? 0}
              </p>
              <p className="text-sm text-[#9CA3AF] mt-1">Subscriptions</p>
            </div>
          </div>

          {/* Charts Grid */}
          <div
            className="grid gap-8 lg:grid-cols-2 animate-slide-up"
            style={{ animationDelay: "0.1s" }}
          >
            {/* Spending History */}
            <Card className="glass-hover">
              <CardHeader>
                <CardTitle>Spending History</CardTitle>
                <CardDescription>Last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                {spendingChartData.length === 0 ? (
                  <EmptyState
                    icon="📊"
                    title="Not enough data yet"
                    description="Add subscriptions to see spending history"
                  />
                ) : (
                  <div className="animate-fade-in">
                    <Chart
                      data={spendingChartData}
                      dataKey="value"
                      type="area"
                      color="#4ADE80"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Category Donut */}
            <Card className="glass-hover">
              <CardHeader>
                <CardTitle>Category Breakdown</CardTitle>
                <CardDescription>Distribution by category</CardDescription>
              </CardHeader>
              <CardContent>
                {categoryChartData.length === 0 ? (
                  <EmptyState
                    icon="📈"
                    title="No data"
                    description="Add subscriptions to see category breakdown"
                  />
                ) : (
                  <div className="animate-fade-in">
                    <DonutChart data={categoryChartData} />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Unused Cost Block */}
          {savingsSummary && savingsSummary.unusedCount > 0 && (
            <div
              className="rounded-3xl p-6 border border-[#F87171]/20 animate-slide-up"
              style={{
                background: "rgba(248, 113, 113, 0.05)",
                animationDelay: "0.15s",
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#F87171] font-semibold text-lg">Potential Savings</p>
                  <p className="text-[#9CA3AF] text-sm mt-1">
                    You have {savingsSummary.unusedCount} unused subscription
                    {savingsSummary.unusedCount !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-[#F87171]">
                    {formatCurrency(savingsSummary.monthlySavings, currency)}
                  </p>
                  <p className="text-[#9CA3AF] text-sm">/month wasted</p>
                </div>
              </div>
            </div>
          )}

          {/* Category Breakdown List */}
          {(analytics?.categoryBreakdown?.length ?? 0) > 0 && (
            <div
              className="glass-hover rounded-3xl p-6 animate-slide-up"
              style={{ animationDelay: "0.2s" }}
            >
              <h3 className="text-lg font-semibold text-[#F9FAFB] mb-4">Category Details</h3>
              <div className="space-y-3">
                {analytics!.categoryBreakdown.map((item, i) => (
                  <div
                    key={item.category}
                    className="flex items-center justify-between glass-light rounded-2xl p-3 animate-fade-in"
                    style={{ animationDelay: `${i * 0.04}s` }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: COLORS[i % COLORS.length] }}
                      />
                      <span className="text-[#F9FAFB] font-medium">{item.category}</span>
                      <span className="text-[#9CA3AF] text-sm">
                        {item.count} sub{item.count !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <span className="text-[#4ADE80] font-semibold">
                      {formatCurrency(item.total, currency)}/mo
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
