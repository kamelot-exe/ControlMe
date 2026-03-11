"use client";

import { useState, useEffect } from "react";
import { X, Save, Trash2 } from "lucide-react";
import type { Subscription } from "@/shared/types";
import { useUpdateSubscription, useDeleteSubscription } from "@/hooks/use-subscriptions";

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

interface SubscriptionDrawerProps {
  subscription: Subscription | null;
  onClose: () => void;
}

export function SubscriptionDrawer({ subscription, onClose }: SubscriptionDrawerProps) {
  const updateSub = useUpdateSubscription();
  const deleteSub = useDeleteSubscription();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [form, setForm] = useState({
    name: "",
    price: 0,
    category: "Other",
    billingPeriod: "MONTHLY" as "MONTHLY" | "YEARLY",
    nextChargeDate: "",
    isActive: true,
    websiteUrl: "",
    notes: "",
  });

  useEffect(() => {
    if (subscription) {
      setForm({
        name: subscription.name ?? "",
        price: subscription.price ?? 0,
        category: subscription.category ?? "Other",
        billingPeriod: (subscription.billingPeriod as "MONTHLY" | "YEARLY") ?? "MONTHLY",
        nextChargeDate: subscription.nextChargeDate
          ? new Date(subscription.nextChargeDate).toISOString().slice(0, 10)
          : "",
        isActive: subscription.isActive ?? true,
        websiteUrl: (subscription as any).websiteUrl ?? "",
        notes: (subscription as any).notes ?? "",
      });
      setConfirmDelete(false);
    }
  }, [subscription]);

  const isOpen = !!subscription;

  const handleSave = async () => {
    if (!subscription) return;
    try {
      await updateSub.mutateAsync({
        id: subscription.id,
        data: {
          name: form.name,
          price: Number(form.price),
          category: form.category,
          billingPeriod: form.billingPeriod,
          nextChargeDate: form.nextChargeDate ? new Date(form.nextChargeDate).toISOString() : undefined,
          isActive: form.isActive,
          ...(form.websiteUrl ? { websiteUrl: form.websiteUrl } : {}),
          ...(form.notes ? { notes: form.notes } : {}),
        },
      });
      onClose();
    } catch {
      // error handled by mutation
    }
  };

  const handleDelete = async () => {
    if (!subscription) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    await deleteSub.mutateAsync(subscription.id);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-200 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md z-50 flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{
          background: "rgba(8,14,26,0.98)",
          borderLeft: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <h2 className="text-lg font-bold text-[#F9FAFB] tracking-tight">Quick Edit</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-white/8 transition-all duration-150"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-2">
              Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[#F9FAFB] placeholder:text-[#6B7280] focus:outline-none focus:border-[#4ADE80]/50 transition-all duration-150 text-sm"
              placeholder="Netflix, Spotify…"
            />
          </div>

          {/* Price + Billing */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-2">
                Price
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: parseFloat(e.target.value) || 0 }))}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[#F9FAFB] focus:outline-none focus:border-[#4ADE80]/50 transition-all duration-150 text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-2">
                Billing
              </label>
              <select
                value={form.billingPeriod}
                onChange={(e) =>
                  setForm((f) => ({ ...f, billingPeriod: e.target.value as "MONTHLY" | "YEARLY" }))
                }
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[#F9FAFB] focus:outline-none focus:border-[#4ADE80]/50 transition-all duration-150 text-sm cursor-pointer"
              >
                <option value="MONTHLY">Monthly</option>
                <option value="YEARLY">Yearly</option>
              </select>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-2">
              Category
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[#F9FAFB] focus:outline-none focus:border-[#4ADE80]/50 transition-all duration-150 text-sm cursor-pointer"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Next Charge Date */}
          <div>
            <label className="block text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-2">
              Next Charge Date
            </label>
            <input
              type="date"
              value={form.nextChargeDate}
              onChange={(e) => setForm((f) => ({ ...f, nextChargeDate: e.target.value }))}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[#F9FAFB] focus:outline-none focus:border-[#4ADE80]/50 transition-all duration-150 text-sm"
              style={{ colorScheme: "dark" }}
            />
          </div>

          {/* Website URL */}
          <div>
            <label className="block text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-2">
              Website URL
            </label>
            <input
              type="url"
              value={form.websiteUrl}
              onChange={(e) => setForm((f) => ({ ...f, websiteUrl: e.target.value }))}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[#F9FAFB] placeholder:text-[#6B7280] focus:outline-none focus:border-[#4ADE80]/50 transition-all duration-150 text-sm"
              placeholder="https://example.com"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-2">
              Notes
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={3}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[#F9FAFB] placeholder:text-[#6B7280] focus:outline-none focus:border-[#4ADE80]/50 transition-all duration-150 text-sm resize-none"
              placeholder="Optional notes…"
            />
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between p-4 bg-white/4 rounded-xl border border-white/8">
            <div>
              <p className="text-sm font-semibold text-[#F9FAFB]">Active</p>
              <p className="text-xs text-[#9CA3AF] mt-0.5">Toggle subscription status</p>
            </div>
            <button
              onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                form.isActive ? "bg-[#4ADE80]" : "bg-white/15"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                  form.isActive ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-5 border-t border-white/10 space-y-3">
          {/* Save */}
          <button
            onClick={handleSave}
            disabled={updateSub.isPending}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#4ADE80] text-[#060B16] font-bold rounded-xl hover:bg-[#4ADE80]/90 transition-all duration-150 active:scale-[0.97] disabled:opacity-50 text-sm"
          >
            <Save size={15} />
            {updateSub.isPending ? "Saving…" : "Save changes"}
          </button>

          {/* Delete */}
          <button
            onClick={handleDelete}
            disabled={deleteSub.isPending}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all duration-150 active:scale-[0.97] disabled:opacity-50 text-sm border ${
              confirmDelete
                ? "bg-[#F97373]/15 border-[#F97373]/40 text-[#F97373]"
                : "border-white/10 text-[#9CA3AF] hover:text-[#F97373] hover:border-[#F97373]/30 hover:bg-[#F97373]/8"
            }`}
          >
            <Trash2 size={15} />
            {deleteSub.isPending
              ? "Deleting…"
              : confirmDelete
              ? "Tap again to confirm delete"
              : "Delete subscription"}
          </button>
        </div>
      </div>
    </>
  );
}
