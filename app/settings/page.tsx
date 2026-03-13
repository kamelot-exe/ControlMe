"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Bell, Download, KeyRound, LogOut, RefreshCw, Shield, Trash2, Upload, Wallet } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ConnectionError } from "@/components/errors/ConnectionError";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState, ErrorState, StatusBanner, Tag } from "@/components/ui";
import { useAppUi } from "@/components/ui/AppUiProvider";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { useChangeCurrency, useChangePassword, useDeleteAccount, useLogout, useMe, useSetBudgetLimit } from "@/hooks/use-auth";
import { useExportPDF, useNotificationSettings, useUpdateNotificationSettings } from "@/hooks/use-settings";
import { useApiError } from "@/hooks/use-api-error";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { translate } from "@/lib/i18n";
import type { Currency } from "@/shared/types";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const CURRENCIES: Currency[] = ["USD", "EUR", "GBP", "RUB", "JPY", "CAD", "AUD", "CHF", "CNY", "INR"];

function Section({
  title,
  description,
  icon: Icon,
  children,
  danger = false,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <section
      className={cn(
        "rounded-[28px] border p-6 md:p-7",
        danger
          ? "border-[#F87171]/25 bg-[linear-gradient(180deg,rgba(248,113,113,0.08),rgba(8,12,24,0.92))]"
          : "border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.88),rgba(6,11,22,0.94))]",
      )}
    >
      <div className="mb-5 flex items-start gap-4">
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-2xl border", danger ? "border-[#F87171]/30 bg-[#F87171]/10 text-[#F87171]" : "border-white/10 bg-white/5 text-[#FF7355]")}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-[#F9FAFB]">{title}</h2>
          <p className="mt-1 text-sm text-[#94A3B8]">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

export default function SettingsPage() {
  const { language } = useAppUi();
  const t = (fallback: string, values?: Record<string, string>) =>
    translate(language, (values ?? {}) as Record<typeof language, string>, fallback);
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
  const [budgetInput, setBudgetInput] = useState("");
  const [currencyInput, setCurrencyInput] = useState<Currency>("USD");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [feedback, setFeedback] = useState<Record<string, { tone: "success" | "error" | "info"; message: string; title?: string } | null>>({});

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

  const isLoading = userQuery.isLoading || settingsQuery.isLoading;
  const hasConnectionError = userError.isConnectionError || settingsError.isConnectionError;
  const budgetNumber = budgetInput.trim() === "" ? null : Number(budgetInput);
  const budgetError = budgetInput.trim() !== "" && (!Number.isFinite(budgetNumber) || (budgetNumber ?? 0) < 0) ? "Budget must be a valid positive amount." : null;
  const prechargeError = prechargeDays < 0 || prechargeDays > 30 ? "Choose a reminder window between 0 and 30 days." : null;
  const settingsChanged = !!settings && (settings.smartAlertsEnabled !== smartAlerts || settings.prechargeReminderDays !== prechargeDays);

  async function handleNotificationSave() {
    if (!settings || prechargeError) return;
    try {
      await updateSettings.mutateAsync({
        id: settings.id,
        userId: settings.userId,
        smartAlertsEnabled: smartAlerts,
        prechargeReminderDays: prechargeDays,
      });
      setFeedback((v) => ({ ...v, notifications: { tone: "success", message: "Notification preferences updated." } }));
    } catch {
      setFeedback((v) => ({ ...v, notifications: { tone: "error", message: "Unable to save notification preferences right now." } }));
    }
  }

  async function handleBudgetSave(nextValue?: number | null) {
    const value = nextValue !== undefined ? nextValue : budgetInput.trim() === "" ? null : Number(budgetInput);
    if (value !== null && (!Number.isFinite(value) || value < 0)) {
      setFeedback((v) => ({ ...v, budget: { tone: "error", message: "Enter a valid budget amount before saving." } }));
      return;
    }
    try {
      await setBudgetLimit.mutateAsync({ budgetLimit: value });
      if (value === null) setBudgetInput("");
      setFeedback((v) => ({ ...v, budget: { tone: "success", message: value === null ? "Monthly budget cleared." : "Monthly budget updated." } }));
    } catch {
      setFeedback((v) => ({ ...v, budget: { tone: "error", message: "Budget change failed. Try again." } }));
    }
  }

  async function handleCurrencySave() {
    try {
      await changeCurrency.mutateAsync({ currency: currencyInput });
      setFeedback((v) => ({ ...v, currency: { tone: "success", message: `Currency switched to ${currencyInput}.` } }));
    } catch (error) {
      setFeedback((v) => ({ ...v, currency: { tone: "error", message: error instanceof Error ? error.message : "Unable to update currency." } }));
    }
  }

  async function handlePasswordSave() {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setFeedback((v) => ({ ...v, password: { tone: "error", message: "Complete all password fields first." } }));
      return;
    }
    if (newPassword.length < 8) {
      setFeedback((v) => ({ ...v, password: { tone: "error", message: "New password must be at least 8 characters long." } }));
      return;
    }
    if (newPassword !== confirmPassword) {
      setFeedback((v) => ({ ...v, password: { tone: "error", message: "Confirmation password does not match." } }));
      return;
    }
    try {
      await changePassword.mutateAsync({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setFeedback((v) => ({ ...v, password: { tone: "success", message: "Password updated." } }));
    } catch (error) {
      setFeedback((v) => ({ ...v, password: { tone: "error", message: error instanceof Error ? error.message : "Unable to change password." } }));
    }
  }

  async function handleImportCsv(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const csv = await file.text();
      const response = await fetch(`${apiUrl}/subscriptions/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
        body: JSON.stringify({ csv }),
      });
      if (!response.ok) throw new Error("Import failed");
      const payload = await response.json();
      const result = payload.data ?? payload;
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["subscriptions"] }),
        queryClient.invalidateQueries({ queryKey: ["analytics"] }),
      ]);
      setFeedback((v) => ({ ...v, import: { tone: "success", title: "Import completed", message: `Added ${result.imported} subscriptions from CSV.` } }));
    } catch {
      setFeedback((v) => ({ ...v, import: { tone: "error", title: "Import failed", message: "Check the CSV structure and try again." } }));
    } finally {
      event.target.value = "";
    }
  }

  async function handleExportCsv() {
    try {
      const response = await fetch(`${apiUrl}/export/csv`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
      });
      if (!response.ok) throw new Error("Export failed");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "subscriptions.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setFeedback((v) => ({ ...v, export: { tone: "success", message: "CSV export downloaded." } }));
    } catch {
      setFeedback((v) => ({ ...v, export: { tone: "error", message: "Unable to export CSV right now." } }));
    }
  }

  async function handleExportPdf() {
    try {
      await exportPDF.mutateAsync();
      setFeedback((v) => ({ ...v, export: { tone: "success", message: "PDF report downloaded." } }));
    } catch {
      setFeedback((v) => ({ ...v, export: { tone: "error", message: "Unable to export PDF right now." } }));
    }
  }

  async function handleReminderTrigger() {
    try {
      const response = await fetch(`${apiUrl}/notifications/trigger-reminders`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
      });
      if (!response.ok) throw new Error("Trigger failed");
      setFeedback((v) => ({ ...v, reminder: { tone: "success", message: "Reminder job triggered. Check your inbox or server logs." } }));
    } catch {
      setFeedback((v) => ({ ...v, reminder: { tone: "error", message: "Unable to trigger reminders. Confirm the backend is available." } }));
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
          <div className="p-6 md:p-8 lg:p-10 xl:p-12">
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
        <div className="p-6 md:p-8 lg:p-10 xl:p-12">
          <div className="mx-auto max-w-6xl space-y-8 animate-fade-in">
            {hasConnectionError ? <ConnectionError onRetry={() => { userQuery.refetch(); settingsQuery.refetch(); }} /> : null}
            {(userQuery.isError || settingsQuery.isError) && !hasConnectionError ? (
              <ErrorState title={t("Unable to load settings", { FR: "Impossible de charger les parametres", RU: "Не удалось загрузить настройки", ES: "No se pudieron cargar los ajustes", PT: "Nao foi possivel carregar as configuracoes" })} message={userError.errorMessage ?? settingsError.errorMessage ?? t("Please retry in a moment.", { FR: "Veuillez reessayer dans un instant.", RU: "Повторите попытку через минуту.", ES: "Vuelve a intentarlo en un momento.", PT: "Tente novamente em instantes." })} onRetry={() => { userQuery.refetch(); settingsQuery.refetch(); }} />
            ) : null}

            <section className="rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(255,115,85,0.18),transparent_30%),linear-gradient(135deg,rgba(10,17,32,0.98),rgba(5,8,22,0.96))] p-6 md:p-7 lg:p-8">
              <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
                <div className="space-y-4">
                  <Tag variant="success" size="md">{t("Preferences & control", { FR: "Preferences et controle", RU: "Параметры и контроль", ES: "Preferencias y control", PT: "Preferencias e controle" })}</Tag>
                  <div className="space-y-3">
                    <h1 className="text-3xl font-semibold tracking-tight text-[#F9FAFB] md:text-4xl lg:text-5xl">{t("Keep your workspace quiet, clear, and under control.", { FR: "Gardez votre espace clair et sous controle.", RU: "Держите рабочее пространство чистым и под контролем.", ES: "Mantén tu espacio claro y bajo control.", PT: "Mantenha seu espaco claro e sob controle." })}</h1>
                    <p className="max-w-2xl text-base leading-relaxed text-[#A5B4C3] md:text-lg">{t("Tune reminders, budgets, exports, and security from one place.", { FR: "Gerez rappels, budget, export et securite depuis un seul endroit.", RU: "Управляйте напоминаниями, бюджетом, экспортом и безопасностью в одном месте.", ES: "Ajusta recordatorios, presupuesto, exportaciones y seguridad en un solo lugar.", PT: "Ajuste lembretes, orcamento, exportacoes e seguranca em um so lugar." })}</p>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-[#6B7280]">{t("Account", { FR: "Compte", RU: "Аккаунт", ES: "Cuenta", PT: "Conta" })}</p>
                    <p className="mt-3 break-all text-sm font-medium text-[#F9FAFB]">{user?.email ?? t("No email available", { FR: "Aucun email", RU: "Нет email", ES: "Sin correo", PT: "Sem email" })}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-[#6B7280]">{t("Member since", { FR: "Membre depuis", RU: "С нами с", ES: "Miembro desde", PT: "Membro desde" })}</p>
                    <p className="mt-3 text-sm font-medium text-[#F9FAFB]">{user?.createdAt ? formatDate(user.createdAt) : t("Unavailable", { FR: "Indisponible", RU: "Недоступно", ES: "No disponible", PT: "Indisponivel" })}</p>
                  </div>
                </div>
              </div>
            </section>

            <div className="space-y-6">
              <Section title={t("Notifications", { FR: "Notifications", RU: "Уведомления", ES: "Notificaciones", PT: "Notificacoes" })} description={t("Keep reminders and notification controls in one place.", { FR: "Gardez rappels et controles au meme endroit.", RU: "Держите напоминания и настройки уведомлений в одном месте.", ES: "Mantén recordatorios y controles juntos.", PT: "Mantenha lembretes e controles juntos." })} icon={Bell}>
                {!settings ? (
                  <EmptyState title={t("Notification settings unavailable", { FR: "Notifications indisponibles", RU: "Настройки уведомлений недоступны", UK: "Налаштування сповіщень недоступні", GE: "Benachrichtigungseinstellungen nicht verfugbar", ES: "Configuracion de notificaciones no disponible", PT: "Configuracoes de notificacao indisponiveis", IT: "Impostazioni notifiche non disponibili", PL: "Ustawienia powiadomien niedostepne", TR: "Bildirim ayarlari kullanilamiyor", UZ: "Bildirishnoma sozlamalari mavjud emas" })} description={t("Refresh the page to load your reminder preferences.", { FR: "Rafraichissez la page pour charger vos preferences.", RU: "Обновите страницу, чтобы загрузить настройки напоминаний.", UK: "Оновіть сторінку, щоб завантажити налаштування нагадувань.", GE: "Aktualisieren Sie die Seite, um Ihre Erinnerungen zu laden.", ES: "Actualiza la pagina para cargar tus preferencias.", PT: "Atualize a pagina para carregar suas preferencias.", IT: "Aggiorna la pagina per caricare le preferenze.", PL: "Odswiez strone, aby zaladowac preferencje.", TR: "Hatirlatma tercihlerini yuklemek icin sayfayi yenileyin.", UZ: "Eslatma sozlamalarini yuklash uchun sahifani yangilang." })} />
                ) : (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div>
                        <p className="text-sm font-medium text-[#F9FAFB]">{t("Smart alerts", { FR: "Alertes intelligentes", RU: "Умные уведомления", UK: "Розумні сповіщення", GE: "Smarte Hinweise", ES: "Alertas inteligentes", PT: "Alertas inteligentes", IT: "Avvisi intelligenti", PL: "Inteligentne alerty", TR: "Akilli uyarilar", UZ: "Aqlli ogohlantirishlar" })}</p>
                        <p className="text-sm text-[#94A3B8]">{t("Highlight duplicates, price changes, and upcoming billing events.", { FR: "Mettez en avant les doublons, changements de prix et paiements a venir.", RU: "Показывайте дубликаты, изменения цены и скорые списания.", UK: "Показуйте дублікати, зміни цін і майбутні списання.", GE: "Hebt Duplikate, Preisanderungen und kommende Abbuchungen hervor.", ES: "Destaca duplicados, cambios de precio y cobros proximos.", PT: "Destaque duplicatas, mudancas de preco e cobrancas futuras.", IT: "Evidenzia duplicati, cambi di prezzo e addebiti in arrivo.", PL: "Pokazuj duplikaty, zmiany cen i nadchodzace platnosci.", TR: "Cakismalari, fiyat degisikliklerini ve yaklasan odemeleri vurgular.", UZ: "Takroriy xizmatlar, narx ozgarishlari va yaqin tolovlarni korsatadi." })}</p>
                      </div>
                      <button type="button" onClick={() => setSmartAlerts((value) => !value)} className={cn("relative h-6 w-11 rounded-full transition-colors", smartAlerts ? "bg-[#4ADE80]" : "bg-white/10")}>
                        <span className={cn("absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all", smartAlerts ? "left-6" : "left-1")} />
                      </button>
                    </div>

                    <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
                      <div className="space-y-3">
                        <p className="text-sm font-medium text-[#F9FAFB]">{t("Reminder lead time", { FR: "Delai du rappel", RU: "Срок напоминания", UK: "Проміжок нагадування", GE: "Erinnerungsvorlauf", ES: "Anticipacion del recordatorio", PT: "Antecedencia do lembrete", IT: "Anticipo promemoria", PL: "Wyprzedzenie przypomnienia", TR: "Hatirlatma suresi", UZ: "Eslatma muddati" })}</p>
                        <input type="number" min="0" max="30" value={prechargeDays} onChange={(event) => { const nextValue = parseInt(event.target.value, 10); setPrechargeDays(Number.isNaN(nextValue) ? 0 : nextValue); }} className={cn("w-full rounded-2xl border bg-white/5 px-4 py-3 text-[#F9FAFB] outline-none transition", prechargeError ? "border-[#F97373]/40" : "border-white/10 focus:border-[#4ADE80]/35")} />
                        {!prechargeError ? <p className="text-sm text-[#94A3B8]">{t("Current reminder window:", { FR: "Fenetre actuelle :", RU: "Текущее окно напоминания:", UK: "Поточне вікно нагадування:", GE: "Aktuelles Erinnerungsfenster:", ES: "Ventana actual:", PT: "Janela atual:", IT: "Finestra attuale:", PL: "Obecne okno przypomnienia:", TR: "Mevcut hatirlatma araligi:", UZ: "Joriy eslatma oraligi:" })} {prechargeDays} {t(prechargeDays === 1 ? "day before charge." : "days before charge.", { FR: prechargeDays === 1 ? "jour avant paiement." : "jours avant paiement.", RU: prechargeDays === 1 ? "день до списания." : "дней до списания.", UK: prechargeDays === 1 ? "день до списання." : "днів до списання.", GE: prechargeDays === 1 ? "Tag vor der Abbuchung." : "Tage vor der Abbuchung.", ES: prechargeDays === 1 ? "dia antes del cobro." : "dias antes del cobro.", PT: prechargeDays === 1 ? "dia antes da cobranca." : "dias antes da cobranca.", IT: prechargeDays === 1 ? "giorno prima dell'addebito." : "giorni prima dell'addebito.", PL: prechargeDays === 1 ? "dzien przed platnoscia." : "dni przed platnoscia.", TR: prechargeDays === 1 ? "gun once." : "gun once.", UZ: prechargeDays === 1 ? "kun oldin." : "kun oldin." })}</p> : null}
                      </div>
                    <button type="button" onClick={handleReminderTrigger} className="inline-flex items-center gap-2 rounded-2xl border border-[#FF7355]/30 bg-[#FF7355]/10 px-5 py-3 text-sm font-medium text-[#FF7355] transition hover:bg-[#FF7355]/16">
                      <RefreshCw className="h-4 w-4" />
                      {t("Send test reminder", { FR: "Envoyer un test", RU: "Тестовое письмо", ES: "Enviar prueba", PT: "Enviar teste" })}
                    </button>
                    </div>

                    <StatusBanner tone="neutral" title={t("Reminder behavior", { FR: "Comportement des rappels", RU: "Поведение напоминаний", UK: "Робота нагадувань", GE: "Erinnerungsverhalten", ES: "Comportamiento de recordatorios", PT: "Comportamento dos lembretes", IT: "Comportamento promemoria", PL: "Dzialanie przypomnien", TR: "Hatirlatma davranisi", UZ: "Eslatma ishlashi" })}>{t("Daily reminder digests are sent to your account email when subscriptions fall inside your configured reminder window.", { FR: "Un resume quotidien est envoye lorsque des abonnements entrent dans votre fenetre de rappel.", RU: "Ежедневные напоминания отправляются на почту, когда подписки попадают в заданное окно.", UK: "Щоденні нагадування надсилаються на пошту, коли підписки потрапляють у вказане вікно.", GE: "Tagliche Erinnerungen werden gesendet, wenn Abos in Ihr Erinnerungsfenster fallen.", ES: "Se envian recordatorios diarios cuando una suscripcion entra en tu ventana configurada.", PT: "Lembretes diarios sao enviados quando assinaturas entram na janela configurada.", IT: "I riepiloghi giornalieri vengono inviati quando gli abbonamenti rientrano nella finestra scelta.", PL: "Codzienne przypomnienia sa wysylane, gdy subskrypcje wejda w ustawione okno.", TR: "Abonelikler ayarlanan pencereye girdiginde gunluk hatirlatmalar gonderilir.", UZ: "Obunalar belgilangan eslatma oraligiga kirganda kunlik xabar yuboriladi." })}</StatusBanner>
                    {prechargeError ? <StatusBanner tone="error">{prechargeError}</StatusBanner> : null}
                    {feedback.reminder ? <StatusBanner tone={feedback.reminder.tone}>{feedback.reminder.message}</StatusBanner> : null}
                    {feedback.notifications ? <StatusBanner tone={feedback.notifications.tone}>{feedback.notifications.message}</StatusBanner> : null}

                    <button type="button" onClick={handleNotificationSave} disabled={updateSettings.isPending || !settingsChanged || !!prechargeError} className="rounded-2xl border border-[#4ADE80]/30 bg-[#4ADE80]/14 px-5 py-3 text-sm font-semibold text-[#4ADE80] transition hover:bg-[#4ADE80]/20 disabled:cursor-not-allowed disabled:opacity-40">
                      {updateSettings.isPending ? t("Saving preferences...", { FR: "Enregistrement...", RU: "Сохранение...", UK: "Збереження...", GE: "Speichern...", ES: "Guardando...", PT: "Salvando...", IT: "Salvataggio...", PL: "Zapisywanie...", TR: "Kaydediliyor...", UZ: "Saqlanmoqda..." }) : t("Save notification settings", { FR: "Enregistrer les notifications", RU: "Сохранить настройки уведомлений", UK: "Зберегти налаштування сповіщень", GE: "Benachrichtigungen speichern", ES: "Guardar notificaciones", PT: "Salvar notificacoes", IT: "Salva notifiche", PL: "Zapisz powiadomienia", TR: "Bildirim ayarlarini kaydet", UZ: "Bildirishnomalarni saqlash" })}
                    </button>
                  </div>
                )}
              </Section>

              <Section title={t("Monthly budget", { FR: "Budget mensuel", RU: "Месячный бюджет", ES: "Presupuesto mensual", PT: "Orcamento mensal" })} description={t("Keep budget and currency together so financial controls stay in one place.", { FR: "Gardez budget et devise ensemble.", RU: "Храните бюджет и валюту в одном разделе.", ES: "Mantén presupuesto y moneda juntos.", PT: "Mantenha orcamento e moeda juntos." })} icon={Wallet}>
                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="space-y-4">
                    <p className="text-sm font-medium text-[#F9FAFB]">{t("Budget target", { FR: "Objectif budget", RU: "Цель бюджета", UK: "Ціль бюджету", GE: "Budgetziel", ES: "Objetivo de presupuesto", PT: "Meta de orcamento", IT: "Obiettivo budget", PL: "Cel budzetu", TR: "Butce hedefi", UZ: "Budjet maqsadi" })}</p>
                    <input type="number" min="0" step="0.01" placeholder="0.00" value={budgetInput} onChange={(event) => setBudgetInput(event.target.value)} className={cn("w-full rounded-2xl border bg-white/5 px-4 py-3 text-[#F9FAFB] outline-none transition", budgetError ? "border-[#F97373]/40" : "border-white/10 focus:border-[#4ADE80]/35")} />
                    <div className="flex flex-wrap gap-3">
                      <button type="button" onClick={() => handleBudgetSave()} disabled={setBudgetLimit.isPending || !!budgetError} className="rounded-2xl bg-[#4ADE80] px-5 py-3 text-sm font-semibold text-[#04101A] transition hover:bg-[#74E6A1] disabled:opacity-50">
                        {setBudgetLimit.isPending ? t("Saving...", { FR: "Enregistrement...", RU: "Сохранение...", UK: "Збереження...", GE: "Speichern...", ES: "Guardando...", PT: "Salvando...", IT: "Salvataggio...", PL: "Zapisywanie...", TR: "Kaydediliyor...", UZ: "Saqlanmoqda..." }) : t("Save limit", { FR: "Enregistrer la limite", RU: "Сохранить лимит", UK: "Зберегти ліміт", GE: "Limit speichern", ES: "Guardar limite", PT: "Salvar limite", IT: "Salva limite", PL: "Zapisz limit", TR: "Limiti kaydet", UZ: "Limitni saqlash" })}
                      </button>
                      {user?.budgetLimit != null ? <button type="button" onClick={() => handleBudgetSave(null)} disabled={setBudgetLimit.isPending} className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-[#D3DBE4] transition hover:bg-white/10 disabled:opacity-50">{t("Remove", { FR: "Supprimer", RU: "Убрать", UK: "Прибрати", GE: "Entfernen", ES: "Quitar", PT: "Remover", IT: "Rimuovi", PL: "Usun", TR: "Kaldir", UZ: "Olib tashlash" })}</button> : null}
                    </div>
                    {budgetError ? <StatusBanner tone="error">{budgetError}</StatusBanner> : null}
                    {feedback.budget ? <StatusBanner tone={feedback.budget.tone}>{feedback.budget.message}</StatusBanner> : null}
                  </div>

                  <div className="space-y-4">
                    <p className="text-sm font-medium text-[#F9FAFB]">{t("Base currency", { FR: "Devise de base", RU: "Базовая валюта", UK: "Базова валюта", GE: "Basiswahrung", ES: "Moneda base", PT: "Moeda base", IT: "Valuta base", PL: "Waluta bazowa", TR: "Temel para birimi", UZ: "Asosiy valyuta" })}</p>
                    <select value={currencyInput} onChange={(event) => setCurrencyInput(event.target.value as Currency)} className="app-select w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[#F9FAFB] outline-none transition focus:border-[#4ADE80]/35">
                      {CURRENCIES.map((value) => <option key={value} value={value}>{value}</option>)}
                    </select>
                    <button type="button" onClick={handleCurrencySave} disabled={changeCurrency.isPending || currencyInput === currency} className="rounded-2xl border border-[#FF7355]/30 bg-[#FF7355]/10 px-5 py-3 text-sm font-semibold text-[#FF7355] transition hover:bg-[#FF7355]/16 disabled:opacity-50">
                      {changeCurrency.isPending ? t("Saving...", { FR: "Enregistrement...", RU: "Сохранение...", UK: "Збереження...", GE: "Speichern...", ES: "Guardando...", PT: "Salvando...", IT: "Salvataggio...", PL: "Zapisywanie...", TR: "Kaydediliyor...", UZ: "Saqlanmoqda..." }) : t("Apply currency", { FR: "Appliquer", RU: "Применить валюту", UK: "Застосувати валюту", GE: "Wahrung anwenden", ES: "Aplicar moneda", PT: "Aplicar moeda", IT: "Applica valuta", PL: "Zastosuj walute", TR: "Para birimini uygula", UZ: "Valyutani qollash" })}
                    </button>
                    {feedback.currency ? <StatusBanner tone={feedback.currency.tone}>{feedback.currency.message}</StatusBanner> : null}
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-[#6B7280]">{t("Current monthly limit", { FR: "Limite mensuelle actuelle", RU: "Текущий месячный лимит", UK: "Поточний місячний ліміт", GE: "Aktuelles Monatslimit", ES: "Limite mensual actual", PT: "Limite mensal atual", IT: "Limite mensile attuale", PL: "Aktualny limit miesieczny", TR: "Mevcut aylik limit", UZ: "Joriy oylik limit" })}</p>
                      <p className="mt-3 text-2xl font-semibold text-[#F9FAFB]">{user?.budgetLimit != null ? formatCurrency(user.budgetLimit, currency) : t("No budget set", { FR: "Aucun budget", RU: "Бюджет не задан", UK: "Бюджет не встановлено", GE: "Kein Budget gesetzt", ES: "Sin presupuesto", PT: "Sem orcamento", IT: "Nessun budget", PL: "Brak budzetu", TR: "Butce yok", UZ: "Budjet yoq" })}</p>
                    </div>
                  </div>
                </div>
              </Section>

              <Section title={t("Security", { FR: "Securite", RU: "Безопасность", ES: "Seguridad", PT: "Seguranca" })} description={t("Password changes, imports, exports, and session controls live here.", { FR: "Mot de passe, import, export et session se gerent ici.", RU: "Пароль, импорт, экспорт и сессия находятся здесь.", ES: "Aqui gestionas contrasena, importacion, exportacion y sesion.", PT: "Senha, importacao, exportacao e sessao ficam aqui." })} icon={Shield}>
                <div className="space-y-6">
                  <div className="grid gap-3">
                    <input type="password" placeholder="Current password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[#F9FAFB] outline-none transition focus:border-[#4ADE80]/35" />
                    <input type="password" placeholder="New password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[#F9FAFB] outline-none transition focus:border-[#4ADE80]/35" />
                    <input type="password" placeholder="Confirm new password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[#F9FAFB] outline-none transition focus:border-[#4ADE80]/35" />
                  </div>
                  {feedback.password ? <StatusBanner tone={feedback.password.tone}>{feedback.password.message}</StatusBanner> : null}
                  <div className="flex flex-wrap gap-3">
                    <button type="button" onClick={handlePasswordSave} disabled={changePassword.isPending} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-[#F9FAFB] transition hover:bg-white/10 disabled:opacity-50">
                      <KeyRound className="h-4 w-4" />
                      {changePassword.isPending ? "Updating..." : "Update password"}
                    </button>
                    <button type="button" onClick={() => logout.mutate()} disabled={logout.isPending} className="inline-flex items-center gap-2 rounded-2xl border border-[#FF7355]/30 bg-[#FF7355]/10 px-5 py-3 text-sm font-medium text-[#FF7355] transition hover:bg-[#FF7355]/16 disabled:opacity-50">
                      <LogOut className="h-4 w-4" />
                      {logout.isPending ? "Signing out..." : "Sign out"}
                    </button>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-[#6B7280]">CSV columns</p>
                    <p className="mt-3 font-mono text-sm text-[#D6E0E8]">name, price, billingPeriod, category, startDate</p>
                    <p className="mt-2 text-sm text-[#94A3B8]">Use `DAILY`, `MONTHLY`, or `YEARLY` for billing period values.</p>
                  </div>
                  {feedback.import ? <StatusBanner tone={feedback.import.tone === "info" ? "info" : feedback.import.tone} title={feedback.import.title}>{feedback.import.message}</StatusBanner> : null}
                  {feedback.export ? <StatusBanner tone={feedback.export.tone}>{feedback.export.message}</StatusBanner> : null}
                  <div className="flex flex-wrap gap-3">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-[#F9FAFB] transition hover:bg-white/10">
                      <Upload className="h-4 w-4" />
                      Upload CSV
                      <input type="file" accept=".csv,text/csv" className="hidden" onChange={handleImportCsv} />
                    </label>
                    <button type="button" onClick={handleExportPdf} disabled={exportPDF.isPending} className="rounded-2xl border border-[#FF7355]/30 bg-[#FF7355]/10 px-5 py-3 text-sm font-medium text-[#FF7355] transition hover:bg-[#FF7355]/16 disabled:opacity-50">
                      {exportPDF.isPending ? "Exporting PDF..." : "Export PDF"}
                    </button>
                    <button type="button" onClick={handleExportCsv} className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-[#F9FAFB] transition hover:bg-white/10">
                      <Download className="mr-2 inline h-4 w-4" />
                      Export CSV
                    </button>
                  </div>
                </div>
              </Section>

              <Section title={t("Danger zone", { FR: "Zone sensible", RU: "Опасная зона", ES: "Zona de peligro", PT: "Zona de perigo" })} description={t("Irreversible actions stay at the bottom, away from everyday controls.", { FR: "Les actions irreversibles restent en bas.", RU: "Необратимые действия вынесены вниз.", ES: "Las acciones irreversibles quedan al final.", PT: "Acoes irreversiveis ficam no final." })} icon={Trash2} danger>
                <div className="space-y-4">
                  <StatusBanner tone="error" title="Permanent deletion">Deleting your account removes access, subscriptions, reminders, and stored profile data.</StatusBanner>
                  <button type="button" onClick={() => setShowDeleteConfirm((value) => !value)} className="rounded-2xl border border-[#F87171]/30 bg-[#F87171]/10 px-5 py-3 text-sm font-medium text-[#FCA5A5] transition hover:bg-[#F87171]/16">
                    {showDeleteConfirm ? "Hide confirmation" : "Delete account"}
                  </button>
                  {showDeleteConfirm ? (
                    <div className="rounded-2xl border border-[#F87171]/25 bg-black/20 p-4">
                      <p className="text-sm font-medium text-[#FDE2E2]">This action cannot be undone.</p>
                      <p className="mt-2 text-sm leading-relaxed text-[#D8B4B4]">If you continue, ControlMe will remove your account and associated data.</p>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <button type="button" onClick={handleDeleteAccount} disabled={deleteAccount.isPending} className="rounded-2xl bg-[#F87171] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#FB8B8B] disabled:opacity-50">
                          {deleteAccount.isPending ? "Deleting..." : "Yes, delete everything"}
                        </button>
                        <button type="button" onClick={() => setShowDeleteConfirm(false)} className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-[#D3DBE4] transition hover:bg-white/10">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </Section>
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
