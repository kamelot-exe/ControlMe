"use client";

import React, { useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useCreateSubscription } from "@/hooks/use-subscriptions";
import type { CreateSubscriptionDto, BillingPeriod } from "@/shared/types";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewSubscriptionPage() {
  const router = useRouter();
  const createMutation = useCreateSubscription();
  const [formData, setFormData] = useState<CreateSubscriptionDto>({
    name: "",
    price: 0,
    billingPeriod: "MONTHLY",
    nextChargeDate: new Date().toISOString().split("T")[0],
    category: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        <div className="p-8 md:p-10 lg:p-12">
          <div className="max-w-2xl space-y-8 animate-fade-in">

          {/* Back Button */}
          <Link
            href="/subscriptions"
            className="inline-flex items-center gap-2 text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors animate-slide-up"
          >
            <span>←</span>
            <span>Back to Subscriptions</span>
          </Link>

          {/* Header */}
          <div className="space-y-2 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <h1 className="text-5xl font-bold text-[#F9FAFB] tracking-tight">Add Subscription</h1>
            <p className="text-lg text-[#9CA3AF]">
              Create a new recurring expense
            </p>
          </div>

          <Card className="glass-hover animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <CardHeader>
              <CardTitle>Subscription Details</CardTitle>
              <CardDescription>
                Enter information about your subscription
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  label="Name"
                  placeholder="e.g., Netflix, Spotify"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="focus-ring"
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    label="Price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
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
                      value={formData.billingPeriod}
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
                  onChange={(e) => setFormData({ ...formData, nextChargeDate: e.target.value })}
                  required
                  className="focus-ring"
                />
                <Input
                  label="Category"
                  placeholder="e.g., Streaming, Software, Gym"
                  value={formData.category}
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
                    placeholder="Optional notes..."
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending} 
                    size="lg"
                    className="flex-1 bg-[#4ADE80]/20 hover:bg-[#4ADE80]/30 text-[#4ADE80] border border-[#4ADE80]/30"
                  >
                    {createMutation.isPending ? "Creating..." : "✨ Create Subscription"}
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
      </AppShell>
    </ProtectedRoute>
  );
}
