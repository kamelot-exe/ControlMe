"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search, SlidersHorizontal } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ConnectionError } from "@/components/errors/ConnectionError";
import { AppShell } from "@/components/layout/AppShell";
import { SubscriptionCard } from "@/components/subscriptions/SubscriptionCard";
import { SubscriptionDrawer } from "@/components/subscriptions/SubscriptionDrawer";
import { ErrorState, EmptyState, StatusBanner, Tag } from "@/components/ui";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { useMe } from "@/hooks/use-auth";
import { useSubscriptions } from "@/hooks/use-subscriptions";
import { useApiError } from "@/hooks/use-api-error";
import { formatCurrency, getDaysUntil } from "@/lib/utils/format";
import type { Subscription } from "@/shared/types";

const CATEGORIES = [
  "Streaming",
  "Software",
  "Gym",
  "Music",
  "Cloud",
  "News",
  "Education",
  "Gaming",
  "Finance",
  "Other",
];

export default function SubscriptionsPage() {
  const subscriptionsQuery = useSubscriptions();
  const meQuery = useMe();
  const apiError = useApiError(subscriptionsQuery);

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [billingFilter, setBillingFilter] = useState<"all" | "MONTHLY" | "YEARLY">("all");
  const [editSubscription, setEditSubscription] = useState<Subscription | null>(null);

  const subscriptions = useMemo(
    () => subscriptionsQuery.data?.data ?? [],
    [subscriptionsQuery.data]
  );

  const currency = meQuery.data?.data?.currency ?? "USD";

  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((subscription) => {
      if (
        searchQuery &&
        !subscription.name.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      if (categoryFilter && subscription.category !== categoryFilter) {
        return false;
      }
      if (statusFilter === "active" && !subscription.isActive) {
        return false;
      }
      if (statusFilter === "inactive" && subscription.isActive) {
        return false;
      }
      if (billingFilter !== "all" && subscription.billingPeriod !== billingFilter) {
        return false;
      }
      return true;
    });
  }, [billingFilter, categoryFilter, searchQuery, statusFilter, subscriptions]);

  const totalMonthly = useMemo(() => {
    return filteredSubscriptions.reduce((sum, subscription) => {
      const monthlyEquivalent =
        subscription.billingPeriod === "MONTHLY"
          ? subscription.price
          : subscription.price / 12;
      return sum + monthlyEquivalent;
    }, 0);
  }, [filteredSubscriptions]);

  const activeCount = useMemo(
    () => subscriptions.filter((subscription) => subscription.isActive).length,
    [subscriptions]
  );
  const inactiveCount = useMemo(
    () => subscriptions.filter((subscription) => !subscription.isActive).length,
    [subscriptions]
  );

  const upcomingCount = useMemo(
    () =>
      subscriptions.filter((subscription) => {
        const days = getDaysUntil(subscription.nextChargeDate);
        return subscription.isActive && days >= 0 && days <= 7;
      }).length,
    [subscriptions]
  );

  const mostExpensive = useMemo(() => {
    return [...subscriptions].sort((a, b) => {
      const aMonthly = a.billingPeriod === "MONTHLY" ? a.price : a.price / 12;
      const bMonthly = b.billingPeriod === "MONTHLY" ? b.price : b.price / 12;
      return bMonthly - aMonthly;
    })[0];
  }, [subscriptions]);

  if (subscriptionsQuery.isLoading) {
    return (
      <ProtectedRoute>
        <AppShell>
          <div className="p-8 md:p-10 lg:p-12">
            <div className="max-w-7xl space-y-8">
              <SkeletonCard />
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
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
            {apiError.isConnectionError ? (
              <ConnectionError onRetry={() => subscriptionsQuery.refetch()} />
            ) : null}

            {subscriptionsQuery.isError && !apiError.isConnectionError ? (
              <ErrorState
                title="Unable to load subscriptions"
                message={apiError.errorMessage || "Please try again in a moment."}
                onRetry={() => subscriptionsQuery.refetch()}
              />
            ) : null}

            <section className="rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_28%),linear-gradient(135deg,rgba(10,17,32,0.98),rgba(5,8,22,0.95))] p-7 md:p-8">
              <div className="grid gap-8 lg:grid-cols-[1.35fr_0.95fr]">
                <div className="space-y-4">
                  <Tag variant="success" size="md">
                    Subscription control
                  </Tag>
                  <div className="space-y-3">
                    <h1 className="text-4xl font-semibold tracking-tight text-[#F9FAFB] md:text-5xl">
                      See every recurring cost in one calm, usable view.
                    </h1>
                    <p className="max-w-2xl text-base leading-relaxed text-[#A5B4C3] md:text-lg">
                      Filter the noise, surface the expensive outliers, and keep renewals visible
                      before they quietly stack up.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link href="/subscriptions/new">
                      <button className="inline-flex items-center gap-2 rounded-2xl bg-[#4ADE80] px-5 py-3 text-sm font-semibold text-[#05111A] transition hover:bg-[#74E6A1]">
                        <Plus className="h-4 w-4" />
                        Add subscription
                      </button>
                    </Link>
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-[#C6D3DC]">
                      {filteredSubscriptions.length} visible
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-[#6B7280]">Monthly load</p>
                    <p className="mt-3 text-2xl font-semibold text-[#4ADE80]">
                      {formatCurrency(totalMonthly, currency)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-[#6B7280]">Active</p>
                    <p className="mt-3 text-2xl font-semibold text-[#F9FAFB]">{activeCount}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-[#6B7280]">Inactive</p>
                    <p className="mt-3 text-2xl font-semibold text-[#9CA3AF]">{inactiveCount}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-[#6B7280]">Due soon</p>
                    <p className="mt-3 text-2xl font-semibold text-[#7DD3FC]">{upcomingCount}</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.9),rgba(6,11,22,0.95))] p-5 md:p-6">
              <div className="mb-4 flex items-center gap-2 text-sm font-medium text-[#D0D8E0]">
                <SlidersHorizontal className="h-4 w-4 text-[#7DD3FC]" />
                Filters
              </div>

              <div className="grid gap-3 xl:grid-cols-[1.4fr_0.8fr_0.8fr_0.9fr]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search by service name"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-[#F9FAFB] outline-none transition placeholder:text-[#6B7280] focus:border-[#4ADE80]/35"
                  />
                </div>

                <select
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[#F9FAFB] outline-none transition focus:border-[#4ADE80]/35"
                >
                  <option value="">All categories</option>
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>

                <div className="flex rounded-2xl border border-white/10 bg-white/5 p-1">
                  {(["all", "active", "inactive"] as const).map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setStatusFilter(value)}
                      className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium capitalize transition ${
                        statusFilter === value
                          ? "bg-[#4ADE80] text-[#05111A]"
                          : "text-[#9CA3AF] hover:text-[#F9FAFB]"
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>

                <div className="flex rounded-2xl border border-white/10 bg-white/5 p-1">
                  {(["all", "MONTHLY", "YEARLY"] as const).map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setBillingFilter(value)}
                      className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium transition ${
                        billingFilter === value
                          ? "bg-[#38BDF8]/16 text-[#7DD3FC]"
                          : "text-[#9CA3AF] hover:text-[#F9FAFB]"
                      }`}
                    >
                      {value === "all" ? "All" : value === "MONTHLY" ? "Monthly" : "Yearly"}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {mostExpensive ? (
              <StatusBanner tone="info" title="Highest monthly exposure">
                {mostExpensive.name} currently has the highest monthly impact at{" "}
                {formatCurrency(
                  mostExpensive.billingPeriod === "MONTHLY"
                    ? mostExpensive.price
                    : mostExpensive.price / 12,
                  currency
                )}
                .
              </StatusBanner>
            ) : null}

            {filteredSubscriptions.length === 0 ? (
              <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.88),rgba(6,11,22,0.94))]">
                <EmptyState
                  title={
                    subscriptions.length === 0
                      ? "No subscriptions yet"
                      : "Nothing matches these filters"
                  }
                  description={
                    subscriptions.length === 0
                      ? "Start with the services that renew every month. ControlMe becomes useful once your recurring costs are visible."
                      : "Try broadening your filters or clear the search to bring subscriptions back into view."
                  }
                  action={
                    subscriptions.length === 0
                      ? {
                          label: "Add first subscription",
                          onClick: () => {
                            window.location.href = "/subscriptions/new";
                          },
                        }
                      : undefined
                  }
                />
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filteredSubscriptions.map((subscription, index) => (
                  <div
                    key={subscription.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 0.04}s` }}
                  >
                    <SubscriptionCard
                      subscription={subscription}
                      currency={currency}
                      onEdit={(nextSubscription) => setEditSubscription(nextSubscription)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <SubscriptionDrawer
          subscription={editSubscription}
          onClose={() => setEditSubscription(null)}
        />
      </AppShell>
    </ProtectedRoute>
  );
}
