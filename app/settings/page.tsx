"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  CreditCard,
  Download,
  KeyRound,
  LogOut,
  Mail,
  RefreshCw,
  Shield,
  Trash2,
  Upload,
  Wallet,
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ConnectionError } from "@/components/errors/ConnectionError";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState, ErrorState, StatusBanner, Tag } from "@/components/ui";
import { SkeletonCard } from "@/components/ui/Skeleton";
import {
  useChangeCurrency,
  useChangePassword,
  useDeleteAccount,
  useLogout,
  useMe,
  useSetBudgetLimit,
} from "@/hooks/use-auth";
import {
  useExportPDF,
  useNotificationSettings,
  useUpdateNotificationSettings,
} from "@/hooks/use-settings";
import { useApiError } from "@/hooks/use-api-error";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import type { Currency } from "@/shared/types";

const CURRENCIES: Currency[] = [
  "USD",
  "EUR",
  "GBP",
  "RUB",
  "JPY",
  "CAD",
  "AUD",
  "CHF",
  "CNY",
  "INR",
];

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const currencyNames: Record<Currency, string> = {
  USD: "US Dollar",
  EUR: "Euro",
  GBP: "British Pound",
  RUB: "Russian Ruble",
  JPY: "Japanese Yen",
  CAD: "Canadian Dollar",
  AUD: "Australian Dollar",
  CHF: "Swiss Franc",
  CNY: "Chinese Yuan",
  INR: "Indian Rupee",
};

function SectionCard({
  title,
  description,
  icon: Icon,
  children,
  tone = "default",
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  tone?: "default" | "danger";
}) {
  return (
    <section
      className={cn(
        "rounded-[28px] border p-6 md:p-7 backdrop-blur-xl animate-slide-up",
        tone === "danger"
          ? "border-[#F87171]/25 bg-[linear-gradient(180deg,rgba(248,113,113,0.08),rgba(8,12,24,0.92))]"
          : "border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.88),rgba(6,11,22,0.94))]"
      )}
    >
      <div className="mb-6 flex items-start gap-4">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border",
            tone === "danger"
              ? "border-[#F87171]/30 bg-[#F87171]/10 text-[#F87171]"
              : "border-white/10 bg-white/5 text-[#9BD6FF]"
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-[#F9FAFB]">{title}</h2>
          <p className="mt-1 text-sm leading-relaxed text-[#94A3B8]">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function FieldLabel({
  title,
  hint,
}: {
  title: string;
  hint: string;
}) {
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium text-[#F9FAFB]">{title}</p>
      <p className="text-sm text-[#94A3B8]">{hint}</p>
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const userQuery = useMe();
  const settingsQuery = useNotificationSettings();

  const logout = useLogout();
  const deleteAccount = useDeleteAccount();
  const setBudgetLimit = useSetBudgetLimit();
  const changePassword = useChangePassword();
  const changeCurrency = useChangeCurrency();
  const updateSettings = useUpdateNotificationSettings();
  const exportPDF = useExportPDF();

  const userError = useApiError(userQuery);
  const settingsError = useApiError(settingsQuery);

  const user = userQuery.data?.data;
  const settings = settingsQuery.data?.data;
  const currency = (user?.currency ?? "USD") as Currency;

  const [smartAlerts, setSmartAlerts] = useState(true);
  const [prechargeDays, setPrechargeDays] = useState(3);
  const [notificationsFeedback, setNotificationsFeedback] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);

  const [budgetInput, setBudgetInput] = useState("");
  const [budgetFeedback, setBudgetFeedback] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);

  const [currencyInput, setCurrencyInput] = useState<Currency>("USD");
  const [currencyFeedback, setCurrencyFeedback] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordFeedback, setPasswordFeedback] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);

  const [importFeedback, setImportFeedback] = useState<{
    tone: "success" | "error" | "info";
    title: string;
    message: string;
  } | null>(null);

  const [exportFeedback, setExportFeedback] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);

  const [reminderFeedback, setReminderFeedback] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!settings) return;
    setSmartAlerts(settings.smartAlertsEnabled);
    setPrechargeDays(settings.prechargeReminderDays);
  }, [settings]);

  useEffect(() => {
    if (!user) return;
    setCurrencyInput((user.currency ?? "USD") as Currency);
    setBudgetInput(user.budgetLimit != null ? user.budgetLimit.toString() : "");
  }, [user]);

  const prechargeError =
    prechargeDays < 0 || prechargeDays > 30
      ? "Choose a reminder window between 0 and 30 days."
      : null;

  const budgetValue = budgetInput.trim() === "" ? null : Number(budgetInput);
  const budgetError =
    budgetInput.trim() !== "" && (!Number.isFinite(budgetValue) || (budgetValue ?? 0) < 0)
      ? "Budget must be a valid positive amount."
      : null;

  const hasSettingsChanged =
    !!settings &&
    (settings.smartAlertsEnabled !== smartAlerts ||
      settings.prechargeReminderDays !== prechargeDays);

  const isLoading = userQuery.isLoading || settingsQuery.isLoading;
  const hasConnectionError =
    userError.isConnectionError || settingsError.isConnectionError;

  async function handleNotificationSave() {
    if (!settings || prechargeError) return;
    setNotificationsFeedback(null);

    try {
      await updateSettings.mutateAsync({
        id: settings.id,
        userId: settings.userId,
        smartAlertsEnabled: smartAlerts,
        prechargeReminderDays: prechargeDays,
      });
      setNotificationsFeedback({
        tone: "success",
        message: "Notification preferences updated.",
      });
    } catch {
      setNotificationsFeedback({
        tone: "error",
        message: "Unable to save notification preferences right now.",
      });
    }
  }

  async function handleBudgetSave(nextValue?: number | null) {
    const resolvedValue =
      nextValue !== undefined ? nextValue : budgetInput.trim() === "" ? null : Number(budgetInput);

    if (resolvedValue !== null && (!Number.isFinite(resolvedValue) || resolvedValue < 0)) {
      setBudgetFeedback({
        tone: "error",
        message: "Enter a valid budget amount before saving.",
      });
      return;
    }

    setBudgetFeedback(null);

    try {
      await setBudgetLimit.mutateAsync({ budgetLimit: resolvedValue });
      if (resolvedValue === null) {
        setBudgetInput("");
      }
      setBudgetFeedback({
        tone: "success",
        message:
          resolvedValue === null
            ? "Monthly budget cleared."
            : "Monthly budget updated.",
      });
    } catch {
      setBudgetFeedback({
        tone: "error",
        message: "Budget change failed. Try again.",
      });
    }
  }

  async function handleCurrencySave() {
    setCurrencyFeedback(null);
    try {
      await changeCurrency.mutateAsync({ currency: currencyInput });
      setCurrencyFeedback({
        tone: "success",
        message: `Currency switched to ${currencyInput}.`,
      });
    } catch (error) {
      setCurrencyFeedback({
        tone: "error",
        message: error instanceof Error ? error.message : "Unable to update currency.",
      });
    }
  }

  async function handlePasswordSave() {
    setPasswordFeedback(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordFeedback({
        tone: "error",
        message: "Complete all password fields first.",
      });
      return;
    }

    if (newPassword.length < 8) {
      setPasswordFeedback({
        tone: "error",
        message: "New password must be at least 8 characters long.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordFeedback({
        tone: "error",
        message: "Confirmation password does not match.",
      });
      return;
    }

    try {
      await changePassword.mutateAsync({
        currentPassword,
        newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordFeedback({
        tone: "success",
        message: "Password updated.",
      });
    } catch (error) {
      setPasswordFeedback({
        tone: "error",
        message: error instanceof Error ? error.message : "Unable to change password.",
      });
    }
  }

  async function handleImportCsv(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportFeedback({
      tone: "info",
      title: "Import in progress",
      message: `Reading ${file.name}...`,
    });

    try {
      const csv = await file.text();
      const response = await fetch(`${apiUrl}/subscriptions/import`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({ csv }),
      });

      if (!response.ok) {
        throw new Error("Import failed");
      }

      const payload = await response.json();
      const result = payload.data ?? payload;

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["subscriptions"] }),
        queryClient.invalidateQueries({ queryKey: ["analytics"] }),
      ]);

      setImportFeedback({
        tone: "success",
        title: "Import completed",
        message:
          result.errors?.length > 0
            ? `Added ${result.imported} subscriptions. ${result.errors.length} rows could not be imported.`
            : `Added ${result.imported} subscriptions from CSV.`,
      });
    } catch {
      setImportFeedback({
        tone: "error",
        title: "Import failed",
        message: "Check the CSV structure and try again.",
      });
    } finally {
      event.target.value = "";
    }
  }

  async function handleExportCsv() {
    setExportFeedback(null);
    try {
      const response = await fetch(`${apiUrl}/export/csv`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "subscriptions.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportFeedback({
        tone: "success",
        message: "CSV export downloaded.",
      });
    } catch {
      setExportFeedback({
        tone: "error",
        message: "Unable to export CSV right now.",
      });
    }
  }

  async function handleExportPdf() {
    setExportFeedback(null);
    try {
      await exportPDF.mutateAsync();
      setExportFeedback({
        tone: "success",
        message: "PDF report downloaded.",
      });
    } catch {
      setExportFeedback({
        tone: "error",
        message: "Unable to export PDF right now.",
      });
    }
  }

  async function handleReminderTrigger() {
    setReminderFeedback(null);
    try {
      const response = await fetch(`${apiUrl}/notifications/trigger-reminders`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Trigger failed");
      }

      setReminderFeedback({
        tone: "success",
        message: "Reminder job triggered. Check your inbox or server logs.",
      });
    } catch {
      setReminderFeedback({
        tone: "error",
        message: "Unable to trigger reminders. Confirm the backend is available.",
      });
    }
  }

  async function handleDeleteAccount() {
    try {
      await deleteAccount.mutateAsync();
      localStorage.removeItem("auth_token");
      router.push("/login");
    } catch {
      setShowDeleteConfirm(false);
    }
  }

  if (isLoading) {
    return (
      <ProtectedRoute>
        <AppShell>
          <div className="p-8 md:p-10 lg:p-12">
            <div className="max-w-6xl space-y-6">
              <SkeletonCard />
              <SkeletonCard />
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
          <div className="mx-auto max-w-6xl space-y-8 animate-fade-in">
            {hasConnectionError ? (
              <ConnectionError
                onRetry={() => {
                  userQuery.refetch();
                  settingsQuery.refetch();
                }}
              />
            ) : null}

            {(userQuery.isError || settingsQuery.isError) && !hasConnectionError ? (
              <ErrorState
                title="Unable to load settings"
                message={
                  userError.errorMessage ??
                  settingsError.errorMessage ??
                  "Please retry in a moment."
                }
                onRetry={() => {
                  userQuery.refetch();
                  settingsQuery.refetch();
                }}
              />
            ) : null}

            <section className="rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_30%),linear-gradient(135deg,rgba(10,17,32,0.98),rgba(5,8,22,0.96))] p-7 md:p-8">
              <div className="grid gap-8 lg:grid-cols-[1.4fr_0.9fr]">
                <div className="space-y-4">
                  <Tag variant="success" size="md">
                    Preferences & control
                  </Tag>
                  <div className="space-y-3">
                    <h1 className="text-4xl font-semibold tracking-tight text-[#F9FAFB] md:text-5xl">
                      Keep your workspace quiet, clear, and under control.
                    </h1>
                    <p className="max-w-2xl text-base leading-relaxed text-[#A5B4C3] md:text-lg">
                      Tune reminders, budgets, exports, and security from one place.
                      Every action here is designed to keep ControlMe practical instead of noisy.
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-[#6B7280]">
                      Account
                    </p>
                    <p className="mt-3 text-sm font-medium text-[#F9FAFB]">
                      {user?.email ?? "No email available"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-[#6B7280]">
                      Currency
                    </p>
                    <p className="mt-3 text-2xl font-semibold text-[#F9FAFB]">{currency}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-[#6B7280]">
                      Member since
                    </p>
                    <p className="mt-3 text-sm font-medium text-[#F9FAFB]">
                      {user?.createdAt ? formatDate(user.createdAt) : "Unavailable"}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
              <div className="space-y-6">
                <SectionCard
                  title="Notifications"
                  description="Choose how early ControlMe should speak up, and keep alerts focused on useful signals."
                  icon={Bell}
                >
                  {!settings ? (
                    <EmptyState
                      title="Notification settings unavailable"
                      description="Refresh the page to load your reminder preferences."
                    />
                  ) : (
                    <div className="space-y-5">
                      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
                        <FieldLabel
                          title="Smart alerts"
                          hint="Highlight duplicates, price changes, and upcoming billing events."
                        />
                        <button
                          type="button"
                          onClick={() => setSmartAlerts((value) => !value)}
                          className={cn(
                            "relative h-6 w-11 rounded-full transition-colors",
                            smartAlerts ? "bg-[#4ADE80]" : "bg-white/10"
                          )}
                          aria-label="Toggle smart alerts"
                        >
                          <span
                            className={cn(
                              "absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all",
                              smartAlerts ? "left-6" : "left-1"
                            )}
                          />
                        </button>
                      </div>

                      <div className="space-y-3">
                        <FieldLabel
                          title="Reminder lead time"
                          hint="Choose how many days before a charge ControlMe should remind you."
                        />
                        <input
                          type="number"
                          min="0"
                          max="30"
                          value={prechargeDays}
                          onChange={(event) => {
                            const nextValue = parseInt(event.target.value, 10);
                            setPrechargeDays(Number.isNaN(nextValue) ? 0 : nextValue);
                          }}
                          className={cn(
                            "w-full rounded-2xl border bg-white/5 px-4 py-3 text-[#F9FAFB] outline-none transition",
                            prechargeError
                              ? "border-[#F97373]/40"
                              : "border-white/10 focus:border-[#4ADE80]/35"
                          )}
                        />
                        {prechargeError ? (
                          <StatusBanner tone="error">{prechargeError}</StatusBanner>
                        ) : (
                          <p className="text-sm text-[#94A3B8]">
                            Current reminder window: {prechargeDays} day
                            {prechargeDays === 1 ? "" : "s"} before charge.
                          </p>
                        )}
                      </div>

                      {notificationsFeedback ? (
                        <StatusBanner tone={notificationsFeedback.tone}>
                          {notificationsFeedback.message}
                        </StatusBanner>
                      ) : null}

                      <button
                        type="button"
                        onClick={handleNotificationSave}
                        disabled={
                          updateSettings.isPending || !hasSettingsChanged || !!prechargeError
                        }
                        className="rounded-2xl border border-[#4ADE80]/30 bg-[#4ADE80]/14 px-5 py-3 text-sm font-semibold text-[#4ADE80] transition hover:bg-[#4ADE80]/20 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {updateSettings.isPending
                          ? "Saving preferences..."
                          : "Save notification settings"}
                      </button>
                    </div>
                  )}
                </SectionCard>

                <SectionCard
                  title="Monthly budget"
                  description="Set a clear spending ceiling so subscription growth stays visible before it becomes a problem."
                  icon={Wallet}
                >
                  <div className="space-y-4">
                    <FieldLabel
                      title="Budget target"
                      hint="This is used across the dashboard to compare active monthly spend against your own limit."
                    />
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={budgetInput}
                        onChange={(event) => setBudgetInput(event.target.value)}
                        className={cn(
                          "min-w-0 flex-1 rounded-2xl border bg-white/5 px-4 py-3 text-[#F9FAFB] outline-none transition",
                          budgetError
                            ? "border-[#F97373]/40"
                            : "border-white/10 focus:border-[#4ADE80]/35"
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => handleBudgetSave()}
                        disabled={setBudgetLimit.isPending || !!budgetError}
                        className="rounded-2xl bg-[#4ADE80] px-5 py-3 text-sm font-semibold text-[#04101A] transition hover:bg-[#74E6A1] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {setBudgetLimit.isPending ? "Saving..." : "Save limit"}
                      </button>
                      {user?.budgetLimit != null ? (
                        <button
                          type="button"
                          onClick={() => handleBudgetSave(null)}
                          disabled={setBudgetLimit.isPending}
                          className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-[#D3DBE4] transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Remove
                        </button>
                      ) : null}
                    </div>

                    {budgetError ? (
                      <StatusBanner tone="error">{budgetError}</StatusBanner>
                    ) : null}

                    {budgetFeedback ? (
                      <StatusBanner tone={budgetFeedback.tone}>
                        {budgetFeedback.message}
                      </StatusBanner>
                    ) : null}

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-[#6B7280]">
                        Current monthly limit
                      </p>
                      <p className="mt-3 text-2xl font-semibold text-[#F9FAFB]">
                        {user?.budgetLimit != null
                          ? formatCurrency(user.budgetLimit, currency)
                          : "No budget set"}
                      </p>
                    </div>
                  </div>
                </SectionCard>

                <SectionCard
                  title="Security"
                  description="Keep your account private and stable with direct password management and session controls."
                  icon={Shield}
                >
                  <div className="space-y-4">
                    <div className="grid gap-3">
                      <input
                        type="password"
                        placeholder="Current password"
                        value={currentPassword}
                        onChange={(event) => setCurrentPassword(event.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[#F9FAFB] outline-none transition focus:border-[#4ADE80]/35"
                      />
                      <input
                        type="password"
                        placeholder="New password"
                        value={newPassword}
                        onChange={(event) => setNewPassword(event.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[#F9FAFB] outline-none transition focus:border-[#4ADE80]/35"
                      />
                      <input
                        type="password"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[#F9FAFB] outline-none transition focus:border-[#4ADE80]/35"
                      />
                    </div>

                    {passwordFeedback ? (
                      <StatusBanner tone={passwordFeedback.tone}>
                        {passwordFeedback.message}
                      </StatusBanner>
                    ) : null}

                    <button
                      type="button"
                      onClick={handlePasswordSave}
                      disabled={changePassword.isPending}
                      className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-[#F9FAFB] transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <KeyRound className="h-4 w-4" />
                      {changePassword.isPending ? "Updating..." : "Update password"}
                    </button>
                  </div>
                </SectionCard>
              </div>

              <div className="space-y-6">
                <SectionCard
                  title="Profile"
                  description="Review account identity and choose the currency used across dashboard totals and analytics."
                  icon={CreditCard}
                >
                  {!user ? (
                    <EmptyState
                      title="Account details unavailable"
                      description="Refresh the page to load your profile."
                    />
                  ) : (
                    <div className="space-y-5">
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-xs uppercase tracking-[0.24em] text-[#6B7280]">
                          Email
                        </p>
                        <p className="mt-3 text-sm font-medium text-[#F9FAFB]">{user.email}</p>
                      </div>

                      <div className="space-y-3">
                        <FieldLabel
                          title="Base currency"
                          hint="All totals, analytics summaries, and budget comparisons follow this selection."
                        />
                        <div className="flex flex-col gap-3 sm:flex-row">
                          <select
                            value={currencyInput}
                            onChange={(event) => setCurrencyInput(event.target.value as Currency)}
                            className="app-select min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[#F9FAFB] outline-none transition focus:border-[#4ADE80]/35"
                          >
                            {CURRENCIES.map((value) => (
                              <option key={value} value={value}>
                                {value} · {currencyNames[value]}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={handleCurrencySave}
                            disabled={changeCurrency.isPending || currencyInput === currency}
                            className="rounded-2xl bg-[#4ADE80] px-5 py-3 text-sm font-semibold text-[#04101A] transition hover:bg-[#74E6A1] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {changeCurrency.isPending ? "Saving..." : "Apply"}
                          </button>
                        </div>
                        {currencyFeedback ? (
                          <StatusBanner tone={currencyFeedback.tone}>
                            {currencyFeedback.message}
                          </StatusBanner>
                        ) : null}
                      </div>
                    </div>
                  )}
                </SectionCard>

                <SectionCard
                  title="Email reminders"
                  description="Manual trigger for charge reminder delivery and visibility into how reminder delivery behaves."
                  icon={Mail}
                >
                  <div className="space-y-4">
                    <StatusBanner tone="neutral" title="Reminder behavior">
                      Daily reminder digests are sent to your account email when subscriptions fall
                      inside your configured reminder window. If SMTP is not configured, reminder
                      output may only appear in backend logs.
                    </StatusBanner>

                    {reminderFeedback ? (
                      <StatusBanner tone={reminderFeedback.tone}>
                        {reminderFeedback.message}
                      </StatusBanner>
                    ) : null}

                    <button
                      type="button"
                      onClick={handleReminderTrigger}
                      className="inline-flex items-center gap-2 rounded-2xl border border-[#38BDF8]/30 bg-[#38BDF8]/10 px-5 py-3 text-sm font-medium text-[#7DD3FC] transition hover:bg-[#38BDF8]/16"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Send test reminder
                    </button>
                  </div>
                </SectionCard>

                <SectionCard
                  title="Import & export"
                  description="Move your data in and out cleanly for backups, migrations, and spreadsheet review."
                  icon={Download}
                >
                  <div className="space-y-5">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-[#6B7280]">
                        CSV columns
                      </p>
                      <p className="mt-3 font-mono text-sm text-[#D6E0E8]">
                        name, price, billingPeriod, category, startDate
                      </p>
                      <p className="mt-2 text-sm text-[#94A3B8]">
                        Use `MONTHLY` or `YEARLY` for billing period values.
                      </p>
                    </div>

                    {importFeedback ? (
                      <StatusBanner
                        tone={importFeedback.tone === "info" ? "info" : importFeedback.tone}
                        title={importFeedback.title}
                      >
                        {importFeedback.message}
                      </StatusBanner>
                    ) : null}

                    {exportFeedback ? (
                      <StatusBanner tone={exportFeedback.tone}>
                        {exportFeedback.message}
                      </StatusBanner>
                    ) : null}

                    <div className="flex flex-wrap gap-3">
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-[#F9FAFB] transition hover:bg-white/10">
                        <Upload className="h-4 w-4" />
                        Upload CSV
                        <input
                          type="file"
                          accept=".csv,text/csv"
                          className="hidden"
                          onChange={handleImportCsv}
                        />
                      </label>

                      <button
                        type="button"
                        onClick={handleExportPdf}
                        disabled={exportPDF.isPending}
                        className="rounded-2xl border border-[#38BDF8]/30 bg-[#38BDF8]/10 px-5 py-3 text-sm font-medium text-[#7DD3FC] transition hover:bg-[#38BDF8]/16 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {exportPDF.isPending ? "Exporting PDF..." : "Export PDF"}
                      </button>

                      <button
                        type="button"
                        onClick={handleExportCsv}
                        className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-[#F9FAFB] transition hover:bg-white/10"
                      >
                        Export CSV
                      </button>
                    </div>
                  </div>
                </SectionCard>

                <SectionCard
                  title="Session"
                  description="End the current session cleanly on this device."
                  icon={LogOut}
                >
                  <button
                    type="button"
                    onClick={() => logout.mutate()}
                    disabled={logout.isPending}
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-[#F9FAFB] transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <LogOut className="h-4 w-4" />
                    {logout.isPending ? "Signing out..." : "Sign out"}
                  </button>
                </SectionCard>

                <SectionCard
                  title="Danger zone"
                  description="Irreversible actions stay separated here so there is no accidental overlap with day-to-day settings."
                  icon={Trash2}
                  tone="danger"
                >
                  <div className="space-y-4">
                    <StatusBanner tone="error" title="Permanent deletion">
                      Deleting your account removes access, subscriptions, reminders, and stored
                      profile data.
                    </StatusBanner>

                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm((value) => !value)}
                      className="rounded-2xl border border-[#F87171]/30 bg-[#F87171]/10 px-5 py-3 text-sm font-medium text-[#FCA5A5] transition hover:bg-[#F87171]/16"
                    >
                      {showDeleteConfirm ? "Hide confirmation" : "Delete account"}
                    </button>

                    {showDeleteConfirm ? (
                      <div className="rounded-2xl border border-[#F87171]/25 bg-black/20 p-4">
                        <p className="text-sm font-medium text-[#FDE2E2]">
                          This action cannot be undone.
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-[#D8B4B4]">
                          If you continue, ControlMe will remove your account and associated data.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={handleDeleteAccount}
                            disabled={deleteAccount.isPending}
                            className="rounded-2xl bg-[#F87171] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#FB8B8B] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deleteAccount.isPending ? "Deleting..." : "Yes, delete everything"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowDeleteConfirm(false)}
                            className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-[#D3DBE4] transition hover:bg-white/10"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </SectionCard>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
