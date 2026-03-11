"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppShell } from "@/components/layout/AppShell";
import { NeedScoreSlider } from "@/components/subscriptions/NeedScoreSlider";
import { SubscriptionNamePicker } from "@/components/subscriptions/SubscriptionNamePicker";
import {
  DEFAULT_SUBSCRIPTION_CATEGORY,
  SERVICE_GROUP_OPTIONS,
} from "@/components/subscriptions/subscription-catalog";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useCreateSubscription } from "@/hooks/use-subscriptions";
import { formatBillingPeriod } from "@/lib/utils/format";
import type { BillingPeriod, CreateSubscriptionDto } from "@/shared/types";

export default function NewSubscriptionPage() {
  const router = useRouter();
  const createMutation = useCreateSubscription();
  const [formData, setFormData] = useState<CreateSubscriptionDto>({
    name: "",
    price: 0,
    billingPeriod: "MONTHLY",
    nextChargeDate: new Date().toISOString().split("T")[0],
    category: DEFAULT_SUBSCRIPTION_CATEGORY,
    serviceGroup: "",
    needScore: 70,
    notes: "",
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const result = await createMutation.mutateAsync(formData);
      if (result.data) {
        router.push(`/subscriptions/${result.data.id}`);
      }
    } catch (error) {
      console.error("Failed to create subscription:", error);
    }
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="min-h-[calc(100vh-2rem)] px-8 py-8 md:px-10 md:py-10 lg:px-12 lg:py-12">
          <div className="w-full max-w-5xl animate-fade-in">
            <div className="w-full max-w-4xl space-y-8">
              <Link
                href="/subscriptions"
                className="inline-flex items-center gap-2 text-[#9CA3AF] transition-colors hover:text-[#F9FAFB] animate-slide-up"
              >
                <span aria-hidden="true">←</span>
                <span>Back to subscriptions</span>
              </Link>

              <div className="space-y-2 animate-slide-up" style={{ animationDelay: "0.1s" }}>
                <h1 className="text-5xl font-bold tracking-tight text-[#F9FAFB]">
                  Add Subscription
                </h1>
                <p className="text-lg text-[#9CA3AF]">
                  Capture the renewal, score its value, and keep your future costs visible.
                </p>
              </div>

              <Card className="glass-hover animate-slide-up" style={{ animationDelay: "0.2s" }}>
                <CardHeader>
                  <CardTitle>Subscription details</CardTitle>
                  <CardDescription>
                    Choose the service, set the billing cycle, and score how necessary it is.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <SubscriptionNamePicker
                      value={formData.name}
                      onChange={(name) => setFormData({ ...formData, name })}
                      placeholder="Netflix, Notion, Spotify, or your own custom name"
                      required
                    />

                    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
                      <div className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                          <Input
                            label="Price"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={formData.price || ""}
                            onChange={(event) =>
                              setFormData({
                                ...formData,
                                price: Number.parseFloat(event.target.value) || 0,
                              })
                            }
                            required
                            className="focus-ring"
                          />

                          <div className="space-y-2">
                            <label className="text-sm font-medium text-[#F9FAFB]/80">
                              Billing period
                            </label>
                            <select
                              value={formData.billingPeriod}
                              onChange={(event) =>
                                setFormData({
                                  ...formData,
                                  billingPeriod: event.target.value as BillingPeriod,
                                })
                              }
                              className="app-select w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[#F9FAFB] transition-all duration-150 hover:bg-white/10 focus-ring"
                            >
                              {(["DAILY", "MONTHLY", "YEARLY"] as const).map((period) => (
                                <option key={period} value={period}>
                                  {formatBillingPeriod(period)}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <Input
                          label="Next charge date"
                          type="date"
                          value={
                            typeof formData.nextChargeDate === "string"
                              ? formData.nextChargeDate
                              : ""
                          }
                          onChange={(event) =>
                            setFormData({ ...formData, nextChargeDate: event.target.value })
                          }
                          required
                          className="focus-ring"
                        />

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-[#F9FAFB]/80">
                            Service group
                          </label>
                          <select
                            value={formData.serviceGroup ?? ""}
                            onChange={(event) =>
                              setFormData({ ...formData, serviceGroup: event.target.value })
                            }
                            className="app-select w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[#F9FAFB] transition-all duration-150 hover:bg-white/10 focus-ring"
                          >
                            <option value="">No group yet</option>
                            {SERVICE_GROUP_OPTIONS.map((group) => (
                              <option key={group} value={group}>
                                {group}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-[#F9FAFB]/80">Notes</label>
                          <textarea
                            value={formData.notes || ""}
                            onChange={(event) =>
                              setFormData({ ...formData, notes: event.target.value })
                            }
                            className="min-h-[120px] w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[#F9FAFB] placeholder:text-[#9CA3AF] transition-all duration-150 hover:bg-white/10 focus-ring"
                            placeholder="Optional notes..."
                          />
                        </div>
                      </div>

                      <NeedScoreSlider
                        value={formData.needScore ?? 70}
                        onChange={(needScore) => setFormData({ ...formData, needScore })}
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        type="submit"
                        disabled={createMutation.isPending}
                        size="lg"
                        className="flex-1 border border-[#4ADE80]/30 bg-[#4ADE80]/20 text-[#4ADE80] hover:bg-[#4ADE80]/30"
                      >
                        {createMutation.isPending ? "Creating..." : "Create subscription"}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => router.back()}
                        size="lg"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
