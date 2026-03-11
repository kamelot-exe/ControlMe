"use client";

import React, { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Tag } from "@/components/ui/Tag";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { useSubscription, useUpdateSubscription, useDeleteSubscription, useConfirmSubscriptionUse } from "@/hooks/use-subscriptions";
import { formatCurrency, formatDate, getDaysUntil } from "@/lib/utils/format";
import type { UpdateSubscriptionDto, BillingPeriod } from "@/shared/types";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";

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

export default function SubscriptionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { data, isLoading, error } = useSubscription(params.id);
  const updateMutation = useUpdateSubscription();
  const deleteMutation = useDeleteSubscription();
  const confirmUseMutation = useConfirmSubscriptionUse();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UpdateSubscriptionDto>({});
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const subscription = data?.data;

  useEffect(() => {
    if (subscription) {
      setFormData({
        name: subscription.name,
        price: subscription.price,
        billingPeriod: subscription.billingPeriod,
        nextChargeDate: typeof subscription.nextChargeDate === "string"
          ? subscription.nextChargeDate.split("T")[0]
          : new Date(subscription.nextChargeDate).toISOString().split("T")[0],
        category: subscription.category,
        notes: subscription.notes || "",
        isActive: subscription.isActive,
      });
    }
  }, [subscription]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscription) return;
    setSaveMessage(null);
    setSaveError(null);

    try {
      await updateMutation.mutateAsync({
        id: subscription.id,
        data: formData,
      });
      setSaveMessage("Subscription updated successfully.");
      setIsEditing(false);
    } catch (error: unknown) {
      setSaveError(error instanceof Error ? error.message : "Failed to update subscription.");
    }
  };

  const handleDelete = async () => {
    if (!subscription) return;
    if (!confirm("Are you sure you want to delete this subscription?")) return;

    try {
      await deleteMutation.mutateAsync(subscription.id);
      router.push("/subscriptions");
    } catch (error) {
      console.error("Failed to delete subscription:", error);
    }
  };

  const handleConfirmUse = async () => {
    if (!subscription) return;
    try {
      await confirmUseMutation.mutateAsync(subscription.id);
    } catch (error) {
      console.error("Failed to confirm use:", error);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <AppShell>
          <div className="p-8 md:p-10 lg:p-12">
            <div className="max-w-5xl">
            <SkeletonCard />
            </div>
          </div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  if (error || !subscription) {
    return (
      <ProtectedRoute>
        <AppShell>
          <div className="p-8 md:p-10 lg:p-12">
            <div className="max-w-5xl">
            <ErrorState
              title="Subscription not found"
              message="The subscription you're looking for doesn't exist or has been deleted."
              onRetry={() => router.push("/subscriptions")}
            />
            </div>
          </div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  const icon = categoryIcons[subscription.category] || categoryIcons.Other;
  const daysUntil = getDaysUntil(subscription.nextChargeDate);
  const isUpcoming = daysUntil <= 7 && daysUntil >= 0;
  const isOverdue = daysUntil < 0;

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="p-8 md:p-10 lg:p-12">
          <div className="max-w-5xl space-y-8 animate-fade-in">

          {/* Back Button */}
          <Link
            href="/subscriptions"
            className="inline-flex items-center gap-2 text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors animate-slide-up"
          >
            <span>←</span>
            <span>Back to Subscriptions</span>
          </Link>

          {/* Header */}
          <div className="flex items-start justify-between gap-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-start gap-4 flex-1">
              <div className="text-6xl animate-scale-in">{icon}</div>
              <div className="space-y-3 flex-1">
                <div>
                  <h1 className="text-4xl font-bold text-[#F9FAFB] tracking-tight mb-2">
                    {subscription.name}
                  </h1>
                  <div className="flex items-center gap-3 flex-wrap">
                    <Tag variant="info" size="md">{subscription.category}</Tag>
                    <Tag variant={subscription.isActive ? "success" : "error"} size="md">
                      {subscription.isActive ? "Active" : "Inactive"}
                    </Tag>
                    {isOverdue && (
                      <Tag variant="error" size="md">Overdue</Tag>
                    )}
                    {isUpcoming && !isOverdue && (
                      <Tag variant="warning" size="md">
                        {daysUntil === 0 ? "Due Today" : `${daysUntil} days left`}
                      </Tag>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {!isEditing ? (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSaveMessage(null);
                      setSaveError(null);
                      setIsEditing(true);
                    }}
                    className="border-[#38BDF8]/30 text-[#38BDF8] hover:bg-[#38BDF8]/10"
                  >
                    ✏️ Edit
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={handleDelete} 
                    disabled={deleteMutation.isPending}
                    className="text-[#F97373] hover:text-[#F97373]/80 hover:bg-[#F97373]/10"
                  >
                    🗑️ Delete
                  </Button>
                </>
              ) : (
                <Button variant="ghost" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              )}
            </div>
          </div>

          {/* Two-column layout */}
          <div className="grid gap-8 lg:grid-cols-2 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            {/* Main Info */}
            <div className="space-y-6">
              <Card className="glass-hover">
                <CardHeader>
                  <CardTitle>{isEditing ? "Edit Subscription" : "General Information"}</CardTitle>
                  <CardDescription>
                    {isEditing ? "Update subscription information" : "Subscription details"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {saveMessage && (
                    <div className="rounded-2xl border border-[#4ADE80]/30 bg-[#4ADE80]/10 px-4 py-3 text-sm text-[#4ADE80]">
                      {saveMessage}
                    </div>
                  )}
                  {saveError && (
                    <div className="rounded-2xl border border-[#F97373]/30 bg-[#F97373]/10 px-4 py-3 text-sm text-[#F97373]">
                      {saveError}
                    </div>
                  )}
                  {isEditing ? (
                    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
                      <Input
                        label="Name"
                        value={formData.name || ""}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="focus-ring"
                      />
                      <div className="grid gap-4 md:grid-cols-2">
                        <Input
                          label="Price"
                          type="number"
                          step="0.01"
                          value={formData.price || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, price: parseFloat(e.target.value) })
                          }
                          required
                          className="focus-ring"
                        />
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-[#F9FAFB]/80">
                            Billing Period
                          </label>
                          <select
                            value={formData.billingPeriod || "MONTHLY"}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                billingPeriod: e.target.value as BillingPeriod,
                              })
                            }
                            className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-[#F9FAFB] focus-ring transition-all duration-150 hover:bg-white/10"
                          >
                            <option value="MONTHLY">Monthly</option>
                            <option value="YEARLY">Yearly</option>
                          </select>
                        </div>
                      </div>
                      <Input
                        label="Next Charge Date"
                        type="date"
                        value={typeof formData.nextChargeDate === "string" ? formData.nextChargeDate : ""}
                        onChange={(e) =>
                          setFormData({ ...formData, nextChargeDate: e.target.value })
                        }
                        required
                        className="focus-ring"
                      />
                      <Input
                        label="Category"
                        value={formData.category || ""}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        required
                        className="focus-ring"
                      />
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[#F9FAFB]/80">Notes</label>
                        <textarea
                          value={formData.notes || ""}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-[#F9FAFB] placeholder:text-[#9CA3AF] focus-ring min-h-[120px] transition-all duration-150 hover:bg-white/10"
                          placeholder="Add notes..."
                        />
                      </div>
                      <div className="flex items-center gap-3 p-4 glass-light rounded-2xl">
                        <input
                          type="checkbox"
                          id="isActive"
                          checked={formData.isActive ?? true}
                          onChange={(e) =>
                            setFormData({ ...formData, isActive: e.target.checked })
                          }
                          className="w-5 h-5 rounded border-white/20 bg-white/5 accent-[#4ADE80]/50 cursor-pointer"
                        />
                        <label htmlFor="isActive" className="text-sm text-[#F9FAFB]/80 cursor-pointer">
                          Active subscription
                        </label>
                      </div>
                      <div className="flex gap-3 pt-2">
                        <Button 
                          type="submit" 
                          disabled={updateMutation.isPending} 
                          size="lg" 
                          className="flex-1 bg-[#4ADE80]/20 hover:bg-[#4ADE80]/30 text-[#4ADE80] border border-[#4ADE80]/30"
                        >
                          {updateMutation.isPending ? "Saving..." : "💾 Save Changes"}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setIsEditing(false)}
                          size="lg"
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-6 animate-fade-in">
                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                          <p className="text-sm text-[#9CA3AF]">Price</p>
                          <p className="text-3xl font-bold text-[#F9FAFB]">
                            {formatCurrency(subscription.price, "USD")}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-[#9CA3AF]">Billing Period</p>
                          <Tag size="md">{subscription.billingPeriod}</Tag>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-white/10 space-y-2">
                        <p className="text-sm text-[#9CA3AF]">Next Charge Date</p>
                        <p className={cn(
                          "text-lg font-semibold",
                          isOverdue && "text-[#F97373]",
                          isUpcoming && !isOverdue && "text-[#F59E0B]",
                          !isUpcoming && !isOverdue && "text-[#F9FAFB]"
                        )}>
                          {formatDate(subscription.nextChargeDate)}
                          {daysUntil >= 0 && ` (${daysUntil} days)`}
                        </p>
                      </div>
                      {subscription.notes && (
                        <div className="pt-4 border-t border-white/10">
                          <p className="text-sm text-[#9CA3AF] mb-2">Notes</p>
                          <p className="text-[#F9FAFB]/80 leading-relaxed">{subscription.notes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Actions */}
              <Card className="glass-hover">
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                  <CardDescription>Manage your subscription</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={handleConfirmUse}
                    disabled={confirmUseMutation.isPending}
                    variant="outline"
                    size="lg"
                    className="w-full border-[#38BDF8]/30 text-[#38BDF8] hover:bg-[#38BDF8]/10"
                  >
                    {confirmUseMutation.isPending ? "Confirming..." : "✅ Mark as used today"}
                  </Button>
                  <p className="text-xs text-[#9CA3AF] text-center">
                    Track your subscription usage
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Summary */}
            <div className="space-y-6">
              <Card className="glass-hover sticky top-8">
                <CardHeader>
                  <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <p className="text-sm text-[#9CA3AF]">Monthly Cost</p>
                    <p className="text-2xl font-bold text-[#F9FAFB]">
                      {subscription.billingPeriod === "MONTHLY"
                        ? formatCurrency(subscription.price, "USD")
                        : formatCurrency(subscription.price / 12, "USD")}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-white/10 space-y-2">
                    <p className="text-sm text-[#9CA3AF]">Yearly Cost</p>
                    <p className="text-2xl font-bold text-[#F9FAFB]">
                      {subscription.billingPeriod === "YEARLY"
                        ? formatCurrency(subscription.price, "USD")
                        : formatCurrency(subscription.price * 12, "USD")}
                    </p>
                  </div>
                  {subscription.createdAt && (
                    <div className="pt-4 border-t border-white/10 space-y-2">
                      <p className="text-sm text-[#9CA3AF]">Created</p>
                      <p className="text-sm text-[#F9FAFB]/80">
                        {formatDate(subscription.createdAt)}
                      </p>
                    </div>
                  )}
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
