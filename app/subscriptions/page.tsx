"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search, SlidersHorizontal } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ConnectionError } from "@/components/errors/ConnectionError";
import { AppShell } from "@/components/layout/AppShell";
import { SubscriptionCard } from "@/components/subscriptions/SubscriptionCard";
import { SubscriptionDrawer } from "@/components/subscriptions/SubscriptionDrawer";
import { ErrorState, EmptyState, StatusBanner, Tag } from "@/components/ui";
import { useAppUi } from "@/components/ui/AppUiProvider";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { useMe } from "@/hooks/use-auth";
import { useSubscriptions } from "@/hooks/use-subscriptions";
import { useApiError } from "@/hooks/use-api-error";
import {
  formatBillingPeriod,
  formatCurrency,
  getDaysUntil,
  toMonthlyEquivalent,
} from "@/lib/utils/format";
import { translate } from "@/lib/i18n";
import type { Subscription } from "@/shared/types";

export default function SubscriptionsPage() {
  const { language } = useAppUi();
  const t = (fallback: string, values?: Record<string, string>) =>
    translate(language, (values ?? {}) as Record<typeof language, string>, fallback);
  const subscriptionsQuery = useSubscriptions();
  const meQuery = useMe();
  const apiError = useApiError(subscriptionsQuery);

  const [searchQuery, setSearchQuery] = useState("");
  const [groupFilter, setGroupFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [billingFilter, setBillingFilter] = useState<"all" | "DAILY" | "MONTHLY" | "YEARLY">("all");
  const [editSubscription, setEditSubscription] = useState<Subscription | null>(null);

  const subscriptions = useMemo(
    () => subscriptionsQuery.data?.data ?? [],
    [subscriptionsQuery.data]
  );

  const currency = meQuery.data?.data?.currency ?? "USD";

  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((subscription) => {
      if (
        searchQuery &&
        !subscription.name.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      if (groupFilter && (subscription.serviceGroup ?? "") !== groupFilter) {
        return false;
      }
      if (statusFilter === "active" && !subscription.isActive) {
        return false;
      }
      if (statusFilter === "inactive" && subscription.isActive) {
        return false;
      }
      if (billingFilter !== "all" && subscription.billingPeriod !== billingFilter) {
        return false;
      }
      return true;
    });
  }, [billingFilter, groupFilter, searchQuery, statusFilter, subscriptions]);

  const groupOptions = useMemo(
    () =>
      [...new Set(subscriptions.map((subscription) => subscription.serviceGroup).filter(Boolean))]
        .sort() as string[],
    [subscriptions]
  );

  const totalMonthly = useMemo(() => {
    return filteredSubscriptions.reduce((sum, subscription) => {
      const monthlyEquivalent =
        toMonthlyEquivalent(subscription.price, subscription.billingPeriod);
      return sum + monthlyEquivalent;
    }, 0);
  }, [filteredSubscriptions]);

  const activeCount = useMemo(
    () => subscriptions.filter((subscription) => subscription.isActive).length,
    [subscriptions]
  );
  const inactiveCount = useMemo(
    () => subscriptions.filter((subscription) => !subscription.isActive).length,
    [subscriptions]
  );

  const upcomingCount = useMemo(
    () =>
      subscriptions.filter((subscription) => {
        const days = getDaysUntil(subscription.nextChargeDate);
        return subscription.isActive && days >= 0 && days <= 7;
      }).length,
    [subscriptions]
  );

  const mostExpensive = useMemo(() => {
    return [...subscriptions].sort((a, b) => {
      const bMonthly = toMonthlyEquivalent(b.price, b.billingPeriod);
      const aMonthly = toMonthlyEquivalent(a.price, a.billingPeriod);
      return bMonthly - aMonthly;
    })[0];
  }, [subscriptions]);

  if (subscriptionsQuery.isLoading) {
    return (
      <ProtectedRoute>
        <AppShell>
          <div className="p-8 md:p-10 lg:p-12">
            <div className="max-w-7xl space-y-8">
              <SkeletonCard />
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-2">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
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
            {apiError.isConnectionError ? (
              <ConnectionError onRetry={() => subscriptionsQuery.refetch()} />
            ) : null}

            {subscriptionsQuery.isError && !apiError.isConnectionError ? (
                <ErrorState
                title={t("Unable to load subscriptions", {
                  FR: "Impossible de charger les abonnements",
                  RU: "Не удалось загрузить подписки",
                  ES: "No se pudieron cargar las suscripciones",
                  PT: "Nao foi possivel carregar as assinaturas",
                })}
                message={apiError.errorMessage || t("Please try again in a moment.", {
                  FR: "Veuillez reessayer dans un instant.",
                  RU: "Попробуйте еще раз через минуту.",
                  ES: "Vuelve a intentarlo en un momento.",
                  PT: "Tente novamente em instantes.",
                })}
                onRetry={() => subscriptionsQuery.refetch()}
              />
            ) : null}

            <section className="rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(255,115,85,0.18),transparent_28%),linear-gradient(135deg,rgba(10,17,32,0.98),rgba(5,8,22,0.95))] p-7 md:p-8">
              <div className="grid gap-8 lg:grid-cols-[1.35fr_0.95fr]">
                <div className="space-y-4">
                  <Tag variant="success" size="md">
                    {t("Subscription control", {
                      FR: "Controle des abonnements",
                      RU: "Контроль подписок",
                      ES: "Control de suscripciones",
                      PT: "Controle de assinaturas",
                    })}
                  </Tag>
                  <div className="space-y-3">
                    <h1 className="text-4xl font-semibold tracking-tight text-[#F9FAFB] md:text-5xl">
                      {t("See every recurring cost in one calm, usable view.", {
                        FR: "Voyez chaque cout recurrent dans une vue claire et calme.",
                        RU: "Смотрите все регулярные траты в одном спокойном и понятном интерфейсе.",
                        ES: "Ve cada gasto recurrente en una vista clara y tranquila.",
                        PT: "Veja cada gasto recorrente em uma interface calma e clara.",
                      })}
                    </h1>
                    <p className="max-w-2xl text-base leading-relaxed text-[#A5B4C3] md:text-lg">
                      {t("Filter the noise, surface the expensive outliers, and keep renewals visible before they quietly stack up.", {
                        FR: "Filtrez le bruit, reperez les abonnements les plus chers et gardez les renouvellements visibles.",
                        RU: "Отфильтруйте лишнее, выделите дорогие сервисы и держите продления на виду.",
                        ES: "Filtra el ruido, detecta los servicios mas caros y mantén visibles las renovaciones.",
                        PT: "Filtre o ruido, destaque os servicos mais caros e mantenha as renovacoes visiveis.",
                      })}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link href="/subscriptions/new">
                      <button className="inline-flex items-center gap-2 rounded-2xl bg-[#4ADE80] px-5 py-3 text-sm font-semibold text-[#05111A] transition hover:bg-[#74E6A1]">
                        <Plus className="h-4 w-4" />
                        {t("Add subscription", { FR: "Ajouter", RU: "Добавить", ES: "Agregar", PT: "Adicionar" })}
                      </button>
                    </Link>
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-[#C6D3DC]">
                      {filteredSubscriptions.length} {t("visible", { FR: "visibles", RU: "видно", ES: "visibles", PT: "visiveis" })}
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-[#6B7280]">Monthly load</p>
                    <p className="mt-3 text-2xl font-semibold text-[#4ADE80]">
                      {formatCurrency(totalMonthly, currency)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-[#6B7280]">Active</p>
                    <p className="mt-3 text-2xl font-semibold text-[#F9FAFB]">{activeCount}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-[#6B7280]">Inactive</p>
                    <p className="mt-3 text-2xl font-semibold text-[#9CA3AF]">{inactiveCount}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-[#6B7280]">Due soon</p>
                    <p className="mt-3 text-2xl font-semibold text-[#FF7355]">{upcomingCount}</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.9),rgba(6,11,22,0.95))] p-5 md:p-6">
              <div className="mb-4 flex items-center gap-2 text-sm font-medium text-[#D0D8E0]">
                <SlidersHorizontal className="h-4 w-4 text-[#7DD3FC]" />
                {t("Filters", { FR: "Filtres", RU: "Фильтры", ES: "Filtros", PT: "Filtros" })}
              </div>

              <div className="grid gap-3 xl:grid-cols-[1.4fr_0.9fr_0.8fr_1fr]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder={t("Search by service name", {
                      FR: "Rechercher par nom",
                      RU: "Поиск по названию",
                      ES: "Buscar por nombre",
                      PT: "Buscar por nome",
                    })}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-[#F9FAFB] outline-none transition placeholder:text-[#6B7280] focus:border-[#4ADE80]/35"
                  />
                </div>

                <select
                  value={groupFilter}
                  onChange={(event) => setGroupFilter(event.target.value)}
                  className="app-select rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[#F9FAFB] outline-none transition focus:border-[#4ADE80]/35"
                >
                  <option value="">{t("Group", { FR: "Groupe", RU: "Группа", ES: "Grupo", PT: "Grupo" })}</option>
                  {groupOptions.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>

                <div className="flex rounded-2xl border border-white/10 bg-white/5 p-1">
                  {(["all", "DAILY", "MONTHLY", "YEARLY"] as const).map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setBillingFilter(value)}
                      className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium transition ${
                        billingFilter === value
                          ? "bg-[#FF7355] text-[#05111A]"
                          : "text-[#9CA3AF] hover:text-[#F9FAFB]"
                      }`}
                    >
                      {value === "all" ? t("All", { FR: "Tous", RU: "Все", ES: "Todos", PT: "Todos" }) : formatBillingPeriod(value)}
                    </button>
                  ))}
                </div>

                <div className="flex rounded-2xl border border-white/10 bg-white/5 p-1">
                  {(["all", "active", "inactive"] as const).map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setStatusFilter(value)}
                      className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium capitalize transition ${
                        statusFilter === value
                          ? "bg-[#4ADE80] text-[#05111A]"
                          : "text-[#9CA3AF] hover:text-[#F9FAFB]"
                      }`}
                    >
                      {value === "all"
                        ? t("All", { FR: "Tous", RU: "Все", ES: "Todos", PT: "Todos" })
                        : value === "active"
                          ? t("Active", { FR: "Actifs", RU: "Активные", ES: "Activas", PT: "Ativas" })
                          : t("Inactive", { FR: "Inactifs", RU: "Неактивные", ES: "Inactivas", PT: "Inativas" })}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {mostExpensive ? (
              <StatusBanner tone="info" title={t("Highest monthly exposure", { FR: "Exposition mensuelle maximale", RU: "Максимальная месячная нагрузка", ES: "Mayor carga mensual", PT: "Maior carga mensal" })}>
                {mostExpensive.name} currently has the highest monthly impact at{" "}
                {formatCurrency(
                  mostExpensive.billingPeriod === "MONTHLY"
                    ? mostExpensive.price
                    : toMonthlyEquivalent(mostExpensive.price, mostExpensive.billingPeriod),
                  currency
                )}
                .
              </StatusBanner>
            ) : null}

            {filteredSubscriptions.length === 0 ? (
              <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.88),rgba(6,11,22,0.94))]">
                <EmptyState
                  title={
                    subscriptions.length === 0
                      ? "No subscriptions yet"
                      : t("Nothing matches these filters", { FR: "Aucun resultat", RU: "Ничего не найдено", ES: "Nada coincide", PT: "Nada corresponde" })
                  }
                  description={
                    subscriptions.length === 0
                      ? t("Start with the services that renew every month. ControlMe becomes useful once your recurring costs are visible.", { FR: "Commencez par les services qui se renouvellent chaque mois.", RU: "Начните с сервисов, которые продлеваются каждый месяц.", ES: "Empieza con servicios que se renuevan cada mes.", PT: "Comece com servicos renovados todos os meses." })
                      : t("Try broadening your filters or clear the search to bring subscriptions back into view.", { FR: "Elargissez les filtres ou effacez la recherche.", RU: "Расширьте фильтры или очистите поиск.", ES: "Amplia los filtros o limpia la busqueda.", PT: "Amplie os filtros ou limpe a busca." })
                  }
                  action={
                    subscriptions.length === 0
                      ? {
                          label: t("Add first subscription", { FR: "Ajouter la premiere", RU: "Добавить первую", ES: "Agregar la primera", PT: "Adicionar a primeira" }),
                          onClick: () => {
                            window.location.href = "/subscriptions/new";
                          },
                        }
                      : undefined
                  }
                />
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-2">
                {filteredSubscriptions.map((subscription, index) => (
                  <div
                    key={subscription.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 0.04}s` }}
                  >
                    <SubscriptionCard
                      subscription={subscription}
                      allSubscriptions={subscriptions}
                      currency={currency}
                      onEdit={(nextSubscription) => setEditSubscription(nextSubscription)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <SubscriptionDrawer
          subscription={editSubscription}
          onClose={() => setEditSubscription(null)}
        />
      </AppShell>
    </ProtectedRoute>
  );
}
