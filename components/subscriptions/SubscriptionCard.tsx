"use client";

import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { useAppUi } from "@/components/ui/AppUiProvider";
import type { Currency, Subscription } from "@/shared/types";
import { evaluateSubscriptionReview } from "@/lib/subscriptions/review";
import { translate } from "@/lib/i18n";
import { getSubscriptionTags, getUsageLabel } from "@/lib/subscriptions/modules";
import { cn } from "@/lib/utils";
import { ServiceBadge } from "./ServiceBadge";
import {
  formatBillingPeriod,
  formatCurrency,
  formatDate,
  getDaysUntil,
  toMonthlyEquivalent,
} from "@/lib/utils/format";

interface SubscriptionCardProps {
  subscription: Subscription;
  allSubscriptions: Subscription[];
  currency?: Currency;
  onEdit?: (subscription: Subscription) => void;
  onDelete?: (subscription: Subscription) => void;
}

export function SubscriptionCard({
  subscription,
  allSubscriptions,
  currency = "USD",
  onEdit,
  onDelete,
}: SubscriptionCardProps) {
  const { language, modules, usageFlags, pausedSubscriptions, subscriptionTags } = useAppUi();
  const t = (fallback: string, values?: Record<string, string>) =>
    translate(language, values ?? {}, fallback);
  const daysUntil = getDaysUntil(subscription.nextChargeDate);
  const isUpcoming = daysUntil <= 7 && daysUntil >= 0;
  const isOverdue = daysUntil < 0;
  const isToday = daysUntil === 0;
  const isTomorrow = daysUntil === 1;
  const review = evaluateSubscriptionReview(subscription, allSubscriptions);
  const usageLabel = getUsageLabel(modules, usageFlags, subscription.id);
  const paused = modules.pauseTracking && !!pausedSubscriptions[subscription.id];
  const tags = getSubscriptionTags(modules, subscriptionTags, subscription.id);
  const costPerDay = toMonthlyEquivalent(subscription.price, subscription.billingPeriod) / 30;

  const statusTag = (() => {
    if (!subscription.isActive) {
      return <Tag variant="error" size="sm">{t("Inactive", { FR: "Inactif", RU: "Неактивна", UK: "Неактивна", GE: "Inaktiv", ES: "Inactiva", PT: "Inativa", IT: "Inattiva", PL: "Nieaktywna", TR: "Pasif", UZ: "Faol emas" })}</Tag>;
    }
    if (paused) {
      return <Tag variant="info" size="sm">Paused</Tag>;
    }
    if (isOverdue) {
      return <Tag variant="error" size="sm">{t("Overdue", { FR: "En retard", RU: "Просрочена", UK: "Прострочена", GE: "Überfällig", ES: "Atrasada", PT: "Atrasada", IT: "Scaduta", PL: "Zaległa", TR: "Gecikti", UZ: "Muddati o'tgan" })}</Tag>;
    }
    if (isToday) {
      return <Tag variant="warning" size="sm">{t("Today", { FR: "Aujourd'hui", RU: "Сегодня", UK: "Сьогодні", GE: "Heute", ES: "Hoy", PT: "Hoje", IT: "Oggi", PL: "Dzisiaj", TR: "Bugün", UZ: "Bugun" })}</Tag>;
    }
    if (isTomorrow) {
      return <Tag variant="warning" size="sm">{t("Tomorrow", { FR: "Demain", RU: "Завтра", UK: "Завтра", GE: "Morgen", ES: "Mañana", PT: "Amanhã", IT: "Domani", PL: "Jutro", TR: "Yarın", UZ: "Ertaga" })}</Tag>;
    }
    if (isUpcoming) {
      return <Tag variant="warning" size="sm">{daysUntil}d</Tag>;
    }
    return null;
  })();

  return (
    <Link href={`/subscriptions/${subscription.id}`}>
      <Card
        className={cn(
          "glass-hover group h-full min-h-[290px] cursor-pointer overflow-hidden transition-all duration-150 hover:-translate-y-1",
          review.status === "keep" &&
            "bg-[linear-gradient(180deg,rgba(74,222,128,0.08),rgba(255,255,255,0.04))] shadow-[0_0_0_1px_rgba(74,222,128,0.12)]",
          review.status === "review" &&
            "bg-[linear-gradient(180deg,rgba(245,158,11,0.08),rgba(255,255,255,0.04))] shadow-[0_0_0_1px_rgba(245,158,11,0.14)]",
          review.status === "cancel_candidate" &&
            "bg-[linear-gradient(180deg,rgba(249,115,115,0.08),rgba(255,255,255,0.04))] shadow-[0_0_0_1px_rgba(249,115,115,0.16)]",
        )}
      >
        <div
          style={{
            height: "3px",
            background:
              review.status === "keep"
                ? "#4ADE80"
                : review.status === "review"
                  ? "#F59E0B"
                  : "#F97373",
            borderRadius: "24px 24px 0 0",
          }}
        />

        <CardHeader className="px-6 pb-5 pt-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <ServiceBadge
                name={subscription.name}
                className="h-10 w-10 shrink-0 transition group-hover:scale-105"
              />
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-[1.05rem] font-semibold text-[#F9FAFB] transition group-hover:text-white">
                  {subscription.name}
                </h3>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex h-3.5 w-3.5 rounded-full ring-4 ring-white/[0.03]",
                      review.status === "keep" && "bg-[#4ADE80]",
                      review.status === "review" && "bg-[#F59E0B]",
                      review.status === "cancel_candidate" && "bg-[#F97373]",
                    )}
                  />
                  <Tag
                    variant={
                      review.status === "keep"
                        ? "success"
                        : review.status === "review"
                          ? "warning"
                          : "error"
                    }
                    size="sm"
                  >
                    {review.label}
                  </Tag>
                  {modules.usageFlags && usageLabel ? (
                    <Tag variant={usageLabel === "used" ? "success" : "warning"} size="sm">
                      {usageLabel === "used" ? "Used" : "Unused"}
                    </Tag>
                  ) : null}
                  {statusTag}
                </div>
                {modules.subscriptionTags && tags.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] uppercase tracking-[0.14em] text-[#AFC0CF]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            {onEdit || onDelete ? (
              <div className="flex items-center gap-1 opacity-0 transition-all duration-150 group-hover:opacity-100">
                {onEdit ? (
                  <button
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      onEdit(subscription);
                    }}
                    className="rounded-lg p-1.5 text-[#9CA3AF] transition-all duration-150 hover:bg-[#4ADE80]/10 hover:text-[#4ADE80]"
                    title={t("Quick edit", { FR: "Modification rapide", RU: "Быстрое редактирование", UK: "Швидке редагування", GE: "Schnell bearbeiten", ES: "Edición rápida", PT: "Edicao rapida", IT: "Modifica rapida", PL: "Szybka edycja", TR: "Hızlı düzenleme", UZ: "Tez tahrirlash" })}
                  >
                    <Pencil size={14} />
                  </button>
                ) : null}
                {onDelete ? (
                  <button
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      onDelete(subscription);
                    }}
                    className="rounded-lg p-1.5 text-[#9CA3AF] transition-all duration-150 hover:bg-[#F97373]/10 hover:text-[#F97373]"
                    title={t("Delete subscription", { FR: "Supprimer l'abonnement", RU: "Удалить подписку", UK: "Видалити підписку", GE: "Abo löschen", ES: "Eliminar suscripción", PT: "Excluir assinatura", IT: "Elimina abbonamento", PL: "Usuń subskrypcję", TR: "Aboneliği sil", UZ: "Obunani o'chirish" })}
                  >
                    <Trash2 size={14} />
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        </CardHeader>

        <CardContent className="space-y-4 px-6 pb-6">
          <div className="flex items-baseline justify-between gap-3">
            <span
              className={cn(
                "text-[1.85rem] font-bold",
                subscription.isActive ? "text-[#4ADE80]" : "text-[#9CA3AF]",
              )}
            >
              {formatCurrency(subscription.price, currency)}
            </span>
            <Tag size="sm" className="bg-white/10">
              {formatBillingPeriod(subscription.billingPeriod)}
            </Tag>
          </div>

          {modules.costPerDay ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-[#9CA3AF]">Cost per day</span>
                <span className="font-medium text-[#DCE6EE]">
                  {formatCurrency(costPerDay, currency)}
                </span>
              </div>
            </div>
          ) : null}

          <div className="space-y-2.5 border-t border-white/10 pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#9CA3AF]">
                {t("Next charge", { FR: "Prochain paiement", RU: "Следующее списание", UK: "Наступне списання", GE: "Nächste Abbuchung", ES: "Próximo cargo", PT: "Próxima cobrança", IT: "Prossimo addebito", PL: "Następna płatność", TR: "Sonraki ödeme", UZ: "Keyingi to'lov" })}
              </span>
              <span
                className={cn(
                  "font-medium",
                  isOverdue && "text-[#F97373]",
                  (isToday || isTomorrow || isUpcoming) && "text-[#F59E0B]",
                  !isUpcoming && !isOverdue && "text-[#F9FAFB]",
                )}
              >
                {formatDate(subscription.nextChargeDate)}
                {daysUntil >= 0 ? ` (${daysUntil}d)` : ""}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#9CA3AF]">
                {t("Need score", { FR: "Utilité", RU: "Полезность", UK: "Корисність", GE: "Nutzen", ES: "Utilidad", PT: "Utilidade", IT: "Utilità", PL: "Przydatność", TR: "Gereklilik", UZ: "Foydalilik" })}
              </span>
              <span className="font-medium text-[#DCE6EE]">{subscription.needScore}%</span>
            </div>
            {subscription.serviceGroup ? (
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#9CA3AF]">
                  {t("Group", { FR: "Groupe", RU: "Группа", UK: "Група", GE: "Gruppe", ES: "Grupo", PT: "Grupo", IT: "Gruppo", PL: "Grupa", TR: "Grup", UZ: "Guruh" })}
                </span>
                <span className="font-medium text-[#DCE6EE]">
                  {subscription.serviceGroup}
                </span>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
