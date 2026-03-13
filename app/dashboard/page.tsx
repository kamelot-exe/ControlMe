"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppShell } from "@/components/layout/AppShell";
import { ConnectionError } from "@/components/errors/ConnectionError";
import { OnboardingEmpty } from "@/components/ui/OnboardingEmpty";
import { ErrorState } from "@/components/ui/ErrorState";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { DonutChart } from "@/components/ui/DonutChart";
import { Chart } from "@/components/ui/Chart";
import { StatusBanner } from "@/components/ui/StatusBanner";
import { Tag } from "@/components/ui/Tag";
import { useAppUi } from "@/components/ui/AppUiProvider";
import { useSubscriptions } from "@/hooks/use-subscriptions";
import { useMonthlyAnalytics, useSpendingHistory } from "@/hooks/use-analytics";
import { useSmartAlerts } from "@/hooks/use-notifications";
import { useMe } from "@/hooks/use-auth";
import { useApiError } from "@/hooks/use-api-error";
import { translate } from "@/lib/i18n";
import { getLocalizedCategoryName } from "@/lib/subscriptions/categories";
import { buildSubscriptionIntelligence } from "@/lib/subscriptions/intelligence";
import { applyPausedState } from "@/lib/subscriptions/modules";
import { cn } from "@/lib/utils";
import {
  formatCurrency,
  formatDateShort,
  getDaysUntil,
  getUpcomingCharges,
} from "@/lib/utils/format";

const CHART_COLORS = [
  "#4ADE80",
  "#38BDF8",
  "#F59E0B",
  "#8B5CF6",
  "#F97373",
  "#10B981",
];

function getTrend(current?: number, previous?: number) {
  if (current == null || previous == null || previous === 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

export default function DashboardPage() {
  const [upcomingView, setUpcomingView] = useState<"timeline" | "list">("timeline");
  const { language, modules, pausedSubscriptions } = useAppUi();
  const t = (fallback: string, values?: Record<string, string>) =>
    translate(language, (values ?? {}) as Record<typeof language, string>, fallback);

  const subscriptionsQuery = useSubscriptions();
  const analyticsQuery = useMonthlyAnalytics();
  const alertsQuery = useSmartAlerts();
  const historyQuery = useSpendingHistory();
  const meQuery = useMe();

  const subscriptionsError = useApiError(subscriptionsQuery);
  const analyticsError = useApiError(analyticsQuery);

  const subscriptions = useMemo(
    () => applyPausedState(subscriptionsQuery.data?.data ?? [], modules, pausedSubscriptions),
    [modules, pausedSubscriptions, subscriptionsQuery.data],
  );
  const analytics = analyticsQuery.data?.data;
  const alerts = alertsQuery.data?.data?.alerts ?? [];
  const spendingHistory = historyQuery.data?.data ?? [];
  const user = meQuery.data?.data;
  const currency = user?.currency ?? "USD";
  const budgetLimit = user?.budgetLimit ?? null;

  const isLoading =
    subscriptionsQuery.isLoading ||
    analyticsQuery.isLoading ||
    historyQuery.isLoading;

  const hasConnectionError =
    subscriptionsError.isConnectionError || analyticsError.isConnectionError;

  const upcomingCharges = useMemo(
    () => getUpcomingCharges(subscriptions, 30),
    [subscriptions],
  );
  const renewalCalendarDays = useMemo(() => {
    const grouped = new Map<string, { count: number; total: number; dayLabel: string }>();

    getUpcomingCharges(subscriptions, 14).forEach((subscription) => {
      const date = new Date(subscription.nextChargeDate);
      const key = date.toISOString().slice(0, 10);
      const dayLabel = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const existing = grouped.get(key) ?? { count: 0, total: 0, dayLabel };
      grouped.set(key, {
        count: existing.count + 1,
        total: existing.total + subscription.price,
        dayLabel,
      });
    });

    return Array.from(grouped.entries()).map(([key, value]) => ({
      key,
      ...value,
    }));
  }, [subscriptions]);
  const intelligence = useMemo(
    () => buildSubscriptionIntelligence(subscriptions),
    [subscriptions],
  );
  const topCategory = analytics?.categoryBreakdown?.length
    ? [...analytics.categoryBreakdown].sort((a, b) => b.total - a.total)[0]
    : null;

  const chartData = spendingHistory.map((entry) => ({
    name: entry.month,
    value: entry.total,
  }));

  const categoryData =
    analytics?.categoryBreakdown.map((item, index) => ({
      name: item.category,
      displayName: getLocalizedCategoryName(item.category, language),
      value: item.total,
      color: CHART_COLORS[index % CHART_COLORS.length],
    })) ?? [];

  const currentMonth = spendingHistory[spendingHistory.length - 1]?.total;
  const previousMonth = spendingHistory[spendingHistory.length - 2]?.total;
  const monthlyTrend = getTrend(currentMonth, previousMonth);

  const budgetPercent =
    budgetLimit && analytics
      ? Math.min((analytics.totalMonthlyCost / budgetLimit) * 100, 100)
      : null;
  const budgetOverrun =
    budgetLimit && analytics && analytics.totalMonthlyCost > budgetLimit
      ? analytics.totalMonthlyCost - budgetLimit
      : 0;

  if (isLoading) {
    return (
      <ProtectedRoute>
        <AppShell>
          <div className="p-8 md:p-10 lg:p-12">
            <div className="max-w-7xl space-y-6">
              <div className="grid gap-5 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <SkeletonCard />
                </div>
                <div className="space-y-4">
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                <SkeletonCard />
                <SkeletonCard />
              </div>
              <SkeletonCard />
            </div>
          </div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  if (subscriptions.length === 0 && !subscriptionsQuery.isError) {
    return (
      <ProtectedRoute>
        <AppShell>
          <div className="p-8 md:p-10 lg:p-12">
            <div className="max-w-6xl space-y-6">
              <StatusBanner
                tone="info"
                title={t("Start with your first recurring cost", {
                  FR: "Commencez par votre premier cout recurrent",
                  RU: "Начните с первой регулярной траты",
                  UK: "Почнiть з першої регулярної витрати",
                  GE: "Beginnen Sie mit Ihrem ersten wiederkehrenden Betrag",
                  ES: "Empieza con tu primer gasto recurrente",
                  PT: "Comece com seu primeiro gasto recorrente",
                  IT: "Inizia con il tuo primo costo ricorrente",
                  PL: "Zacznij od pierwszego kosztu cyklicznego",
                  TR: "Ilk duzenli odemenizle baslayin",
                  UZ: "Birinchi muntazam tolovingizni qoshing",
                })}
              >
                {t(
                  "Add a few services first and the dashboard will turn into a real control center for renewals, timing, and recurring spend.",
                  {
                    FR: "Ajoutez quelques services et le tableau de bord deviendra un vrai centre de controle des renouvellements et depenses recurrentes.",
                    RU: "Добавьте несколько сервисов, и дашборд станет полноценным центром контроля продлений и регулярных расходов.",
                    ES: "Agrega algunos servicios y el panel se convertira en un centro de control de renovaciones y gastos recurrentes.",
                    PT: "Adicione alguns servicos e o painel se tornara um centro de controle de renovacoes e gastos recorrentes.",
                  },
                )}
              </StatusBanner>
              <OnboardingEmpty />
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
          <div className="max-w-7xl space-y-6 animate-fade-in">
            {hasConnectionError ? (
              <ConnectionError
                onRetry={() => {
                  subscriptionsQuery.refetch();
                  analyticsQuery.refetch();
                  historyQuery.refetch();
                  alertsQuery.refetch();
                }}
              />
            ) : null}

            {(subscriptionsQuery.isError || analyticsQuery.isError) && !hasConnectionError ? (
              <ErrorState
                title={t("Unable to load dashboard data", {
                  FR: "Impossible de charger le tableau de bord",
                  RU: "Не удалось загрузить дашборд",
                  GE: "Dashboard-Daten konnten nicht geladen werden",
                  ES: "No se pudo cargar el panel",
                  PT: "Nao foi possivel carregar o painel",
                })}
                message={
                  subscriptionsError.errorMessage ||
                  analyticsError.errorMessage ||
                  t("Please try again.", {
                    FR: "Veuillez reessayer.",
                    RU: "Попробуйте еще раз.",
                    GE: "Bitte versuchen Sie es erneut.",
                    ES: "Vuelve a intentarlo.",
                    PT: "Tente novamente.",
                  })
                }
                onRetry={() => {
                  subscriptionsQuery.refetch();
                  analyticsQuery.refetch();
                }}
              />
            ) : null}

            <section className="grid gap-5 lg:grid-cols-3">
              <div className="glass-hover rounded-3xl p-7 lg:col-span-2">
                <p className="mb-3 text-xs uppercase tracking-widest text-[#9CA3AF]">
                  {t("Monthly total", {
                    FR: "Total mensuel",
                    RU: "Итого в месяц",
                    GE: "Monatssumme",
                    ES: "Total mensual",
                    PT: "Total mensal",
                    IT: "Totale mensile",
                    PL: "Suma miesieczna",
                    TR: "Aylik toplam",
                    UZ: "Oylik jami",
                  })}
                </p>
                <h1 className="mb-4 text-4xl font-semibold leading-none tracking-tight text-[#F9FAFB] md:text-5xl">
                  {analytics ? formatCurrency(analytics.totalMonthlyCost, currency) : "-"}
                </h1>
                <p className="text-sm text-[#9CA3AF]">
                  {t("Yearly:", {
                    FR: "Annuel :",
                    RU: "В год:",
                    GE: "Jaehrlich:",
                    ES: "Anual:",
                    PT: "Anual:",
                    IT: "Annuale:",
                    PL: "Rocznie:",
                    TR: "Yillik:",
                    UZ: "Yillik:",
                  })}{" "}
                  <span className="font-medium text-[#F9FAFB]">
                    {analytics ? formatCurrency(analytics.totalYearlyCost, currency) : "-"}
                  </span>
                </p>

                {budgetLimit && analytics ? (
                  <div className="mt-5">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-[#9CA3AF]">
                        {t("Budget", {
                          FR: "Budget",
                          RU: "Бюджет",
                          GE: "Budget",
                          ES: "Presupuesto",
                          PT: "Orcamento",
                          IT: "Budget",
                          PL: "Budzet",
                          TR: "Butce",
                          UZ: "Budjet",
                        })}
                      </span>
                      <span
                        className={cn(
                          "font-medium",
                          budgetPercent && budgetPercent >= 100
                            ? "text-[#F87171]"
                            : budgetPercent && budgetPercent >= 80
                              ? "text-[#F59E0B]"
                              : "text-[#4ADE80]",
                        )}
                      >
                        {formatCurrency(analytics.totalMonthlyCost, currency)} / {formatCurrency(budgetLimit, currency)}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-700",
                          budgetPercent && budgetPercent >= 100
                            ? "bg-[#F87171]"
                            : budgetPercent && budgetPercent >= 80
                              ? "bg-[#F59E0B]"
                              : "bg-[#4ADE80]",
                        )}
                        style={{ width: `${budgetPercent ?? 0}%` }}
                      />
                    </div>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
                      <span
                        className={cn(
                          "font-medium",
                          budgetOverrun > 0
                            ? "text-[#F87171]"
                            : "text-[#4ADE80]",
                        )}
                      >
                        {budgetOverrun > 0
                          ? t("Over budget by", {
                              FR: "Depassement de",
                              RU: "Превышение на",
                              UK: "Перевищення на",
                              GE: "Uber Budget um",
                              ES: "Por encima por",
                              PT: "Acima em",
                              IT: "Oltre il budget di",
                              PL: "Przekroczenie o",
                              TR: "Butce asimi",
                              UZ: "Budjetdan oshish",
                            })
                          : t("Within budget", {
                              FR: "Dans le budget",
                              RU: "В пределах бюджета",
                              UK: "У межах бюджету",
                              GE: "Im Budget",
                              ES: "Dentro del presupuesto",
                              PT: "Dentro do orcamento",
                              IT: "Dentro il budget",
                              PL: "W budzecie",
                              TR: "Butce icinde",
                              UZ: "Budjet ichida",
                            })}
                      </span>
                      <span className="font-semibold text-[#F9FAFB]">
                        {budgetOverrun > 0
                          ? formatCurrency(budgetOverrun, currency)
                          : `${Math.round(budgetPercent ?? 0)}%`}
                      </span>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="space-y-4">
                <div className="glass-hover rounded-3xl p-5">
                  <p className="mb-2 text-xs uppercase tracking-widest text-[#9CA3AF]">
                    {t("Active subscriptions", {
                      FR: "Abonnements actifs",
                      RU: "Активные подписки",
                      GE: "Aktive Abos",
                      ES: "Suscripciones activas",
                      PT: "Assinaturas ativas",
                      IT: "Abbonamenti attivi",
                      PL: "Aktywne subskrypcje",
                      TR: "Aktif abonelikler",
                      UZ: "Faol obunalar",
                    })}
                  </p>
                  <p className="text-3xl font-semibold tracking-tight text-[#38BDF8]">
                    {analytics?.activeSubscriptions ?? subscriptions.length}
                  </p>
                </div>
                <div className="glass-hover rounded-3xl p-5">
                  <p className="mb-2 text-xs uppercase tracking-widest text-[#9CA3AF]">
                    {t("This month", {
                      FR: "Ce mois-ci",
                      RU: "Этот месяц",
                      GE: "Dieser Monat",
                      ES: "Este mes",
                      PT: "Este mes",
                      IT: "Questo mese",
                      PL: "Ten miesiac",
                      TR: "Bu ay",
                      UZ: "Bu oy",
                    })}
                  </p>
                  <p
                    className={cn(
                      "text-3xl font-semibold tracking-tight",
                      monthlyTrend == null
                        ? "text-[#F9FAFB]"
                        : monthlyTrend > 0
                          ? "text-[#F59E0B]"
                          : monthlyTrend < 0
                            ? "text-[#4ADE80]"
                            : "text-[#FF7355]",
                    )}
                  >
                    {monthlyTrend == null ? "-" : `${monthlyTrend > 0 ? "+" : ""}${monthlyTrend}%`}
                  </p>
                  <p className="mt-2 text-sm text-[#9CA3AF]">
                    {t("30-day total", {
                      FR: "Total sur 30 jours",
                      RU: "Итого за 30 дней",
                      GE: "30-Tage-Summe",
                      ES: "Total de 30 dias",
                      PT: "Total de 30 dias",
                    })}:{" "}
                    <span className="font-medium text-[#F9FAFB]">
                      {formatCurrency(intelligence.next30DaysTotal, currency)}
                    </span>
                  </p>
                </div>
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  label: t("Active subscriptions", { FR: "Abonnements actifs", RU: "Активные подписки", ES: "Suscripciones activas", PT: "Assinaturas ativas" }),
                  value: String(analytics?.activeSubscriptions ?? subscriptions.length),
                  tone: "text-[#F9FAFB]",
                  detail: t("Currently billing or available", { FR: "Actifs ou disponibles", RU: "Активны или доступны", ES: "Activas o disponibles", PT: "Ativas ou disponiveis" }),
                },
                {
                  label: t("Urgent renewals", { FR: "Renouvellements urgents", RU: "Срочные продления", ES: "Renovaciones urgentes", PT: "Renovacoes urgentes" }),
                  value: String(intelligence.next7DaysCount),
                  tone: intelligence.next7DaysCount > 0 ? "text-[#F59E0B]" : "text-[#F9FAFB]",
                  detail: t("Due within the next 7 days", { FR: "Dus dans les 7 prochains jours", RU: "Списание в ближайшие 7 дней", ES: "Vence en los proximos 7 dias", PT: "Vence nos proximos 7 dias" }),
                },
                {
                  label: t("Next 30-day total", { FR: "Total 30 jours", RU: "Итого за 30 дней", ES: "Total de 30 dias", PT: "Total de 30 dias" }),
                  value: formatCurrency(intelligence.next30DaysTotal, currency),
                  tone: "text-[#F9FAFB]",
                  detail: t("Projected total of scheduled charges in the next 30 days", { FR: "Montant prevu des paiements a venir", RU: "Прогноз по запланированным списаниям на 30 дней", ES: "Total previsto de cobros programados en 30 dias", PT: "Total previsto de cobrancas programadas em 30 dias" }),
                },
                {
                  label: t("Category leader", { FR: "Categorie principale", RU: "Главная категория", ES: "Categoria principal", PT: "Categoria principal" }),
                  value: topCategory ? getLocalizedCategoryName(topCategory.category, language) : "-",
                  tone: "text-[#38BDF8]",
                  detail: topCategory
                    ? `${formatCurrency(topCategory.total, currency)} / ${t("month", { FR: "mois", RU: "месяц", ES: "mes", PT: "mes" })}`
                    : t("Waiting for enough data", { FR: "En attente de donnees", RU: "Недостаточно данных", ES: "Esperando mas datos", PT: "Aguardando mais dados" }),
                },
              ].map((item) => (
                <div key={item.label} className="glass-hover rounded-3xl p-5">
                  <p className="mb-2 text-xs uppercase tracking-[0.2em] text-[#9CA3AF]">
                    {item.label}
                  </p>
                  <p className={cn("mb-2 text-3xl font-semibold tracking-tight", item.tone)}>
                    {item.value}
                  </p>
                  <p className="text-sm text-[#9CA3AF]">{item.detail}</p>
                </div>
              ))}
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
              <div className="glass-hover rounded-3xl p-6">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-[#F9FAFB]">
                      {t("Savings intelligence", {
                        FR: "Intelligence d'economies",
                        RU: "Потенциал экономии",
                        ES: "Inteligencia de ahorro",
                        PT: "Inteligencia de economia",
                      })}
                    </h2>
                    <p className="text-sm text-[#9CA3AF]">
                      {t("Conservative savings signals based on low-need subscriptions and overlapping services.", {
                        FR: "Signaux prudents bases sur les abonnements a faible valeur et les chevauchements.",
                        RU: "Консервативные сигналы экономии на малополезных и пересекающихся подписках.",
                        ES: "Senales conservadoras basadas en baja utilidad y servicios superpuestos.",
                        PT: "Sinais conservadores com base em baixa utilidade e servicos sobrepostos.",
                      })}
                    </p>
                  </div>
                  <Tag variant="warning" size="md">
                    {intelligence.cancelCandidatesCount}{" "}
                    {t("cancel candidates", {
                      FR: "candidats a couper",
                      RU: "кандидатов на отмену",
                      ES: "candidatas a cancelar",
                      PT: "candidatas ao corte",
                    })}
                  </Tag>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#6B7280]">
                      {t("Possible savings this month", {
                        FR: "Economies possibles ce mois",
                        RU: "Возможная экономия в месяц",
                        ES: "Ahorro posible este mes",
                        PT: "Economia possivel neste mes",
                      })}
                    </p>
                    <p className="mt-3 text-2xl font-semibold text-[#4ADE80]">
                      {formatCurrency(intelligence.possibleSavingsMonthly, currency)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#6B7280]">
                      {t("Possible savings this year", {
                        FR: "Economies possibles cette annee",
                        RU: "Возможная экономия в год",
                        ES: "Ahorro posible este ano",
                        PT: "Economia possivel neste ano",
                      })}
                    </p>
                    <p className="mt-3 text-2xl font-semibold text-[#F9FAFB]">
                      {formatCurrency(intelligence.possibleSavingsYearly, currency)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#6B7280]">
                      {t("Overlap exposure", {
                        FR: "Chevauchement",
                        RU: "Перекрывающиеся сервисы",
                        ES: "Solapamiento",
                        PT: "Sobreposicao",
                      })}
                    </p>
                    <p className="mt-3 text-2xl font-semibold text-[#FF7355]">
                      {formatCurrency(intelligence.overlapMonthlyExposure, currency)}
                    </p>
                    <p className="mt-2 text-sm text-[#9CA3AF]">
                      {intelligence.overlapGroupsCount}{" "}
                      {t("overlapping groups", {
                        FR: "groupes qui se chevauchent",
                        RU: "перекрывающихся групп",
                        ES: "grupos superpuestos",
                        PT: "grupos sobrepostos",
                      })}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#6B7280]">
                      {t("Highest cost subscription", {
                        FR: "Abonnement le plus couteux",
                        RU: "Самая дорогая подписка",
                        ES: "Suscripcion mas costosa",
                        PT: "Assinatura mais cara",
                      })}
                    </p>
                    <p className="mt-3 truncate text-xl font-semibold text-[#7DD3FC]">
                      {intelligence.highestCostSubscription?.name ?? "-"}
                    </p>
                    <p className="mt-2 text-sm text-[#9CA3AF]">
                      {intelligence.highestCostSubscription
                        ? formatCurrency(intelligence.highestCostMonthlyEquivalent, currency)
                        : t("Waiting for enough data", {
                            FR: "En attente de donnees",
                            RU: "Ожидание данных",
                            ES: "Esperando datos",
                            PT: "Aguardando dados",
                          })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="glass-hover rounded-3xl p-6">
                <h2 className="text-xl font-semibold text-[#F9FAFB]">
                  {t("Renewal pressure", {
                    FR: "Pression de renouvellement",
                    RU: "Нагрузка ближайших списаний",
                    ES: "Presion de renovaciones",
                    PT: "Pressao de renovacoes",
                  })}
                </h2>
                <p className="mt-1 text-sm text-[#9CA3AF]">
                  {t("Use the next 7 and 30 days to judge how much billing pressure is building.", {
                    FR: "Utilisez les 7 et 30 prochains jours pour juger la pression de paiement a venir.",
                    RU: "Смотрите на ближайшие 7 и 30 дней, чтобы заранее понять платёжную нагрузку.",
                    ES: "Usa los proximos 7 y 30 dias para medir la presion de cobros.",
                    PT: "Use os proximos 7 e 30 dias para medir a pressao de cobranca.",
                  })}
                </p>

                <div className="mt-6 space-y-4">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm text-[#9CA3AF]">
                        {t("Due in the next 7 days", {
                          FR: "Dus dans 7 jours",
                          RU: "К оплате за 7 дней",
                          ES: "Vence en 7 dias",
                          PT: "Vence em 7 dias",
                        })}
                      </span>
                      <span className="text-sm font-semibold text-[#F59E0B]">
                        {intelligence.next7DaysCount}
                      </span>
                    </div>
                    <p className="mt-3 text-2xl font-semibold text-[#F9FAFB]">
                      {formatCurrency(intelligence.next7DaysTotal, currency)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm text-[#9CA3AF]">
                        {t("Due in the next 30 days", {
                          FR: "Dus dans 30 jours",
                          RU: "К оплате за 30 дней",
                          ES: "Vence en 30 dias",
                          PT: "Vence em 30 dias",
                        })}
                      </span>
                      <span className="text-sm font-semibold text-[#38BDF8]">
                        {intelligence.next30DaysCount}
                      </span>
                    </div>
                    <p className="mt-3 text-2xl font-semibold text-[#F9FAFB]">
                      {formatCurrency(intelligence.next30DaysTotal, currency)}
                    </p>
                  </div>
                  {intelligence.topCategory ? (
                    <StatusBanner tone="info" title={t("Biggest spending cluster", {
                      FR: "Groupe principal",
                      RU: "Главный кластер трат",
                      ES: "Grupo principal",
                      PT: "Grupo principal",
                    })}>
                      {getLocalizedCategoryName(intelligence.topCategory.name, language)}{" "}
                      {t("currently represents", {
                        FR: "represente actuellement",
                        RU: "сейчас составляет",
                        ES: "representa actualmente",
                        PT: "representa atualmente",
                      })}{" "}
                      {Math.round(intelligence.topCategory.share * 100)}%{" "}
                      {t("of monthly spend.", {
                        FR: "des depenses mensuelles.",
                        RU: "месячных расходов.",
                        ES: "del gasto mensual.",
                        PT: "do gasto mensal.",
                      })}
                    </StatusBanner>
                  ) : null}
                </div>
              </div>
            </section>

            {modules.renewalCalendar ? (
              <section className="glass-hover rounded-3xl p-6">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-[#F9FAFB]">Renewal calendar</h2>
                    <p className="text-sm text-[#9CA3AF]">
                      Compact day-by-day view of the next 14 days of renewals.
                    </p>
                  </div>
                  <Tag variant="info" size="md">
                    {renewalCalendarDays.length} active days
                  </Tag>
                </div>

                {renewalCalendarDays.length === 0 ? (
                  <StatusBanner tone="neutral" title="No renewals in the next 14 days">
                    Your near-term renewal calendar is currently clear.
                  </StatusBanner>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {renewalCalendarDays.map((day) => (
                      <div
                        key={day.key}
                        className="rounded-2xl border border-white/10 bg-white/5 p-4"
                      >
                        <p className="text-xs uppercase tracking-[0.2em] text-[#6B7280]">
                          {day.dayLabel}
                        </p>
                        <p className="mt-3 text-2xl font-semibold text-[#F9FAFB]">
                          {day.count}
                        </p>
                        <p className="mt-2 text-sm text-[#94A3B8]">
                          {formatCurrency(day.total, currency)} due
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            ) : null}

            <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="glass-hover rounded-3xl p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-[#F9FAFB]">
                      {t("Upcoming charges", { FR: "Paiements a venir", RU: "Предстоящие списания", ES: "Cobros впереди", PT: "Cobrancas futuras" })}
                    </h2>
                    <p className="text-sm text-[#9CA3AF]">
                      {t("Switch between the classic list and the compact timeline", {
                        FR: "Basculez entre la liste classique et la chronologie compacte",
                        RU: "Переключайтесь между классическим списком и компактной шкалой",
                        ES: "Alterna entre la lista clasica y la linea temporal compacta",
                        PT: "Alterne entre a lista classica e a linha do tempo compacta",
                      })}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <Tag variant="warning" size="sm">
                      {intelligence.next7DaysCount}{" "}
                      {t("in 7 days", {
                        FR: "sur 7 jours",
                        RU: "за 7 дней",
                        ES: "en 7 dias",
                        PT: "em 7 dias",
                      })}
                    </Tag>
                    <Tag variant="info" size="sm">
                      {formatCurrency(intelligence.next30DaysTotal, currency)}
                    </Tag>
                    <div className="flex rounded-2xl border border-white/10 bg-white/5 p-1">
                      <button
                        type="button"
                        onClick={() => setUpcomingView("list")}
                        className={cn(
                          "rounded-xl px-3 py-2 text-xs font-medium uppercase tracking-[0.18em] transition",
                          upcomingView === "list"
                            ? "bg-[#4ADE80] text-[#05111A]"
                            : "text-[#9CA3AF] hover:text-[#F9FAFB]",
                        )}
                      >
                        Classic
                      </button>
                      <button
                        type="button"
                        onClick={() => setUpcomingView("timeline")}
                        className={cn(
                          "rounded-xl px-3 py-2 text-xs font-medium uppercase tracking-[0.18em] transition",
                          upcomingView === "timeline"
                            ? "bg-[#4ADE80] text-[#05111A]"
                            : "text-[#9CA3AF] hover:text-[#F9FAFB]",
                        )}
                      >
                        Compact
                      </button>
                    </div>
                    <Link
                      href="/subscriptions"
                      className="whitespace-nowrap text-sm text-[#38BDF8] transition-colors hover:text-[#7DD3FC]"
                    >
                      {t("Manage list", { FR: "Voir la liste", RU: "К списку", ES: "Gestionar lista", PT: "Gerenciar lista" })}
                    </Link>
                  </div>
                </div>

                {upcomingCharges.length === 0 ? (
                  <StatusBanner tone="neutral" title={t("Nothing scheduled", { FR: "Aucun paiement prevu", RU: "Ничего не запланировано", ES: "Nada programado", PT: "Nada agendado" })}>
                    {t("No active subscriptions are due in the next 30 days.", { FR: "Aucun abonnement actif n'est du dans les 30 prochains jours.", RU: "В ближайшие 30 дней активных списаний нет.", ES: "No hay suscripciones activas para los proximos 30 dias.", PT: "Nenhuma assinatura ativa vence nos proximos 30 dias." })}
                  </StatusBanner>
                ) : upcomingView === "list" ? (
                  <div className="space-y-3">
                    {upcomingCharges.slice(0, 7).map((subscription) => {
                      const daysUntil = getDaysUntil(subscription.nextChargeDate);

                      return (
                        <Link
                          key={subscription.id}
                          href={`/subscriptions/${subscription.id}`}
                          className="glass-light grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-2xl p-4 md:p-5 transition-colors hover:bg-white/8"
                        >
                          <div className="min-w-0 space-y-1">
                            <p className="break-words text-sm font-medium leading-5 text-[#F9FAFB] md:text-[0.95rem]">
                              {subscription.name}
                            </p>
                            <p className="text-sm text-[#9CA3AF]">
                              {formatDateShort(subscription.nextChargeDate)}
                            </p>
                          </div>
                          <div className="flex min-w-[108px] flex-col items-end gap-2 text-right">
                            <p className="text-sm font-semibold text-[#F9FAFB] md:text-[0.95rem]">
                              {formatCurrency(subscription.price, currency)}
                            </p>
                            <Tag
                              variant={daysUntil <= 2 ? "error" : daysUntil <= 7 ? "warning" : "info"}
                              size="sm"
                            >
                              {daysUntil <= 0 ? "Today" : daysUntil === 1 ? "Tomorrow" : `${daysUntil} days`}
                            </Tag>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {upcomingCharges.slice(0, 7).map((subscription, index) => {
                      const daysUntil = getDaysUntil(subscription.nextChargeDate);
                      const dotColor =
                        daysUntil <= 2 ? "#F87171" : daysUntil <= 7 ? "#F59E0B" : "#4ADE80";
                      const isLast = index === Math.min(upcomingCharges.length, 7) - 1;

                      return (
                        <Link
                          key={subscription.id}
                          href={`/subscriptions/${subscription.id}`}
                          className="group grid grid-cols-[20px_minmax(0,1fr)_auto] items-start gap-4 rounded-2xl p-4 md:p-5 transition-all duration-[120ms] hover:bg-white/5"
                        >
                          <div className="flex w-5 flex-shrink-0 flex-col items-center self-stretch">
                            <div
                              className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                              style={{ background: dotColor, boxShadow: `0 0 8px ${dotColor}60` }}
                            />
                            {!isLast ? (
                              <div className="mt-1 w-px flex-1 bg-white/10" style={{ minHeight: "28px" }} />
                            ) : null}
                          </div>

                          <div className="min-w-0">
                            <p className="break-words text-sm font-medium leading-5 text-[#F9FAFB] transition-colors group-hover:text-white md:text-[0.95rem]">
                              {subscription.name}
                            </p>
                            <p className="text-xs text-[#9CA3AF]">
                              {formatDateShort(subscription.nextChargeDate)}
                            </p>
                          </div>

                          <div className="flex min-w-[112px] flex-col items-end gap-2">
                            {daysUntil <= 7 ? (
                              <Tag variant={daysUntil <= 2 ? "error" : "warning"} size="sm">
                                {daysUntil === 0 ? "Today" : daysUntil === 1 ? "Tomorrow" : `${daysUntil}d`}
                              </Tag>
                            ) : null}
                            <span className="text-sm font-semibold text-[#F9FAFB]">
                              {formatCurrency(subscription.price, currency)}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="grid gap-6">
                <div className="glass-hover rounded-3xl p-6">
                  <h2 className="mb-1 text-xl font-semibold text-[#F9FAFB]">
                    {t("Category concentration", { FR: "Concentration par categorie", RU: "Концентрация по категориям", ES: "Concentracion por categoria", PT: "Concentracao por categoria" })}
                  </h2>
                  <p className="mb-5 text-sm text-[#9CA3AF]">
                    {t("Where your monthly recurring budget is concentrated", { FR: "Ou se concentre votre budget recurrent", RU: "Где сосредоточен ежемесячный бюджет", ES: "Donde se concentra tu presupuesto mensual", PT: "Onde seu orcamento mensal esta concentrado" })}
                  </p>
                  {categoryData.length > 0 ? (
                    <DonutChart data={categoryData.map((item) => ({ ...item, name: item.displayName }))} />
                  ) : (
                    <StatusBanner tone="neutral" title={t("No category data yet", { FR: "Pas encore de donnees", RU: "Пока нет данных", ES: "Aun no hay datos", PT: "Ainda nao ha dados" })}>
                      {t("Add subscriptions with categories to understand where spending clusters.", { FR: "Ajoutez des abonnements avec categorie pour voir la repartition.", RU: "Добавьте подписки с категориями, чтобы видеть структуру расходов.", ES: "Agrega suscripciones con categoria para ver la distribucion.", PT: "Adicione assinaturas com categoria para ver a distribuicao." })}
                    </StatusBanner>
                  )}
                </div>

                <div className="glass-hover rounded-3xl p-6">
                  <h2 className="mb-1 text-xl font-semibold text-[#F9FAFB]">
                    {t("Smart signals", { FR: "Signaux utiles", RU: "Полезные сигналы", ES: "Senales utiles", PT: "Sinais uteis" })}
                  </h2>
                  <p className="mb-5 text-sm text-[#9CA3AF]">
                    {t("Useful billing events and anomalies detected from current data", { FR: "Evenements et anomalies detectes dans vos paiements", RU: "Важные события и аномалии в текущих платежах", ES: "Eventos y anomalias detectadas en tus pagos", PT: "Eventos e anomalias detectados nos pagamentos" })}
                  </p>
                  {alerts.length > 0 ? (
                    <div className="space-y-3">
                      {alerts.slice(0, 4).map((alert, index) => (
                        <StatusBanner
                          key={`${alert.type}-${index}`}
                          tone={alert.type === "PRECHARGE" ? "info" : "neutral"}
                          title={alert.type === "PRECHARGE"
                            ? t("Upcoming charge", { FR: "Paiement a venir", RU: "Скорое списание", ES: "Cobro proximo", PT: "Cobranca futura" })
                            : t("Billing insight", { FR: "Analyse", RU: "Инсайт", ES: "Insight", PT: "Insight" })}
                        >
                          {alert.message}
                        </StatusBanner>
                      ))}
                    </div>
                  ) : (
                    <StatusBanner tone="success" title={t("No urgent anomalies", { FR: "Aucune anomalie urgente", RU: "Срочных аномалий нет", ES: "No hay anomalias urgentes", PT: "Nao ha anomalias urgentes" })}>
                      {t("Nothing looks unusually risky right now. Your recurring spend appears stable.", { FR: "Rien ne semble anormalement risqué pour le moment.", RU: "Сейчас ничего необычно рискованного не видно.", ES: "Nada parece inusualmente riesgoso por ahora.", PT: "Nada parece incomumente arriscado agora." })}
                    </StatusBanner>
                  )}
                </div>
              </div>
            </section>

            <section className="glass-hover rounded-3xl p-6">
              <h2 className="mb-1 text-xl font-semibold text-[#F9FAFB]">
                {t("Spending trend", { FR: "Tendance des depenses", RU: "Тренд расходов", ES: "Tendencia de gasto", PT: "Tendencia de gastos" })}
              </h2>
              <p className="mb-5 text-sm text-[#9CA3AF]">
                {t("Six-month view of recurring expense movement", { FR: "Vue sur six mois de l'evolution des depenses recurrentes", RU: "Динамика регулярных расходов за шесть месяцев", ES: "Vista de seis meses del movimiento de gastos", PT: "Visao de seis meses da evolucao dos gastos recorrentes" })}
              </p>
              {chartData.length > 0 ? (
                <Chart data={chartData} dataKey="value" type="area" color="#4ADE80" />
              ) : (
                <StatusBanner tone="neutral" title={t("Waiting for trend data", { FR: "En attente de donnees", RU: "Ожидание данных", ES: "Esperando datos", PT: "Aguardando dados" })}>
                  {t("A few subscriptions are enough to start building a useful monthly history.", { FR: "Quelques abonnements suffisent pour commencer l'historique mensuel.", RU: "Нескольких подписок достаточно, чтобы построить историю расходов.", ES: "Unas pocas suscripciones bastan para iniciar el historial.", PT: "Algumas assinaturas ja bastam para iniciar o historico." })}
                </StatusBanner>
              )}
            </section>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
