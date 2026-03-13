"use client";

import React, { useMemo } from "react";
import {
  ArrowUpRight,
  ChartNoAxesCombined,
  CircleDollarSign,
  Layers3,
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Chart } from "@/components/ui/Chart";
import { DonutChart } from "@/components/ui/DonutChart";
import { EmptyState, Tag, useAppUi } from "@/components/ui";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { useMonthlyAnalytics, useSpendingHistory } from "@/hooks/use-analytics";
import { useMe } from "@/hooks/use-auth";
import { translate } from "@/lib/i18n";
import { getLocalizedCategoryName } from "@/lib/subscriptions/categories";
import { formatCurrency } from "@/lib/utils/format";
import type { Currency } from "@/shared/types";

const COLORS = [
  "#4ADE80",
  "#38BDF8",
  "#F97373",
  "#F59E0B",
  "#8B5CF6",
  "#EC4899",
  "#10B981",
  "#6366F1",
];

function StatCardSkeleton() {
  return (
    <div className="animate-pulse rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.88),rgba(6,11,22,0.94))] p-6">
      <div className="mb-4 h-3 w-24 rounded-full bg-white/10" />
      <div className="mb-3 h-9 w-32 rounded-full bg-white/10" />
      <div className="h-3 w-16 rounded-full bg-white/10" />
    </div>
  );
}

export default function AnalyticsPage() {
  const { language } = useAppUi();
  const t = (fallback: string, values?: Record<string, string>) =>
    translate(language, (values ?? {}) as Record<typeof language, string>, fallback);
  const monthlyQuery = useMonthlyAnalytics();
  const historyQuery = useSpendingHistory();
  const meQuery = useMe();

  const analytics = monthlyQuery.data?.data;
  const spendingHistory = useMemo(
    () => historyQuery.data?.data ?? [],
    [historyQuery.data],
  );
  const currency = (meQuery.data?.data?.currency ?? "USD") as Currency;
  const categoryBreakdown = useMemo(
    () => analytics?.categoryBreakdown ?? [],
    [analytics],
  );

  const categoryChartData = useMemo(
    () =>
      categoryBreakdown.map((item, index) => ({
        name: getLocalizedCategoryName(item.category, language),
        value: item.total,
        color: COLORS[index % COLORS.length],
      })),
    [categoryBreakdown, language],
  );

  const historyChartData = useMemo(
    () =>
      spendingHistory.map((item) => ({
        name: item.month,
        value: item.total,
      })),
    [spendingHistory],
  );

  const largestCategory = categoryBreakdown[0];
  const averagePerActive =
    analytics && analytics.activeSubscriptions > 0
      ? analytics.totalMonthlyCost / analytics.activeSubscriptions
      : 0;
  const categoryCount = categoryBreakdown.length;

  const isLoading = monthlyQuery.isLoading || historyQuery.isLoading;

  if (isLoading) {
    return (
      <ProtectedRoute>
        <AppShell>
          <div className="p-8 md:p-10 lg:p-12">
            <div className="max-w-7xl space-y-8">
              <SkeletonCard />
              <div className="grid gap-4 md:grid-cols-3">
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </div>
              <div className="grid gap-8 lg:grid-cols-2">
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
          <div className="mx-auto max-w-7xl space-y-8 animate-fade-in">
            <section className="rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(74,222,128,0.16),transparent_28%),linear-gradient(135deg,rgba(10,17,32,0.98),rgba(5,8,22,0.95))] p-7 md:p-8">
              <div className="grid gap-8 lg:grid-cols-[1.35fr_0.95fr]">
                <div className="space-y-4">
                  <Tag variant="success" size="md">
                    {t("Spending intelligence", { FR: "Intelligence depenses", RU: "Аналитика расходов", ES: "Inteligencia de gasto", PT: "Inteligencia de gastos" })}
                  </Tag>
                  <div className="space-y-3">
                    <h1 className="text-4xl font-semibold tracking-tight text-[#F9FAFB] md:text-5xl">
                      {t("Understand what is driving your recurring spend.", { FR: "Comprenez ce qui fait monter vos depenses recurrentes.", RU: "Поймите, что формирует ваши регулярные расходы.", ES: "Entiende que impulsa tus gastos recurrentes.", PT: "Entenda o que impulsiona seus gastos recorrentes." })}
                    </h1>
                    <p className="max-w-2xl text-base leading-relaxed text-[#A5B4C3] md:text-lg">
                      {t("Analytics should help you judge cost concentration, billing weight, and whether recurring spend is drifting upward.", { FR: "L'analyse doit aider a juger la concentration des couts et la derive des paiements recurrents.", RU: "Аналитика должна показывать концентрацию трат и рост регулярных платежей.", ES: "La analitica debe mostrar concentracion de costos y tendencia de gasto.", PT: "A analise deve mostrar concentracao de custos e tendencia de gasto." })}
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-[#6B7280]">
                      Monthly spend
                    </p>
                    <p className="mt-3 text-2xl font-semibold text-[#4ADE80]">
                      {formatCurrency(analytics?.totalMonthlyCost ?? 0, currency)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-[#6B7280]">
                      Yearly spend
                    </p>
                    <p className="mt-3 text-2xl font-semibold text-[#F9FAFB]">
                      {formatCurrency(analytics?.totalYearlyCost ?? 0, currency)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-[#6B7280]">
                      Active subscriptions
                    </p>
                    <p className="mt-3 text-2xl font-semibold text-[#7DD3FC]">
                      {analytics?.activeSubscriptions ?? 0}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-[#6B7280]">
                      Avg per active
                    </p>
                    <p className="mt-3 text-2xl font-semibold text-[#F9FAFB]">
                      {formatCurrency(averagePerActive, currency)}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {analytics?.activeSubscriptions ? (
              <div className="grid gap-4 md:grid-cols-3">
                <div className="analytics-surface rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.88),rgba(6,11,22,0.94))] p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-2.5 text-[#4ADE80]">
                      <CircleDollarSign className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#F9FAFB]">Largest category</p>
                      <p className="text-sm text-[#94A3B8]">The biggest share of monthly spend.</p>
                    </div>
                  </div>
                  <p className="text-2xl font-semibold text-[#F9FAFB]">
                    {largestCategory ? getLocalizedCategoryName(largestCategory.category, language) : t("No category data", { FR: "Pas de donnees", RU: "Нет данных", ES: "Sin datos", PT: "Sem dados" })}
                  </p>
                  <p className="mt-2 text-sm text-[#94A3B8]">
                    {largestCategory
                      ? `${formatCurrency(largestCategory.total, currency)} across ${largestCategory.count} subscriptions`
                      : "Add subscriptions to see category concentration."}
                  </p>
                </div>

                <div className="analytics-surface rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.88),rgba(6,11,22,0.94))] p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-2.5 text-[#7DD3FC]">
                      <ChartNoAxesCombined className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#F9FAFB]">Trend read</p>
                      <p className="text-sm text-[#94A3B8]">How spending behaves over time.</p>
                    </div>
                  </div>
                  <p className="text-2xl font-semibold text-[#F9FAFB]">
                    {historyChartData.length > 1 ? "Trend available" : "Early data"}
                  </p>
                  <p className="mt-2 text-sm text-[#94A3B8]">
                    {historyChartData.length > 1
                      ? "Use the history chart below to judge whether recurring costs are creeping upward."
                      : "More monthly history is needed before trends become meaningful."}
                  </p>
                </div>

                <div className="analytics-surface rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.88),rgba(6,11,22,0.94))] p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-2.5 text-[#F59E0B]">
                      <Layers3 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#F9FAFB]">Category spread</p>
                      <p className="text-sm text-[#94A3B8]">How diversified recurring spend is.</p>
                    </div>
                  </div>
                  <p className="text-2xl font-semibold text-[#F9FAFB]">{categoryCount}</p>
                  <p className="mt-2 text-sm text-[#94A3B8]">
                    {categoryCount > 0
                      ? `${categoryCount} active categories currently shape your monthly spend.`
                      : "Category spread will appear after your first subscriptions are added."}
                  </p>
                </div>
              </div>
            ) : null}

            <div className="grid items-start gap-8 lg:grid-cols-2">
              <Card hover={false} className="analytics-card overflow-hidden">
                <CardHeader>
                  <CardTitle>{t("Spending history", { FR: "Historique des depenses", RU: "История расходов", UK: "Історія витрат", GE: "Ausgabenverlauf", ES: "Historial de gasto", PT: "Historico de gastos", IT: "Storico spese", PL: "Historia wydatkow", TR: "Harcama gecmisi", UZ: "Xarajatlar tarixi" })}</CardTitle>
                  <CardDescription>{t("Monthly trend across the last recorded periods.", { FR: "Tendance mensuelle sur les dernieres periodes.", RU: "Месячный тренд за последние периоды.", UK: "Місячний тренд за останні періоди.", GE: "Monatlicher Trend uber die letzten Perioden.", ES: "Tendencia mensual en los ultimos periodos.", PT: "Tendencia mensal nos ultimos periodos.", IT: "Trend mensile degli ultimi periodi.", PL: "Miesieczny trend z ostatnich okresow.", TR: "Son donemlerdeki aylik egilim.", UZ: "Songgi davrlar boyicha oylik trend." })}</CardDescription>
                </CardHeader>
                <CardContent>
                  {historyChartData.length === 0 ? (
                    <EmptyState
                      title={t("Not enough history yet", { FR: "Pas assez d'historique", RU: "Пока мало истории", UK: "Поки мало історії", GE: "Noch nicht genug Verlauf", ES: "Aun no hay suficiente historial", PT: "Ainda nao ha historico suficiente", IT: "Storico ancora insufficiente", PL: "Za malo historii", TR: "Henuz yeterli gecmis yok", UZ: "Hali tarix yetarli emas" })}
                      description={t("As you keep subscriptions active over time, ControlMe will show whether recurring spend is drifting upward or staying stable.", { FR: "Avec le temps, ControlMe montrera si vos depenses montent ou restent stables.", RU: "Со временем ControlMe покажет, растут ли регулярные расходы или остаются стабильными.", UK: "З часом ControlMe покаже, чи зростають регулярні витрати, чи залишаються стабільними.", GE: "Mit der Zeit zeigt ControlMe, ob die wiederkehrenden Ausgaben steigen oder stabil bleiben.", ES: "Con el tiempo, ControlMe mostrara si el gasto recurrente sube o se mantiene estable.", PT: "Com o tempo, o ControlMe mostrara se o gasto recorrente sobe ou fica estavel.", IT: "Con il tempo ControlMe mostrera se la spesa ricorrente cresce o resta stabile.", PL: "Z czasem ControlMe pokaze, czy wydatki cykliczne rosna, czy pozostaja stabilne.", TR: "Zamanla ControlMe, yinelenen harcamanin artip artmadigini gosterecek.", UZ: "Vaqt o'tishi bilan ControlMe muntazam xarajatlar oshayotganini yoki barqarorligini ko'rsatadi." })}
                    />
                  ) : (
                    <Chart data={historyChartData} dataKey="value" type="area" color="#4ADE80" />
                  )}
                </CardContent>
              </Card>

              <Card hover={false} className="analytics-card overflow-hidden">
                <CardHeader>
                  <CardTitle>{t("Category mix", { FR: "Repartition par categorie", RU: "Структура категорий", UK: "Структура категорій", GE: "Kategorienmix", ES: "Mezcla por categoria", PT: "Distribuicao por categoria", IT: "Mix categorie", PL: "Struktura kategorii", TR: "Kategori dagilimi", UZ: "Kategoriyalar tarkibi" })}</CardTitle>
                  <CardDescription>{t("How your monthly spend is distributed by category.", { FR: "Comment vos depenses mensuelles se repartissent par categorie.", RU: "Как распределяются месячные расходы по категориям.", UK: "Як розподіляються місячні витрати за категоріями.", GE: "Wie sich Ihre monatlichen Ausgaben auf Kategorien verteilen.", ES: "Como se distribuye tu gasto mensual por categoria.", PT: "Como seu gasto mensal se distribui por categoria.", IT: "Come si distribuisce la spesa mensile per categoria.", PL: "Jak miesieczne wydatki rozkladaja sie na kategorie.", TR: "Aylik harcamanizin kategorilere gore dagilimi.", UZ: "Oylik xarajatlarning kategoriyalar boyicha taqsimoti." })}</CardDescription>
                </CardHeader>
                <CardContent>
                  {categoryChartData.length === 0 ? (
                    <EmptyState
                      title="No category data yet"
                      description="Add subscriptions first to see which groups dominate your recurring costs."
                    />
                  ) : (
                    <DonutChart
                      data={categoryChartData}
                      valueFormatter={(value) => formatCurrency(value, currency)}
                    />
                  )}
                </CardContent>
              </Card>
            </div>

            {categoryBreakdown.length > 0 ? (
                <section className="analytics-surface rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.88),rgba(6,11,22,0.94))] p-6">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-[#F9FAFB]">Category details</h2>
                    <p className="mt-1 text-sm text-[#94A3B8]">
                      The categories below are ordered by their monthly financial weight.
                    </p>
                  </div>
                  <Tag variant="info" size="md">
                    {categoryBreakdown.length} categories
                  </Tag>
                </div>

                <div className="space-y-3">
                  {categoryBreakdown.map((item, index) => (
                    <div
                      key={item.category}
                      className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <div>
                          <p className="font-medium text-[#F9FAFB]">
                            {getLocalizedCategoryName(item.category, language)}
                          </p>
                          <p className="text-sm text-[#94A3B8]">
                            {item.count} subscription{item.count === 1 ? "" : "s"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-[#94A3B8]">
                          {(analytics?.totalMonthlyCost ?? 0) > 0
                            ? `${((item.total / (analytics?.totalMonthlyCost ?? 1)) * 100).toFixed(0)}% of monthly spend`
                            : "0% of monthly spend"}
                        </span>
                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#4ADE80]">
                          {formatCurrency(item.total, currency)}
                          <ArrowUpRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
