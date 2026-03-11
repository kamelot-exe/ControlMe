"use client";

import React, { useState, useMemo } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppShell } from "@/components/layout/AppShell";
import { SubscriptionCard } from "@/components/subscriptions/SubscriptionCard";
import { SubscriptionDrawer } from "@/components/subscriptions/SubscriptionDrawer";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { ConnectionError } from "@/components/errors/ConnectionError";
import { ErrorState } from "@/components/ui/ErrorState";
import { useSubscriptions } from "@/hooks/use-subscriptions";
import { useMe } from "@/hooks/use-auth";
import { useApiError } from "@/hooks/use-api-error";
import { formatCurrency } from "@/lib/utils/format";
import Link from "next/link";
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

  const subscriptions: Subscription[] = useMemo(
    () => subscriptionsQuery.data?.data ?? [],
    [subscriptionsQuery.data]
  );
  const currency = meQuery.data?.data?.currency ?? "USD";

  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((sub) => {
      if (searchQuery && !sub.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (categoryFilter && sub.category !== categoryFilter) return false;
      if (statusFilter === "active" && !sub.isActive) return false;
      if (statusFilter === "inactive" && sub.isActive) return false;
      if (billingFilter !== "all" && sub.billingPeriod !== billingFilter) return false;
      return true;
    });
  }, [subscriptions, searchQuery, categoryFilter, statusFilter, billingFilter]);

  const totalMonthly = useMemo(() => {
    return filteredSubscriptions.reduce((sum, sub) => {
      const monthly = sub.billingPeriod === "MONTHLY" ? sub.price : sub.price / 12;
      return sum + monthly;
    }, 0);
  }, [filteredSubscriptions]);

  const activeCount = useMemo(() => subscriptions.filter((s) => s.isActive).length, [subscriptions]);
  const inactiveCount = useMemo(() => subscriptions.filter((s) => !s.isActive).length, [subscriptions]);

  if (subscriptionsQuery.isLoading) {
    return (
      <ProtectedRoute>
        <AppShell>
          <div className="p-8 md:p-10 lg:p-12">
            <div className="max-w-7xl space-y-8 animate-fade-in">
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
          <div className="max-w-7xl space-y-8 animate-fade-in">

          {/* Error states */}
          {apiError.isConnectionError && (
            <ConnectionError onRetry={() => subscriptionsQuery.refetch()} />
          )}
          {subscriptionsQuery.isError && !apiError.isConnectionError && (
            <ErrorState
              title="Unable to load subscriptions"
              message={apiError.errorMessage || "Please try again."}
              onRetry={() => subscriptionsQuery.refetch()}
            />
          )}

          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#F9FAFB] tracking-tight">Subscriptions</h1>
              <p className="text-[#9CA3AF] mt-1">
                {filteredSubscriptions.length} subscription{filteredSubscriptions.length !== 1 ? "s" : ""}
                {" · "}
                {formatCurrency(totalMonthly, currency)}/mo
              </p>
            </div>
            <Link href="/subscriptions/new">
              <button className="flex items-center gap-2 px-5 py-2.5 bg-[#4ADE80] text-[#060B16] font-semibold rounded-2xl hover:bg-[#4ADE80]/90 transition-all duration-[120ms] active:scale-[0.97]">
                <span className="text-lg">+</span>
                Add Subscription
              </button>
            </Link>
          </div>

          {/* Glass Filter Bar */}
          <div className="glass rounded-3xl p-5">
            <div className="flex flex-wrap gap-3">
              {/* Search */}
              <div className="flex-1 min-w-[200px] relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]">🔍</span>
                <input
                  type="text"
                  placeholder="Search subscriptions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[#F9FAFB] placeholder:text-[#6B7280] focus:outline-none focus:border-[#4ADE80]/50 transition-all duration-[120ms] text-sm"
                />
              </div>

              {/* Category filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[#F9FAFB] focus:outline-none focus:border-[#4ADE80]/50 transition-all duration-[120ms] text-sm cursor-pointer"
              >
                <option value="">All categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              {/* Status toggle pills */}
              <div className="flex bg-white/5 rounded-xl p-1 gap-1">
                {(["all", "active", "inactive"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-[120ms] capitalize ${
                      statusFilter === s
                        ? "bg-[#4ADE80] text-[#060B16]"
                        : "text-[#9CA3AF] hover:text-[#F9FAFB]"
                    }`}
                  >
                    {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>

              {/* Billing toggle pills */}
              <div className="flex bg-white/5 rounded-xl p-1 gap-1">
                {(["all", "MONTHLY", "YEARLY"] as const).map((b) => (
                  <button
                    key={b}
                    onClick={() => setBillingFilter(b)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-[120ms] ${
                      billingFilter === b
                        ? "bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]/30"
                        : "text-[#9CA3AF] hover:text-[#F9FAFB]"
                    }`}
                  >
                    {b === "all" ? "All" : b.charAt(0) + b.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="glass-light rounded-2xl p-4 text-center">
              <p className="text-xs text-[#9CA3AF] uppercase tracking-wider mb-1">Monthly Total</p>
              <p className="text-2xl font-bold text-[#4ADE80]">{formatCurrency(totalMonthly, currency)}</p>
            </div>
            <div className="glass-light rounded-2xl p-4 text-center">
              <p className="text-xs text-[#9CA3AF] uppercase tracking-wider mb-1">Active</p>
              <p className="text-2xl font-bold text-[#F9FAFB]">{activeCount}</p>
            </div>
            <div className="glass-light rounded-2xl p-4 text-center">
              <p className="text-xs text-[#9CA3AF] uppercase tracking-wider mb-1">Inactive</p>
              <p className="text-2xl font-bold text-[#9CA3AF]">{inactiveCount}</p>
            </div>
          </div>

          {/* Subscription Grid or Empty State */}
          {filteredSubscriptions.length === 0 ? (
            <div className="glass rounded-3xl p-16 text-center">
              <p className="text-5xl mb-4">📭</p>
              <h3 className="text-xl font-semibold text-[#F9FAFB] mb-2">No subscriptions found</h3>
              <p className="text-[#9CA3AF]">
                {subscriptions.length === 0
                  ? "Add your first subscription to get started"
                  : "Try adjusting your filters"}
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredSubscriptions.map((sub, index) => (
                <div
                  key={sub.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.04}s` }}
                >
                  <SubscriptionCard
                    subscription={sub}
                    currency={currency}
                    onEdit={(s) => setEditSubscription(s)}
                  />
                </div>
              ))}
            </div>
          )}
          </div>
        </div>

        {/* Quick-edit drawer */}
        <SubscriptionDrawer
          subscription={editSubscription}
          onClose={() => setEditSubscription(null)}
        />
      </AppShell>
    </ProtectedRoute>
  );
}
