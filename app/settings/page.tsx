"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppShell } from "@/components/layout/AppShell";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { ConnectionError } from "@/components/errors/ConnectionError";
import { Tag } from "@/components/ui/Tag";
import {
  useMe,
  useLogout,
  useSetBudgetLimit,
  useDeleteAccount,
  useChangePassword,
  useChangeCurrency,
} from "@/hooks/use-auth";
import {
  useNotificationSettings,
  useUpdateNotificationSettings,
  useExportPDF,
} from "@/hooks/use-settings";
import { useApiError } from "@/hooks/use-api-error";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import type { Currency } from "@/shared/types";

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  RUB: "₽",
  JPY: "¥",
};

function getCurrencySymbol(currency: string): string {
  return CURRENCY_SYMBOLS[currency] ?? "$";
}

export default function SettingsPage() {
  const router = useRouter();

  const userQuery = useMe();
  const settingsQuery = useNotificationSettings();

  const updateSettings = useUpdateNotificationSettings();
  const exportPDF = useExportPDF();
  const logout = useLogout();
  const setBudgetLimit = useSetBudgetLimit();
  const deleteAccountMutation = useDeleteAccount();
  const changePassword = useChangePassword();
  const changeCurrency = useChangeCurrency();

  const userError = useApiError(userQuery);
  const settingsError = useApiError(settingsQuery);

  const user = userQuery.data?.data;
  const settings = settingsQuery.data?.data;
  const currency = (user?.currency ?? "USD") as Currency;

  // Notification form state
  const [smartAlerts, setSmartAlerts] = useState(true);
  const [prechargedays, setPrechargedays] = useState(7);
  const [notifFeedback, setNotifFeedback] = useState<string | null>(null);

  // Budget state
  const [budgetInput, setBudgetInput] = useState("");
  const [isSavingBudget, setIsSavingBudget] = useState(false);
  const [budgetFeedback, setBudgetFeedback] = useState<string | null>(null);

  // Change password state
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwFeedback, setPwFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  // Change currency state
  const [currencyInput, setCurrencyInput] = useState("");
  const [currencyFeedback, setCurrencyFeedback] = useState<string | null>(null);

  // Import state
  const [importFeedback, setImportFeedback] = useState<string | null>(null);

  // Export state
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);

  // Danger zone state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Sync notification settings from query
  useEffect(() => {
    if (!settings) return;
    setSmartAlerts(settings.smartAlertsEnabled);
    setPrechargedays(settings.prechargeReminderDays);
  }, [settings]);

  // Sync currency input from user data
  useEffect(() => {
    if (user?.currency) setCurrencyInput(user.currency);
  }, [user?.currency]);

  // Sync budget from user data
  useEffect(() => {
    if (!user) return;
    setBudgetInput(user.budgetLimit != null ? user.budgetLimit.toString() : "");
  }, [user]);

  const hasSettingsChanged =
    !!settings &&
    (prechargedays !== settings.prechargeReminderDays ||
      smartAlerts !== settings.smartAlertsEnabled);

  const prechargeError =
    prechargedays < 0 || prechargedays > 30
      ? "Reminder days must be between 0 and 30"
      : undefined;

  const handleSaveNotifications = async () => {
    if (!settings || prechargeError) return;
    setNotifFeedback(null);
    try {
      await updateSettings.mutateAsync({
        id: settings.id,
        userId: settings.userId,
        prechargeReminderDays: prechargedays,
        smartAlertsEnabled: smartAlerts,
      });
      setNotifFeedback("Notification settings saved.");
    } catch {
      setNotifFeedback("Unable to save settings. Please retry.");
    }
  };

  const handleSaveBudget = async (override?: number | null) => {
    setIsSavingBudget(true);
    setBudgetFeedback(null);
    try {
      const value =
        override !== undefined
          ? override
          : budgetInput.trim() === ""
          ? null
          : parseFloat(budgetInput);
      await setBudgetLimit.mutateAsync({ budgetLimit: value });
      setBudgetFeedback(
        value == null ? "Budget limit removed." : "Budget limit saved."
      );
    } catch {
      setBudgetFeedback("Unable to save budget limit. Please retry.");
    } finally {
      setIsSavingBudget(false);
    }
  };

  const handleImportCsv = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFeedback(null);
    try {
      const text = await file.text();
      const token = localStorage.getItem("auth_token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
      const res = await fetch(`${apiUrl}/subscriptions/import`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ csv: text }),
      });
      const data = await res.json();
      const result = data.data ?? data;
      setImportFeedback(
        `Imported ${result.imported} subscription${result.imported !== 1 ? "s" : ""}${result.errors?.length ? `. ${result.errors.length} error(s).` : "."}`
      );
      if (result.imported > 0) {
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch {
      setImportFeedback("Failed to import. Check the CSV format and try again.");
    } finally {
      e.target.value = "";
    }
  };

  const handleExportPDF = async () => {
    setExportFeedback(null);
    try {
      await exportPDF.mutateAsync();
      setExportFeedback("PDF export started. Check your downloads.");
    } catch {
      setExportFeedback("Unable to export PDF. Please retry.");
    }
  };

  const handleExportCsv = async () => {
    setExportFeedback(null);
    try {
      const token = localStorage.getItem("auth_token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
      const response = await fetch(`${apiUrl}/export/csv`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to export CSV");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "subscriptions.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setExportFeedback("CSV exported successfully.");
    } catch {
      setExportFeedback("Unable to export CSV. Please retry.");
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      await deleteAccountMutation.mutateAsync();
      localStorage.removeItem("auth_token");
      router.push("/login");
    } catch {
      setIsDeletingAccount(false);
      setShowDeleteConfirm(false);
    }
  };

  const isLoading = userQuery.isLoading || settingsQuery.isLoading;

  if (isLoading) {
    return (
      <ProtectedRoute>
        <AppShell>
          <div className="p-8 md:p-10 lg:p-12">
            <div className="max-w-4xl space-y-8 animate-fade-in">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            </div>
          </div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  const hasConnectionError =
    userError.isConnectionError || settingsError.isConnectionError;

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="p-8 md:p-10 lg:p-12">
          <div className="max-w-4xl space-y-8 animate-fade-in">

          {hasConnectionError && (
            <ConnectionError
              onRetry={() => {
                userQuery.refetch();
                settingsQuery.refetch();
              }}
            />
          )}

          {(userQuery.isError || settingsQuery.isError) && !hasConnectionError && (
            <ErrorState
              title="Unable to load settings"
              message={
                userError.errorMessage ||
                settingsError.errorMessage ||
                "Please try again."
              }
              onRetry={() => {
                userQuery.refetch();
                settingsQuery.refetch();
              }}
            />
          )}

          {/* Page Title */}
          <div className="space-y-3 animate-slide-up">
            <h1 className="text-5xl font-bold text-[#F9FAFB] tracking-tight">Settings</h1>
            <p className="text-lg text-[#9CA3AF]">Manage your account and preferences</p>
          </div>

          {/* Account Section */}
          <div
            className="glass-hover rounded-3xl p-6 animate-slide-up"
            style={{ animationDelay: "0.05s" }}
          >
            <h2 className="text-xl font-semibold text-[#F9FAFB] mb-1">Account Information</h2>
            <p className="text-[#9CA3AF] text-sm mb-5">Your account details</p>

            {!user ? (
              <EmptyState
                icon="User"
                title="Account data unavailable"
                description="Refresh the page to load account details."
              />
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between glass-light rounded-2xl p-4">
                  <div className="space-y-0.5">
                    <p className="text-xs text-[#9CA3AF]">Email</p>
                    <p className="text-[#F9FAFB] font-medium">{user.email || "Not available"}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between glass-light rounded-2xl p-4">
                  <div className="space-y-0.5">
                    <p className="text-xs text-[#9CA3AF]">Currency</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Tag variant="info" size="md">
                        {user.currency || "USD"}
                      </Tag>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between glass-light rounded-2xl p-4">
                  <div className="space-y-0.5">
                    <p className="text-xs text-[#9CA3AF]">Member Since</p>
                    <p className="text-[#F9FAFB] font-medium">
                      {user.createdAt ? formatDate(user.createdAt) : "Not available"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Change Password Section */}
          <div
            className="glass-hover rounded-3xl p-6 animate-slide-up"
            style={{ animationDelay: "0.08s" }}
          >
            <h2 className="text-xl font-semibold text-[#F9FAFB] mb-1">Change Password</h2>
            <p className="text-[#9CA3AF] text-sm mb-5">Update your account password</p>
            <div className="space-y-3">
              <input
                type="password"
                placeholder="Current password"
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[#F9FAFB] placeholder:text-[#6B7280] focus:outline-none focus:border-[#4ADE80]/50 transition-all duration-150 text-sm"
              />
              <input
                type="password"
                placeholder="New password (min. 8 characters)"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[#F9FAFB] placeholder:text-[#6B7280] focus:outline-none focus:border-[#4ADE80]/50 transition-all duration-150 text-sm"
              />
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[#F9FAFB] placeholder:text-[#6B7280] focus:outline-none focus:border-[#4ADE80]/50 transition-all duration-150 text-sm"
              />
              {pwFeedback && (
                <p className={`text-sm ${pwFeedback.ok ? "text-[#4ADE80]" : "text-[#F97373]"}`}>
                  {pwFeedback.msg}
                </p>
              )}
              <button
                type="button"
                disabled={changePassword.isPending}
                onClick={async () => {
                  setPwFeedback(null);
                  if (!currentPw || !newPw || !confirmPw) {
                    setPwFeedback({ ok: false, msg: "Please fill all fields" });
                    return;
                  }
                  if (newPw.length < 8) {
                    setPwFeedback({ ok: false, msg: "New password must be at least 8 characters" });
                    return;
                  }
                  if (newPw !== confirmPw) {
                    setPwFeedback({ ok: false, msg: "Passwords do not match" });
                    return;
                  }
                  try {
                    await changePassword.mutateAsync({ currentPassword: currentPw, newPassword: newPw });
                    setPwFeedback({ ok: true, msg: "Password updated successfully" });
                    setCurrentPw(""); setNewPw(""); setConfirmPw("");
                  } catch (err) {
                    setPwFeedback({ ok: false, msg: (err as Error).message });
                  }
                }}
                className="px-5 py-2.5 bg-[#4ADE80] text-[#060B16] font-semibold rounded-xl hover:bg-[#4ADE80]/90 transition-all duration-150 active:scale-[0.97] disabled:opacity-50 text-sm"
              >
                {changePassword.isPending ? "Saving…" : "Update password"}
              </button>
            </div>
          </div>

          {/* Change Currency Section */}
          <div
            className="glass-hover rounded-3xl p-6 animate-slide-up"
            style={{ animationDelay: "0.1s" }}
          >
            <h2 className="text-xl font-semibold text-[#F9FAFB] mb-1">Currency</h2>
            <p className="text-[#9CA3AF] text-sm mb-5">Change the currency used across the app</p>
            <div className="flex items-center gap-3">
              <select
                value={currencyInput}
                onChange={(e) => setCurrencyInput(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[#F9FAFB] focus:outline-none focus:border-[#4ADE80]/50 transition-all duration-150 text-sm cursor-pointer"
              >
                {["USD","EUR","GBP","RUB","JPY","CAD","AUD","CHF","CNY","INR"].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <button
                type="button"
                disabled={changeCurrency.isPending || currencyInput === currency}
                onClick={async () => {
                  setCurrencyFeedback(null);
                  try {
                    await changeCurrency.mutateAsync({ currency: currencyInput });
                    setCurrencyFeedback("Currency updated.");
                  } catch (err) {
                    setCurrencyFeedback((err as Error).message);
                  }
                }}
                className="px-5 py-2.5 bg-[#4ADE80] text-[#060B16] font-semibold rounded-xl hover:bg-[#4ADE80]/90 transition-all duration-150 active:scale-[0.97] disabled:opacity-50 text-sm"
              >
                {changeCurrency.isPending ? "Saving…" : "Save"}
              </button>
            </div>
            {currencyFeedback && (
              <p className="text-sm text-[#F9FAFB]/80 mt-2">{currencyFeedback}</p>
            )}
          </div>

          {/* Budget Limit Section */}
          <div
            className="glass-hover rounded-3xl p-6 animate-slide-up"
            style={{ animationDelay: "0.12s" }}
          >
            <h2 className="text-xl font-semibold text-[#F9FAFB] mb-1">Monthly Budget</h2>
            <p className="text-[#9CA3AF] text-sm mb-5">
              Set a monthly spending limit to track your budget
            </p>

            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] text-sm pointer-events-none">
                  {getCurrencySymbol(currency)}
                </span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={budgetInput}
                  onChange={(e) => setBudgetInput(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[#F9FAFB] placeholder:text-[#6B7280] focus:outline-none focus:border-[#4ADE80]/50 transition-all duration-[120ms]"
                  min="0"
                  step="0.01"
                />
              </div>
              <button
                type="button"
                onClick={() => handleSaveBudget()}
                disabled={isSavingBudget}
                className="px-5 py-2.5 bg-[#4ADE80] text-[#060B16] font-semibold rounded-xl hover:bg-[#4ADE80]/90 transition-all duration-[120ms] active:scale-[0.97] disabled:opacity-50"
              >
                {isSavingBudget ? "Saving..." : "Save"}
              </button>
              {user?.budgetLimit != null && (
                <button
                  type="button"
                  onClick={() => handleSaveBudget(null)}
                  disabled={isSavingBudget}
                  className="px-4 py-2.5 text-[#9CA3AF] hover:text-[#F87171] transition-colors text-sm disabled:opacity-50"
                >
                  Remove
                </button>
              )}
            </div>

            {user?.budgetLimit != null && (
              <p className="text-[#9CA3AF] text-sm mt-3">
                Current limit:{" "}
                <span className="text-[#4ADE80] font-medium">
                  {formatCurrency(user.budgetLimit, currency)}/mo
                </span>
              </p>
            )}

            {budgetFeedback && (
              <p className="text-sm text-[#F9FAFB]/80 mt-3">{budgetFeedback}</p>
            )}
          </div>

          {/* Notifications Section */}
          <div
            className="glass-hover rounded-3xl p-6 animate-slide-up"
            style={{ animationDelay: "0.15s" }}
          >
            <h2 className="text-xl font-semibold text-[#F9FAFB] mb-1">Notifications</h2>
            <p className="text-[#9CA3AF] text-sm mb-5">
              Configure how you receive reminders
            </p>

            {!settings ? (
              <EmptyState
                icon="Bell"
                title="Notification settings unavailable"
                description="Refresh the page to load notification settings."
              />
            ) : (
              <div className="space-y-5">
                {/* Smart Alerts toggle */}
                <div className="flex items-center justify-between glass-light rounded-2xl p-4">
                  <div>
                    <p className="text-[#F9FAFB] font-medium">Smart Alerts</p>
                    <p className="text-[#9CA3AF] text-sm">
                      Unused, price increase, and duplicate detection
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSmartAlerts(!smartAlerts)}
                    className={`relative w-11 h-6 rounded-full transition-all duration-[120ms] flex-shrink-0 ${
                      smartAlerts ? "bg-[#4ADE80]" : "bg-white/10"
                    }`}
                    aria-label="Toggle smart alerts"
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-[120ms] shadow-sm ${
                        smartAlerts ? "left-6" : "left-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Pre-charge reminder days */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#F9FAFB]/80">
                    Pre-charge Reminder Days
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={prechargedays}
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10);
                      setPrechargedays(Number.isNaN(v) ? 0 : v);
                    }}
                    className={`w-full rounded-2xl bg-white/5 border px-4 py-3 text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:outline-none transition-all duration-[120ms] hover:bg-white/10 focus:bg-white/10 ${
                      prechargeError
                        ? "border-[#F87171]/50 focus:border-[#F87171]/70"
                        : "border-white/10 focus:border-[#4ADE80]/50"
                    }`}
                  />
                  {prechargeError ? (
                    <p className="text-sm text-[#F87171]">{prechargeError}</p>
                  ) : (
                    <p className="text-xs text-[#9CA3AF]">
                      Number of days before a charge to send a reminder.
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleSaveNotifications}
                  disabled={
                    updateSettings.isPending || !hasSettingsChanged || !!prechargeError
                  }
                  className="w-full py-3 bg-[#4ADE80]/20 border border-[#4ADE80]/30 text-[#4ADE80] font-semibold rounded-2xl hover:bg-[#4ADE80]/30 transition-all duration-[120ms] active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none"
                >
                  {updateSettings.isPending ? "Saving..." : "Save Notification Settings"}
                </button>

                {notifFeedback && (
                  <p className="text-sm text-[#F9FAFB]/80">{notifFeedback}</p>
                )}
              </div>
            )}
          </div>

          {/* Email Notifications Section */}
          <div
            className="glass-hover rounded-3xl p-6 animate-slide-up"
            style={{ animationDelay: "0.2s" }}
          >
            <h2 className="text-xl font-semibold text-[#F9FAFB] mb-1">Email Notifications</h2>
            <p className="text-[#9CA3AF] text-sm mb-5">
              Daily charge reminders sent to your account email
            </p>

            <div className="space-y-4">
              {/* SMTP status info */}
              <div className="glass-light rounded-2xl p-4 space-y-2">
                <p className="text-sm font-medium text-[#F9FAFB]">How it works</p>
                <p className="text-xs text-[#9CA3AF] leading-relaxed">
                  Every morning at 08:00 UTC, ControlMe checks for subscriptions charging within
                  your reminder window and sends a digest to{" "}
                  <span className="text-[#38BDF8]">{user?.email ?? "your email"}</span>.
                </p>
                <p className="text-xs text-[#6B7280] leading-relaxed">
                  Configure SMTP via <code className="text-[#4ADE80]">SMTP_HOST</code>,{" "}
                  <code className="text-[#4ADE80]">SMTP_USER</code>,{" "}
                  <code className="text-[#4ADE80]">SMTP_PASS</code> env vars. Without SMTP,
                  reminders are logged to console (dev mode).
                </p>
              </div>

              {/* Trigger test button */}
              <button
                type="button"
                onClick={async () => {
                  try {
                    const token = localStorage.getItem("auth_token");
                    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
                    const res = await fetch(`${apiUrl}/notifications/trigger-reminders`, {
                      method: "POST",
                      headers: { Authorization: `Bearer ${token}` },
                    });
                    if (res.ok) {
                      alert("Reminder job triggered. Check your inbox or server console.");
                    } else {
                      alert("Failed to trigger reminders.");
                    }
                  } catch {
                    alert("Connection error. Is the backend running?");
                  }
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#4ADE80]/10 border border-[#4ADE80]/30 text-[#4ADE80] rounded-xl hover:bg-[#4ADE80]/20 transition-all duration-[120ms] active:scale-[0.97] text-sm font-medium"
              >
                Send test reminder now
              </button>
            </div>
          </div>

          {/* Import Section */}
          <div className="glass-hover rounded-3xl p-6 animate-slide-up" style={{ animationDelay: "0.25s" }}>
            <h2 className="text-xl font-semibold text-[#F9FAFB] mb-1">Import Data</h2>
            <p className="text-[#9CA3AF] text-sm mb-5">
              Upload a CSV file to bulk-add subscriptions
            </p>
            <div className="glass-light rounded-2xl p-4 mb-4">
              <p className="text-xs text-[#9CA3AF] font-mono">
                name, price, billingPeriod, category, startDate
              </p>
              <p className="text-xs text-[#6B7280] mt-1">
                billingPeriod: MONTHLY or YEARLY · category: Streaming, Software, etc.
              </p>
            </div>
            <label className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[#F9FAFB] hover:bg-white/10 transition-all duration-[120ms] cursor-pointer w-fit text-sm">
              <span>Upload CSV</span>
              <input type="file" accept=".csv,text/csv" className="hidden" onChange={handleImportCsv} />
            </label>
            {importFeedback && (
              <p className="text-sm text-[#F9FAFB]/80 mt-3">{importFeedback}</p>
            )}
          </div>

          {/* Export Section */}
          <div
            className="glass-hover rounded-3xl p-6 animate-slide-up"
            style={{ animationDelay: "0.3s" }}
          >
            <h2 className="text-xl font-semibold text-[#F9FAFB] mb-1">Export Data</h2>
            <p className="text-[#9CA3AF] text-sm mb-5">
              Download your subscription data for tax or budgeting purposes
            </p>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleExportPDF}
                disabled={exportPDF.isPending}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#38BDF8]/10 border border-[#38BDF8]/30 text-[#38BDF8] rounded-xl hover:bg-[#38BDF8]/20 transition-all duration-[120ms] active:scale-[0.97] disabled:opacity-50 font-medium text-sm"
              >
                {exportPDF.isPending ? "Exporting..." : "Export PDF Report"}
              </button>
              <button
                type="button"
                onClick={handleExportCsv}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[#F9FAFB] hover:bg-white/10 transition-all duration-[120ms] active:scale-[0.97] text-sm"
              >
                Export CSV
              </button>
            </div>

            {exportFeedback && (
              <p className="text-sm text-[#F9FAFB]/80 mt-3">{exportFeedback}</p>
            )}

            <div className="mt-4 p-4 glass-light rounded-2xl">
              <p className="text-xs text-[#9CA3AF] leading-relaxed">
                PDF includes subscription details, costs, and category breakdowns. CSV
                exports all subscriptions as a spreadsheet-compatible file.
              </p>
            </div>
          </div>

          {/* Sign Out */}
          <div
            className="glass-hover rounded-3xl p-6 animate-slide-up"
            style={{ animationDelay: "0.35s" }}
          >
            <h2 className="text-xl font-semibold text-[#F9FAFB] mb-1">Session</h2>
            <p className="text-[#9CA3AF] text-sm mb-5">Manage your active session</p>
            <button
              type="button"
              onClick={() => logout.mutate()}
              disabled={logout.isPending}
              className="w-full py-3 bg-white/5 border border-white/10 text-[#F9FAFB] font-semibold rounded-2xl hover:bg-white/10 transition-all duration-[120ms] active:scale-[0.97] disabled:opacity-50"
            >
              {logout.isPending ? "Signing out..." : "Sign Out"}
            </button>
          </div>

          {/* Danger Zone */}
          <div
            className="rounded-3xl p-6 border border-[#F87171]/30 animate-slide-up"
            style={{
              background: "rgba(248, 113, 113, 0.04)",
              animationDelay: "0.4s",
            }}
          >
            <h2 className="text-xl font-semibold text-[#F87171] mb-1">Danger Zone</h2>
            <p className="text-[#9CA3AF] text-sm mb-5">Irreversible actions. Be careful.</p>

            <div className="flex items-center justify-between glass-light rounded-2xl p-4">
              <div>
                <p className="text-[#F9FAFB] font-medium">Delete Account</p>
                <p className="text-[#9CA3AF] text-sm">
                  Permanently delete your account and all data
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 bg-[#F87171]/10 border border-[#F87171]/30 text-[#F87171] rounded-xl hover:bg-[#F87171]/20 transition-all duration-[120ms] active:scale-[0.97] font-medium text-sm"
              >
                Delete Account
              </button>
            </div>

            {showDeleteConfirm && (
              <div className="mt-4 glass-light rounded-2xl p-4 border border-[#F87171]/30">
                <p className="text-[#F9FAFB] font-medium mb-1">Are you absolutely sure?</p>
                <p className="text-[#9CA3AF] text-sm mb-4">
                  This will permanently delete your account and all subscriptions. This cannot
                  be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleDeleteAccount}
                    disabled={isDeletingAccount}
                    className="px-4 py-2 bg-[#F87171] text-white rounded-xl hover:bg-[#F87171]/90 transition-all duration-[120ms] font-medium text-sm disabled:opacity-50"
                  >
                    {isDeletingAccount ? "Deleting..." : "Yes, delete everything"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 bg-white/5 border border-white/10 text-[#9CA3AF] rounded-xl hover:text-[#F9FAFB] transition-all duration-[120ms] text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
