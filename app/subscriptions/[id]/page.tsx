"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Globe, Pencil, Trash2 } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ErrorState, StatusBanner, Tag } from "@/components/ui";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { useMe } from "@/hooks/use-auth";
import {
  useConfirmSubscriptionUse,
  useDeleteSubscription,
  useSubscription,
  useUpdateSubscription,
} from "@/hooks/use-subscriptions";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDate, getDaysUntil } from "@/lib/utils/format";
import type { BillingPeriod, Currency, UpdateSubscriptionDto } from "@/shared/types";

const categoryBadges: Record<string, string> = {
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

export default function SubscriptionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const subscriptionQuery = useSubscription(params.id);
  const meQuery = useMe();
  const updateMutation = useUpdateSubscription();
  const deleteMutation = useDeleteSubscription();
  const confirmUseMutation = useConfirmSubscriptionUse();

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState<UpdateSubscriptionDto>({});
  const [feedback, setFeedback] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);

  const subscription = subscriptionQuery.data?.data;
  const currency = (meQuery.data?.data?.currency ?? "USD") as Currency;

  useEffect(() => {
    if (!subscription) return;
    setFormData({
      name: subscription.name,
      price: subscription.price,
      billingPeriod: subscription.billingPeriod,
      nextChargeDate:
        typeof subscription.nextChargeDate === "string"
          ? subscription.nextChargeDate.split("T")[0]
          : new Date(subscription.nextChargeDate).toISOString().split("T")[0],
      category: subscription.category,
      notes: subscription.notes ?? "",
      websiteUrl: subscription.websiteUrl ?? "",
      isActive: subscription.isActive,
    });
  }, [subscription]);

  if (subscriptionQuery.isLoading) {
    return (
      <ProtectedRoute>
        <AppShell>
          <div className="p-8 md:p-10 lg:p-12">
            <div className="max-w-6xl">
              <SkeletonCard />
            </div>
          </div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  if (subscriptionQuery.isError || !subscription) {
    return (
      <ProtectedRoute>
        <AppShell>
          <div className="p-8 md:p-10 lg:p-12">
            <div className="max-w-5xl">
              <ErrorState
                title="Subscription not found"
                message="The subscription could not be loaded or no longer exists."
                onRetry={() => router.push("/subscriptions")}
              />
            </div>
          </div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  const daysUntil = getDaysUntil(subscription.nextChargeDate);
  const monthlyEquivalent =
    subscription.billingPeriod === "MONTHLY" ? subscription.price : subscription.price / 12;
  const yearlyEquivalent =
    subscription.billingPeriod === "YEARLY" ? subscription.price : subscription.price * 12;
  const icon = categoryBadges[subscription.category] ?? categoryBadges.Other;
  const nextChargeTone = daysUntil < 0 ? "text-[#F97373]" : daysUntil <= 7 ? "text-[#F59E0B]" : "text-[#F9FAFB]";
  const subscriptionId = subscription.id;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFeedback(null);

    try {
      await updateMutation.mutateAsync({
        id: subscriptionId,
        data: formData,
      });
      setIsEditing(false);
      setFeedback({ tone: "success", message: "Subscription updated." });
    } catch (error) {
      setFeedback({
        tone: "error",
        message: error instanceof Error ? error.message : "Failed to update subscription.",
      });
    }
  }

  async function handleDelete() {
    try {
      await deleteMutation.mutateAsync(subscriptionId);
      router.push("/subscriptions");
    } catch (error) {
      setFeedback({
        tone: "error",
        message: error instanceof Error ? error.message : "Failed to delete subscription.",
      });
      setShowDeleteConfirm(false);
    }
  }

  async function handleConfirmUse() {
    setFeedback(null);
    try {
      await confirmUseMutation.mutateAsync(subscriptionId);
      setFeedback({ tone: "success", message: "Usage confirmed for today." });
    } catch (error) {
      setFeedback({
        tone: "error",
        message: error instanceof Error ? error.message : "Unable to confirm usage.",
      });
    }
  }

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="p-8 md:p-10 lg:p-12">
          <div className="mx-auto max-w-6xl space-y-8 animate-fade-in">
            <Link
              href="/subscriptions"
              className="inline-flex items-center gap-2 text-sm text-[#9CA3AF] transition hover:text-[#F9FAFB]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to subscriptions
            </Link>

            <section className="rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(74,222,128,0.16),transparent_26%),linear-gradient(135deg,rgba(10,17,32,0.98),rgba(5,8,22,0.94))] p-7 md:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-white/5 text-sm font-semibold tracking-[0.22em] text-[#D8E2EA]">
                    {icon}
                  </div>
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <h1 className="text-4xl font-semibold tracking-tight text-[#F9FAFB]">
                        {subscription.name}
                      </h1>
                      <Tag variant={subscription.isActive ? "success" : "error"} size="md">
                        {subscription.isActive ? "Active" : "Inactive"}
                      </Tag>
                      <Tag variant="info" size="md">
                        {subscription.category}
                      </Tag>
                    </div>
                    <p className="max-w-2xl text-base leading-relaxed text-[#94A3B8]">
                      Review billing timing, adjust details, and spot whether this subscription
                      still earns its place in your monthly budget.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  {!isEditing ? (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setFeedback(null);
                          setIsEditing(true);
                        }}
                        className="border-[#38BDF8]/30 text-[#7DD3FC] hover:bg-[#38BDF8]/10"
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => setShowDeleteConfirm((value) => !value)}
                        className="text-[#FCA5A5] hover:bg-[#F87171]/10 hover:text-[#FCA5A5]"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </>
                  ) : (
                    <Button variant="ghost" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  )}
                </div>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-[#6B7280]">Monthly load</p>
                  <p className="mt-3 text-2xl font-semibold text-[#4ADE80]">
                    {formatCurrency(monthlyEquivalent, currency)}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-[#6B7280]">Next charge</p>
                  <p className={cn("mt-3 text-2xl font-semibold", nextChargeTone)}>
                    {daysUntil < 0 ? `${Math.abs(daysUntil)}d overdue` : `${daysUntil}d`}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-[#6B7280]">Yearly impact</p>
                  <p className="mt-3 text-2xl font-semibold text-[#F9FAFB]">
                    {formatCurrency(yearlyEquivalent, currency)}
                  </p>
                </div>
              </div>
            </section>

            {feedback ? <StatusBanner tone={feedback.tone}>{feedback.message}</StatusBanner> : null}

            {showDeleteConfirm ? (
              <StatusBanner tone="error" title="Delete subscription">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <span>This removes the subscription and its usage history from your account.</span>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={deleteMutation.isPending}
                      className="rounded-xl bg-[#F87171] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#FB8B8B] disabled:opacity-50"
                    >
                      {deleteMutation.isPending ? "Deleting..." : "Delete now"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-[#D3DBE4] transition hover:bg-white/10"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </StatusBanner>
            ) : null}

            <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
              <Card className="glass-hover">
                <CardHeader>
                  <CardTitle>{isEditing ? "Edit details" : "Subscription details"}</CardTitle>
                  <CardDescription>
                    {isEditing
                      ? "Update billing data, activity state, and context."
                      : "Core subscription information and reference notes."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <Input
                        label="Name"
                        value={formData.name ?? ""}
                        onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                        required
                      />
                      <div className="grid gap-4 md:grid-cols-2">
                        <Input
                          label="Price"
                          type="number"
                          step="0.01"
                          value={formData.price ?? ""}
                          onChange={(event) =>
                            setFormData({
                              ...formData,
                              price: Number(event.target.value),
                            })
                          }
                          required
                        />
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-[#F9FAFB]/80">
                            Billing period
                          </label>
                          <select
                            value={formData.billingPeriod ?? "MONTHLY"}
                            onChange={(event) =>
                              setFormData({
                                ...formData,
                                billingPeriod: event.target.value as BillingPeriod,
                              })
                            }
                            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[#F9FAFB] outline-none transition hover:bg-white/10 focus:border-[#4ADE80]/35"
                          >
                            <option value="MONTHLY">Monthly</option>
                            <option value="YEARLY">Yearly</option>
                          </select>
                        </div>
                      </div>
                      <Input
                        label="Next charge date"
                        type="date"
                        value={typeof formData.nextChargeDate === "string" ? formData.nextChargeDate : ""}
                        onChange={(event) =>
                          setFormData({ ...formData, nextChargeDate: event.target.value })
                        }
                        required
                      />
                      <div className="grid gap-4 md:grid-cols-2">
                        <Input
                          label="Category"
                          value={formData.category ?? ""}
                          onChange={(event) => setFormData({ ...formData, category: event.target.value })}
                          required
                        />
                        <Input
                          label="Website URL"
                          type="url"
                          value={formData.websiteUrl ?? ""}
                          onChange={(event) =>
                            setFormData({ ...formData, websiteUrl: event.target.value })
                          }
                          placeholder="https://"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[#F9FAFB]/80">Notes</label>
                        <textarea
                          value={formData.notes ?? ""}
                          onChange={(event) => setFormData({ ...formData, notes: event.target.value })}
                          placeholder="Useful context, renewal details, or cancellation notes."
                          className="min-h-[120px] w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[#F9FAFB] outline-none transition hover:bg-white/10 focus:border-[#4ADE80]/35"
                        />
                      </div>
                      <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                        <input
                          type="checkbox"
                          checked={formData.isActive ?? true}
                          onChange={(event) =>
                            setFormData({ ...formData, isActive: event.target.checked })
                          }
                          className="h-5 w-5 accent-[#4ADE80]"
                        />
                        <span className="text-sm text-[#F9FAFB]">Subscription is active</span>
                      </label>
                      <div className="flex gap-3">
                        <Button type="submit" disabled={updateMutation.isPending} className="flex-1">
                          {updateMutation.isPending ? "Saving..." : "Save changes"}
                        </Button>
                        <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <p className="text-sm text-[#9CA3AF]">Price</p>
                          <p className="mt-2 text-2xl font-semibold text-[#F9FAFB]">
                            {formatCurrency(subscription.price, currency)}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <p className="text-sm text-[#9CA3AF]">Billing period</p>
                          <p className="mt-2 text-2xl font-semibold text-[#F9FAFB]">
                            {subscription.billingPeriod === "MONTHLY" ? "Monthly" : "Yearly"}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-sm text-[#9CA3AF]">Next charge date</p>
                        <p className={cn("mt-2 text-xl font-semibold", nextChargeTone)}>
                          {formatDate(subscription.nextChargeDate)}
                        </p>
                        <p className="mt-1 text-sm text-[#94A3B8]">
                          {daysUntil < 0
                            ? `${Math.abs(daysUntil)} days overdue`
                            : `${daysUntil} day${daysUntil === 1 ? "" : "s"} until renewal`}
                        </p>
                      </div>

                      {subscription.websiteUrl ? (
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <p className="text-sm text-[#9CA3AF]">Website</p>
                          <a
                            href={subscription.websiteUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-[#7DD3FC] transition hover:text-[#A5E4FF]"
                          >
                            <Globe className="h-4 w-4" />
                            Open service website
                          </a>
                        </div>
                      ) : null}

                      {subscription.notes ? (
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <p className="text-sm text-[#9CA3AF]">Notes</p>
                          <p className="mt-2 leading-relaxed text-[#D3DBE4]">{subscription.notes}</p>
                        </div>
                      ) : null}
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card className="glass-hover">
                  <CardHeader>
                    <CardTitle>Quick actions</CardTitle>
                    <CardDescription>Useful controls for this subscription.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button
                      onClick={handleConfirmUse}
                      disabled={confirmUseMutation.isPending}
                      variant="outline"
                      className="w-full border-[#38BDF8]/30 text-[#7DD3FC] hover:bg-[#38BDF8]/10"
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      {confirmUseMutation.isPending ? "Saving..." : "Mark as used today"}
                    </Button>
                    <p className="text-sm leading-relaxed text-[#94A3B8]">
                      Use this when you actually used the service. It improves unused-subscription
                      signals across the dashboard and analytics.
                    </p>
                  </CardContent>
                </Card>

                <Card className="glass-hover">
                  <CardHeader>
                    <CardTitle>Financial view</CardTitle>
                    <CardDescription>What this subscription means for your budget.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div>
                      <p className="text-sm text-[#9CA3AF]">Monthly equivalent</p>
                      <p className="mt-2 text-2xl font-semibold text-[#4ADE80]">
                        {formatCurrency(monthlyEquivalent, currency)}
                      </p>
                    </div>
                    <div className="border-t border-white/10 pt-5">
                      <p className="text-sm text-[#9CA3AF]">Yearly equivalent</p>
                      <p className="mt-2 text-2xl font-semibold text-[#F9FAFB]">
                        {formatCurrency(yearlyEquivalent, currency)}
                      </p>
                    </div>
                    {subscription.createdAt ? (
                      <div className="border-t border-white/10 pt-5">
                        <p className="text-sm text-[#9CA3AF]">Created</p>
                        <p className="mt-2 text-sm font-medium text-[#D3DBE4]">
                          {formatDate(subscription.createdAt)}
                        </p>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
