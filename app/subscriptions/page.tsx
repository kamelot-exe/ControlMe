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
import { useDeleteSubscription, useSubscriptions } from "@/hooks/use-subscriptions";
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
    translate(language, values ?? {}, fallback);
  const subscriptionsQuery = useSubscriptions();
  const deleteMutation = useDeleteSubscription();
  const meQuery = useMe();
  const apiError = useApiError(subscriptionsQuery);

  const [searchQuery, setSearchQuery] = useState("");
  const [groupFilter, setGroupFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [billingFilter, setBillingFilter] = useState<"all" | "DAILY" | "MONTHLY" | "YEARLY">("all");
  const [editSubscription, setEditSubscription] = useState<Subscription | null>(null);
  const [deleteSubscription, setDeleteSubscription] = useState<Subscription | null>(null);

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
                  UK: "Не вдалося завантажити підписки",
                  GE: "Abonnements konnten nicht geladen werden",
                  ES: "No se pudieron cargar las suscripciones",
                  PT: "Nao foi possivel carregar as assinaturas",
                  IT: "Impossibile caricare gli abbonamenti",
                  PL: "Nie udalo sie zaladowac subskrypcji",
                  TR: "Abonelikler yuklenemedi",
                  UZ: "Obunalarni yuklab bolmadi",
                })}
                message={apiError.errorMessage || t("Please try again in a moment.", {
                  FR: "Veuillez reessayer dans un instant.",
                  RU: "Попробуйте еще раз через минуту.",
                  UK: "Спробуйте ще раз за хвилину.",
                  GE: "Bitte versuchen Sie es in einem Moment erneut.",
                  ES: "Vuelve a intentarlo en un momento.",
                  PT: "Tente novamente em instantes.",
                  IT: "Riprova tra un momento.",
                  PL: "Sprobuj ponownie za chwile.",
                  TR: "Lutfen biraz sonra tekrar deneyin.",
                  UZ: "Birozdan keyin yana urinib koring.",
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
                      UK: "Контроль підписок",
                      GE: "Abo-Kontrolle",
                      ES: "Control de suscripciones",
                      PT: "Controle de assinaturas",
                      IT: "Controllo abbonamenti",
                      PL: "Kontrola subskrypcji",
                      TR: "Abonelik kontrolu",
                      UZ: "Obunalar nazorati",
                    })}
                  </Tag>
                  <div className="space-y-3">
                    <h1 className="text-4xl font-semibold tracking-tight text-[#F9FAFB] md:text-5xl">
                      {t("See every recurring cost in one calm, usable view.", {
                        FR: "Voyez chaque cout recurrent dans une vue claire et calme.",
                        RU: "Смотрите все регулярные траты в одном спокойном и понятном интерфейсе.",
                        UK: "Бачте всі регулярні витрати в одному спокійному та зрозумілому інтерфейсі.",
                        GE: "Sehen Sie alle wiederkehrenden Kosten in einer ruhigen, klaren Ansicht.",
                        ES: "Ve cada gasto recurrente en una vista clara y tranquila.",
                        PT: "Veja cada gasto recorrente em uma interface calma e clara.",
                        IT: "Vedi ogni costo ricorrente in una vista chiara e ordinata.",
                        PL: "Zobacz wszystkie cykliczne wydatki w jednym spokojnym i czytelnym widoku.",
                        TR: "Tum yinelenen harcamalari sakin ve net bir gorunumde gorun.",
                        UZ: "Barcha muntazam xarajatlarni bitta sokin va tushunarli oynada koring.",
                      })}
                    </h1>
                    <p className="max-w-2xl text-base leading-relaxed text-[#A5B4C3] md:text-lg">
                      {t("Filter the noise, surface the expensive outliers, and keep renewals visible before they quietly stack up.", {
                        FR: "Filtrez le bruit, reperez les abonnements les plus chers et gardez les renouvellements visibles.",
                        RU: "Отфильтруйте лишнее, выделите дорогие сервисы и держите продления на виду.",
                        UK: "Відфільтруйте зайве, виділіть дорогі сервіси та тримайте продовження на виду.",
                        GE: "Filtern Sie den Larm heraus, finden Sie teure Ausreisser und behalten Sie Verlangerungen im Blick.",
                        ES: "Filtra el ruido, detecta los servicios mas caros y manten visibles las renovaciones.",
                        PT: "Filtre o ruido, destaque os servicos mais caros e mantenha as renovacoes visiveis.",
                        IT: "Filtra il rumore, individua i servizi piu costosi e tieni visibili i rinnovi.",
                        PL: "Odfiltruj szum, wychwyc drogie uslugi i trzymaj odnowienia na widoku.",
                        TR: "Gurultuyu filtreleyin, pahali hizmetleri ortaya cikarin ve yenilemeleri gorunur tutun.",
                        UZ: "Ortiqchasini filtrlang, qimmat servislarni ajrating va yangilanishlarni koz oldida saqlang.",
                      })}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link href="/subscriptions/new">
                      <button className="inline-flex items-center gap-2 rounded-2xl bg-[#4ADE80] px-5 py-3 text-sm font-semibold text-[#05111A] transition hover:bg-[#74E6A1]">
                        <Plus className="h-4 w-4" />
                        {t("Add subscription", {
                          FR: "Ajouter",
                          RU: "Добавить",
                          UK: "Додати",
                          GE: "Hinzufugen",
                          ES: "Agregar",
                          PT: "Adicionar",
                          IT: "Aggiungi",
                          PL: "Dodaj",
                          TR: "Ekle",
                          UZ: "Qoshish",
                        })}
                      </button>
                    </Link>
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-[#C6D3DC]">
                      {filteredSubscriptions.length}{" "}
                      {t("visible", {
                        FR: "visibles",
                        RU: "видно",
                        UK: "видно",
                        GE: "sichtbar",
                        ES: "visibles",
                        PT: "visiveis",
                        IT: "visibili",
                        PL: "widoczne",
                        TR: "gorunur",
                        UZ: "korinadi",
                      })}
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-[#6B7280]">
                      {t("Monthly load", {
                        FR: "Charge mensuelle",
                        RU: "Месячная нагрузка",
                        UK: "Місячне навантаження",
                        GE: "Monatliche Belastung",
                        ES: "Carga mensual",
                        PT: "Carga mensal",
                        IT: "Carico mensile",
                        PL: "Miesieczne obciazenie",
                        TR: "Aylik yuk",
                        UZ: "Oylik yuklama",
                      })}
                    </p>
                    <p className="mt-3 text-2xl font-semibold text-[#4ADE80]">
                      {formatCurrency(totalMonthly, currency)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-[#6B7280]">
                      {t("Active", {
                        FR: "Actives",
                        RU: "Активные",
                        UK: "Активні",
                        GE: "Aktiv",
                        ES: "Activas",
                        PT: "Ativas",
                        IT: "Attive",
                        PL: "Aktywne",
                        TR: "Aktif",
                        UZ: "Faol",
                      })}
                    </p>
                    <p className="mt-3 text-2xl font-semibold text-[#F9FAFB]">{activeCount}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-[#6B7280]">
                      {t("Inactive", {
                        FR: "Inactives",
                        RU: "Неактивные",
                        UK: "Неактивні",
                        GE: "Inaktiv",
                        ES: "Inactivas",
                        PT: "Inativas",
                        IT: "Inattive",
                        PL: "Nieaktywne",
                        TR: "Pasif",
                        UZ: "Faol emas",
                      })}
                    </p>
                    <p className="mt-3 text-2xl font-semibold text-[#9CA3AF]">{inactiveCount}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-[#6B7280]">
                      {t("Due soon", {
                        FR: "Bientot facture",
                        RU: "Скоро списание",
                        UK: "Скоро списання",
                        GE: "Bald fallig",
                        ES: "Proximos cargos",
                        PT: "Cobranca em breve",
                        IT: "In scadenza",
                        PL: "Wkrotce platne",
                        TR: "Yakin odeme",
                        UZ: "Tez orada tolov",
                      })}
                    </p>
                    <p className="mt-3 text-2xl font-semibold text-[#FF7355]">{upcomingCount}</p>
                  </div>
                </div>
              </div>
            </section>
            
            <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.9),rgba(6,11,22,0.95))] p-5 md:p-6">
              <div className="mb-4 flex items-center gap-2 text-sm font-medium text-[#D0D8E0]">
                <SlidersHorizontal className="h-4 w-4 text-[#7DD3FC]" />
                {t("Filters", { FR: "Filtres", RU: "Фильтры", UK: "Фільтри", GE: "Filter", ES: "Filtros", PT: "Filtros", IT: "Filtri", PL: "Filtry", TR: "Filtreler", UZ: "Filtrlar" })}
              </div>

              <div className="grid gap-3 xl:grid-cols-[1.4fr_0.9fr_0.8fr_1fr]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder={t("Search by service name", { FR: "Rechercher par nom", RU: "Поиск по названию", UK: "Пошук за назвою", GE: "Nach Namen suchen", ES: "Buscar por nombre", PT: "Buscar por nome", IT: "Cerca per nome", PL: "Szukaj po nazwie", TR: "Ada gore ara", UZ: "Nomi boyicha qidirish" })}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-[#F9FAFB] outline-none transition placeholder:text-[#6B7280] focus:border-[#4ADE80]/35"
                  />
                </div>

                <select
                  value={groupFilter}
                  onChange={(event) => setGroupFilter(event.target.value)}
                  className="app-select rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[#F9FAFB] outline-none transition focus:border-[#4ADE80]/35"
                >
                  <option value="">{t("Group", { FR: "Groupe", RU: "Группа", UK: "Група", GE: "Gruppe", ES: "Grupo", PT: "Grupo", IT: "Gruppo", PL: "Grupa", TR: "Grup", UZ: "Guruh" })}</option>
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
                      {value === "all"
                        ? t("All", { FR: "Tous", RU: "Все", UK: "Усі", GE: "Alle", ES: "Todos", PT: "Todos", IT: "Tutti", PL: "Wszystkie", TR: "Tum", UZ: "Barchasi" })
                        : formatBillingPeriod(value)}
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
                        ? t("All", { FR: "Tous", RU: "Все", UK: "Усі", GE: "Alle", ES: "Todos", PT: "Todos", IT: "Tutti", PL: "Wszystkie", TR: "Tum", UZ: "Barchasi" })
                        : value === "active"
                          ? t("Active", { FR: "Actifs", RU: "Активные", UK: "Активні", GE: "Aktiv", ES: "Activas", PT: "Ativas", IT: "Attive", PL: "Aktywne", TR: "Aktif", UZ: "Faol" })
                          : t("Inactive", { FR: "Inactifs", RU: "Неактивные", UK: "Неактивні", GE: "Inaktiv", ES: "Inactivas", PT: "Inativas", IT: "Inattive", PL: "Nieaktywne", TR: "Pasif", UZ: "Faol emas" })}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {mostExpensive ? (
              <StatusBanner tone="info" title={t("Highest monthly exposure", { FR: "Exposition mensuelle maximale", RU: "Максимальная месячная нагрузка", UK: "Найвище місячне навантаження", GE: "Hochste monatliche Belastung", ES: "Mayor carga mensual", PT: "Maior carga mensal", IT: "Maggiore carico mensile", PL: "Najwyzsze miesieczne obciazenie", TR: "En yuksek aylik yuk", UZ: "Eng yuqori oylik yuklama" })}>
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
                      ? t("No subscriptions yet", { FR: "Aucun abonnement pour l'instant", RU: "Подписок пока нет", UK: "Підписок поки немає", GE: "Noch keine Abonnements", ES: "Aun no hay suscripciones", PT: "Ainda nao ha assinaturas", IT: "Nessun abbonamento per ora", PL: "Nie ma jeszcze subskrypcji", TR: "Henuz abonelik yok", UZ: "Hali obunalar yoq" })
                      : t("Nothing matches these filters", { FR: "Aucun resultat", RU: "Ничего не найдено", UK: "Нічого не знайдено", GE: "Keine Treffer", ES: "Nada coincide", PT: "Nada corresponde", IT: "Nessun risultato", PL: "Brak wynikow", TR: "Eslesen sonuc yok", UZ: "Mos natija topilmadi" })
                  }
                  description={
                    subscriptions.length === 0
                      ? t("Start with the services that renew every month. ControlMe becomes useful once your recurring costs are visible.", { FR: "Commencez par les services qui se renouvellent chaque mois.", RU: "Начните с сервисов, которые продлеваются каждый месяц. ControlMe становится полезным, когда регулярные расходы видны.", UK: "Почніть із сервісів, які продовжуються щомісяця. ControlMe стає корисним, коли регулярні витрати видно.", GE: "Beginnen Sie mit Diensten, die sich jeden Monat erneuern. ControlMe wird nutzlich, sobald wiederkehrende Kosten sichtbar sind.", ES: "Empieza con servicios que se renuevan cada mes. ControlMe es util cuando tus gastos recurrentes son visibles.", PT: "Comece com servicos renovados todos os meses. O ControlMe fica util quando seus custos recorrentes ficam visiveis.", IT: "Inizia dai servizi che si rinnovano ogni mese. ControlMe diventa utile quando i costi ricorrenti sono visibili.", PL: "Zacznij od uslug odnawianych co miesiac. ControlMe staje sie przydatny, gdy widac koszty cykliczne.", TR: "Her ay yenilenen hizmetlerle baslayin. Yinelenen maliyetler gorunur oldugunda ControlMe faydali hale gelir.", UZ: "Har oy yangilanadigan servislar bilan boshlang. Muntazam xarajatlar koringanda ControlMe foydali boladi." })
                      : t("Try broadening your filters or clear the search to bring subscriptions back into view.", { FR: "Elargissez les filtres ou effacez la recherche.", RU: "Расширьте фильтры или очистите поиск, чтобы вернуть подписки в список.", UK: "Розширте фільтри або очистіть пошук, щоб повернути підписки до списку.", GE: "Erweitern Sie die Filter oder loschen Sie die Suche, um Abos wieder anzuzeigen.", ES: "Amplia los filtros o limpia la busqueda para volver a ver las suscripciones.", PT: "Amplie os filtros ou limpe a busca para voltar a ver as assinaturas.", IT: "Allarga i filtri o pulisci la ricerca per rivedere gli abbonamenti.", PL: "Poszerz filtry lub wyczysc wyszukiwanie, aby znow zobaczyc subskrypcje.", TR: "Abonelikleri tekrar gormek icin filtreleri genisletin veya aramayi temizleyin.", UZ: "Obunalarni qayta korish uchun filtrlarni kengaytiring yoki qidiruvni tozalang." })
                  }
                  action={
                    subscriptions.length === 0
                      ? {
                          label: t("Add first subscription", { FR: "Ajouter la premiere", RU: "Добавить первую", UK: "Додати першу", GE: "Erste hinzufugen", ES: "Agregar la primera", PT: "Adicionar a primeira", IT: "Aggiungi la prima", PL: "Dodaj pierwsza", TR: "Ilkini ekle", UZ: "Birinchisini qoshish" }),
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
                      onDelete={(nextSubscription) => setDeleteSubscription(nextSubscription)}
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

        {deleteSubscription ? (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={() => setDeleteSubscription(null)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
              <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(6,11,22,0.98))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
                <h3 className="text-xl font-semibold text-[#F9FAFB]">
                  {t("Delete subscription?", { FR: "Supprimer l'abonnement ?", RU: "Удалить подписку?", UK: "Видалити підписку?", GE: "Abo loschen?", ES: "Eliminar suscripcion?", PT: "Excluir assinatura?", IT: "Eliminare abbonamento?", PL: "Usunac subskrypcje?", TR: "Abonelik silinsin mi?", UZ: "Obuna ochirilsinmi?" })}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[#94A3B8]">
                  {t("This will permanently remove the subscription from your account.", { FR: "Cela supprimera definitivement l'abonnement de votre compte.", RU: "Это навсегда удалит подписку из вашего аккаунта.", UK: "Це назавжди видалить підписку з вашого акаунта.", GE: "Dadurch wird das Abonnement dauerhaft aus Ihrem Konto entfernt.", ES: "Esto eliminara permanentemente la suscripcion de tu cuenta.", PT: "Isto removera permanentemente a assinatura da sua conta.", IT: "Questo rimuovera definitivamente l'abbonamento dal tuo account.", PL: "To trwale usunie subskrypcje z twojego konta.", TR: "Bu islem aboneligi hesabinizdan kalici olarak siler.", UZ: "Bu amal obunani akkauntingizdan butunlay ochiradi." })}
                </p>
                <p className="mt-2 text-sm font-medium text-[#F9FAFB]">
                  {deleteSubscription.name}
                </p>
                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={async () => {
                      await deleteMutation.mutateAsync(deleteSubscription.id);
                      setDeleteSubscription(null);
                    }}
                    disabled={deleteMutation.isPending}
                    className="flex-1 rounded-2xl bg-[#F97373] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#FB8B8B] disabled:opacity-50"
                  >
                    {deleteMutation.isPending
                      ? t("Deleting...", { FR: "Suppression...", RU: "Удаление...", UK: "Видалення...", GE: "Loschen...", ES: "Eliminando...", PT: "Excluindo...", IT: "Eliminazione...", PL: "Usuwanie...", TR: "Siliniyor...", UZ: "Ochiriliyor..." })
                      : t("Delete", { FR: "Supprimer", RU: "Удалить", UK: "Видалити", GE: "Loschen", ES: "Eliminar", PT: "Excluir", IT: "Elimina", PL: "Usun", TR: "Sil", UZ: "Ochirish" })}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteSubscription(null)}
                    className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-[#D3DBE4] transition hover:bg-white/10"
                  >
                    {t("Cancel", { FR: "Annuler", RU: "Отмена", UK: "Скасувати", GE: "Abbrechen", ES: "Cancelar", PT: "Cancelar", IT: "Annulla", PL: "Anuluj", TR: "Iptal", UZ: "Bekor qilish" })}
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </AppShell>
    </ProtectedRoute>
  );
}
