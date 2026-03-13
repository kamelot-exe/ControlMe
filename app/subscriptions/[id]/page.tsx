"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Globe, Pencil, Trash2 } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppShell } from "@/components/layout/AppShell";
import { NeedScoreSlider } from "@/components/subscriptions/NeedScoreSlider";
import {
  SubscriptionNamePicker,
  type CatalogSuggestion,
} from "@/components/subscriptions/SubscriptionNamePicker";
import { ServiceBadge } from "@/components/subscriptions/ServiceBadge";
import {
  DEFAULT_SUBSCRIPTION_CATEGORY,
  SERVICE_GROUP_OPTIONS,
} from "@/components/subscriptions/subscription-catalog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ErrorState, StatusBanner, Tag, useAppUi } from "@/components/ui";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { useMe } from "@/hooks/use-auth";
import {
  useDeleteSubscription,
  useSubscriptions,
  useSubscription,
  useUpdateSubscription,
} from "@/hooks/use-subscriptions";
import { evaluateSubscriptionReview } from "@/lib/subscriptions/review";
import { translate } from "@/lib/i18n";
import { getLocalizedCategoryName } from "@/lib/subscriptions/categories";
import { cn } from "@/lib/utils";
import {
  formatBillingPeriod,
  formatCurrency,
  formatDate,
  getDaysUntil,
  toMonthlyEquivalent,
  toYearlyEquivalent,
} from "@/lib/utils/format";
import type { BillingPeriod, Currency, UpdateSubscriptionDto } from "@/shared/types";

export default function SubscriptionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const subscriptionQuery = useSubscription(params.id);
  const subscriptionsQuery = useSubscriptions();
  const meQuery = useMe();
  const updateMutation = useUpdateSubscription();
  const deleteMutation = useDeleteSubscription();
  const { showToast, language } = useAppUi();
  const t = (fallback: string, values?: Record<string, string>) =>
    translate(language, (values ?? {}) as Record<typeof language, string>, fallback);

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState<UpdateSubscriptionDto>({});
  const [feedback, setFeedback] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);

  const subscription = subscriptionQuery.data?.data;
  const currency = (meQuery.data?.data?.currency ?? "USD") as Currency;

  useEffect(() => {
    if (!subscription) return;
    setFormData({
      name: subscription.name,
      price: subscription.price,
      billingPeriod: subscription.billingPeriod,
      nextChargeDate:
        typeof subscription.nextChargeDate === "string"
          ? subscription.nextChargeDate.split("T")[0]
          : new Date(subscription.nextChargeDate).toISOString().split("T")[0],
      category: subscription.category || DEFAULT_SUBSCRIPTION_CATEGORY,
      serviceGroup: subscription.serviceGroup ?? "",
      needScore: subscription.needScore ?? 70,
      notes: subscription.notes ?? "",
      websiteUrl: subscription.websiteUrl ?? "",
      isActive: subscription.isActive,
    });
  }, [subscription]);

  if (subscriptionQuery.isLoading) {
    return (
      <ProtectedRoute>
        <AppShell>
          <div className="p-8 md:p-10 lg:p-12">
            <div className="max-w-6xl">
              <SkeletonCard />
            </div>
          </div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  if (subscriptionQuery.isError || !subscription) {
    return (
      <ProtectedRoute>
        <AppShell>
          <div className="p-8 md:p-10 lg:p-12">
            <div className="max-w-5xl">
              <ErrorState
                title={t("Subscription not found", { FR: "Abonnement introuvable", RU: "Подписка не найдена", ES: "Suscripcion no encontrada", PT: "Assinatura nao encontrada" })}
                message={t("The subscription could not be loaded or no longer exists.", { FR: "L'abonnement est introuvable ou n'existe plus.", RU: "Подписка не загрузилась или больше не существует.", ES: "La suscripcion no se pudo cargar o ya no existe.", PT: "A assinatura nao pode ser carregada ou nao existe mais." })}
                onRetry={() => router.push("/subscriptions")}
              />
            </div>
          </div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  const daysUntil = getDaysUntil(subscription.nextChargeDate);
  const monthlyEquivalent = toMonthlyEquivalent(subscription.price, subscription.billingPeriod);
  const yearlyEquivalent = toYearlyEquivalent(subscription.price, subscription.billingPeriod);
  const nextChargeTone = daysUntil < 0 ? "text-[#F97373]" : daysUntil <= 7 ? "text-[#F59E0B]" : "text-[#F9FAFB]";
  const subscriptionId = subscription.id;
  const review = evaluateSubscriptionReview(
    subscription,
    subscriptionsQuery.data?.data ?? [],
  );

  function applyCatalogSuggestion(suggestion: CatalogSuggestion) {
    setFormData((current) => ({
      ...current,
      name: `${suggestion.service} (${suggestion.plan})`,
      price: Number.parseFloat(String(suggestion.price)) || current.price,
      billingPeriod: suggestion.billingPeriod as BillingPeriod,
      serviceGroup: suggestion.group || current.serviceGroup,
      needScore: suggestion.defaultNeedScore ?? current.needScore,
      websiteUrl: suggestion.website || current.websiteUrl,
    }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFeedback(null);

    try {
      await updateMutation.mutateAsync({
        id: subscriptionId,
        data: formData,
      });
      setIsEditing(false);
      showToast(t("Changes saved.", { FR: "Modifications enregistrees.", RU: "Изменения сохранены.", ES: "Cambios guardados.", PT: "Alteracoes salvas." }));
      window.setTimeout(() => {
        router.back();
      }, 2000);
    } catch (error) {
      setFeedback({
        tone: "error",
        message: error instanceof Error ? error.message : "Failed to update subscription.",
      });
    }
  }

  async function handleDelete() {
    try {
      await deleteMutation.mutateAsync(subscriptionId);
      router.push("/subscriptions");
    } catch (error) {
      setFeedback({
        tone: "error",
        message: error instanceof Error ? error.message : "Failed to delete subscription.",
      });
      setShowDeleteConfirm(false);
    }
  }

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="p-8 md:p-10 lg:p-12">
          <div className="mx-auto max-w-6xl space-y-8 animate-fade-in">
            <Link
              href="/subscriptions"
              className="inline-flex items-center gap-2 text-sm text-[#9CA3AF] transition hover:text-[#F9FAFB]"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("Back to subscriptions", { FR: "Retour aux abonnements", RU: "Назад к подпискам", ES: "Volver a suscripciones", PT: "Voltar para assinaturas" })}
            </Link>

            <section className="rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(74,222,128,0.16),transparent_26%),linear-gradient(135deg,rgba(10,17,32,0.98),rgba(5,8,22,0.94))] p-7 md:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-start gap-4">
                  <ServiceBadge
                    name={subscription.name}
                    className="h-16 w-16 rounded-3xl text-sm tracking-[0.22em]"
                  />
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <h1 className="text-4xl font-semibold tracking-tight text-[#F9FAFB]">
                        {subscription.name}
                      </h1>
                      <Tag variant={subscription.isActive ? "success" : "error"} size="md">
                        {subscription.isActive ? t("Active", { FR: "Actif", RU: "Активна", ES: "Activa", PT: "Ativa" }) : t("Inactive", { FR: "Inactif", RU: "Неактивна", ES: "Inactiva", PT: "Inativa" })}
                      </Tag>
                      <Tag
                        variant={
                          review.status === "keep"
                            ? "success"
                            : review.status === "review"
                              ? "warning"
                              : "error"
                        }
                        size="md"
                      >
                        {review.label}
                      </Tag>
                    </div>
                    <p className="max-w-2xl text-base leading-relaxed text-[#94A3B8]">
                      {t("Review billing timing, adjust details, and spot whether this subscription still earns its place in your monthly budget.", { FR: "Revoyez l'echeance et voyez si cet abonnement merite encore sa place.", RU: "Проверьте дату списания и оцените, заслуживает ли подписка места в бюджете.", ES: "Revisa la fecha de cobro y si esta suscripcion sigue mereciendo su lugar.", PT: "Revise a cobranca e se esta assinatura ainda merece seu lugar no orcamento." })}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  {!isEditing ? (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setFeedback(null);
                          setIsEditing(true);
                        }}
                        className="border-[#38BDF8]/30 text-[#7DD3FC] hover:bg-[#38BDF8]/10"
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        {t("Edit", { FR: "Modifier", RU: "Изменить", ES: "Editar", PT: "Editar" })}
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => setShowDeleteConfirm((value) => !value)}
                        className="text-[#FCA5A5] hover:bg-[#F87171]/10 hover:text-[#FCA5A5]"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {t("Delete", { FR: "Supprimer", RU: "Удалить", ES: "Eliminar", PT: "Excluir" })}
                      </Button>
                    </>
                  ) : (
                    <Button variant="ghost" onClick={() => setIsEditing(false)}>
                      {t("Cancel", { FR: "Annuler", RU: "Отмена", ES: "Cancelar", PT: "Cancelar" })}
                    </Button>
                  )}
                </div>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-[#6B7280]">Monthly load</p>
                  <p className="mt-3 text-2xl font-semibold text-[#4ADE80]">
                    {formatCurrency(monthlyEquivalent, currency)}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-[#6B7280]">Next charge</p>
                  <p className={cn("mt-3 text-2xl font-semibold", nextChargeTone)}>
                    {daysUntil < 0 ? `${Math.abs(daysUntil)}d overdue` : `${daysUntil}d`}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-[#6B7280]">Yearly impact</p>
                  <p className="mt-3 text-2xl font-semibold text-[#F9FAFB]">
                    {formatCurrency(yearlyEquivalent, currency)}
                  </p>
                </div>
              </div>
            </section>

            <StatusBanner tone={review.tone} title={review.label}>
              {review.reason}
            </StatusBanner>

            {feedback ? <StatusBanner tone={feedback.tone}>{feedback.message}</StatusBanner> : null}

            {showDeleteConfirm ? (
              <StatusBanner tone="error" title="Delete subscription">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <span>This removes the subscription and its usage history from your account.</span>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={deleteMutation.isPending}
                      className="rounded-xl bg-[#F87171] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#FB8B8B] disabled:opacity-50"
                    >
                      {deleteMutation.isPending ? "Deleting..." : "Delete now"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-[#D3DBE4] transition hover:bg-white/10"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </StatusBanner>
            ) : null}

            <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
              <Card className="glass-hover">
                <CardHeader>
                  <CardTitle>{isEditing ? t("Edit details", { FR: "Modifier les details", RU: "Изменить детали", ES: "Editar detalles", PT: "Editar detalhes" }) : t("Subscription details", { FR: "Details de l'abonnement", RU: "Детали подписки", ES: "Detalles de la suscripcion", PT: "Detalhes da assinatura" })}</CardTitle>
                  <CardDescription>
                    {isEditing
                      ? "Update billing data, activity state, and context."
                      : "Core subscription information and reference notes."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <SubscriptionNamePicker
                        value={formData.name ?? ""}
                        onChange={(name) => setFormData({ ...formData, name })}
                        onSelectSuggestion={applyCatalogSuggestion}
                        required
                      />
                      <div className="grid gap-4 md:grid-cols-2">
                        <Input
                          label="Price"
                          type="number"
                          step="0.01"
                          value={formData.price ?? ""}
                          onChange={(event) =>
                            setFormData({
                              ...formData,
                              price: Number(event.target.value),
                            })
                          }
                          required
                        />
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-[#F9FAFB]/80">
                            Billing period
                          </label>
                          <select
                            value={formData.billingPeriod ?? "MONTHLY"}
                            onChange={(event) =>
                              setFormData({
                                ...formData,
                                billingPeriod: event.target.value as BillingPeriod,
                              })
                            }
                            className="app-select w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[#F9FAFB] outline-none transition hover:bg-white/10 focus:border-[#4ADE80]/35"
                          >
                            {(["DAILY", "MONTHLY", "YEARLY"] as const).map((period) => (
                              <option key={period} value={period}>
                                {formatBillingPeriod(period)}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <Input
                        label="Next charge date"
                        type="date"
                        value={typeof formData.nextChargeDate === "string" ? formData.nextChargeDate : ""}
                        onChange={(event) =>
                          setFormData({ ...formData, nextChargeDate: event.target.value })
                        }
                        required
                      />
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[#F9FAFB]/80">
                            {t("Service group", { FR: "Groupe de service", RU: "Группа сервиса", ES: "Grupo de servicio", PT: "Grupo do servico" })}
                        </label>
                        <select
                          value={formData.serviceGroup ?? ""}
                          onChange={(event) =>
                            setFormData({ ...formData, serviceGroup: event.target.value })
                          }
                          className="app-select w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[#F9FAFB] outline-none transition hover:bg-white/10 focus:border-[#4ADE80]/35"
                        >
                            <option value="">{t("No group yet", { FR: "Pas encore de groupe", RU: "Пока без группы", ES: "Aun sin grupo", PT: "Ainda sem grupo" })}</option>
                          {SERVICE_GROUP_OPTIONS.map((group) => (
                            <option key={group} value={group}>
                              {group}
                            </option>
                          ))}
                        </select>
                      </div>
                      <NeedScoreSlider
                        value={formData.needScore ?? 70}
                        onChange={(needScore) => setFormData({ ...formData, needScore })}
                      />
                      <div className="grid gap-4">
                        <Input
                          label="Website URL"
                          type="url"
                          value={formData.websiteUrl ?? ""}
                          onChange={(event) =>
                            setFormData({ ...formData, websiteUrl: event.target.value })
                          }
                          placeholder="https://"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[#F9FAFB]/80">Notes</label>
                        <textarea
                          value={formData.notes ?? ""}
                          onChange={(event) => setFormData({ ...formData, notes: event.target.value })}
                          placeholder="Useful context, renewal details, or cancellation notes."
                          className="min-h-[120px] w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[#F9FAFB] outline-none transition hover:bg-white/10 focus:border-[#4ADE80]/35"
                        />
                      </div>
                      <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                        <input
                          type="checkbox"
                          checked={formData.isActive ?? true}
                          onChange={(event) =>
                            setFormData({ ...formData, isActive: event.target.checked })
                          }
                          className="h-5 w-5 accent-[#4ADE80]"
                        />
                        <span className="text-sm text-[#F9FAFB]">Subscription is active</span>
                      </label>
                      <div className="flex gap-3">
                        <Button type="submit" disabled={updateMutation.isPending} className="flex-1">
                          {updateMutation.isPending ? "Saving..." : "Save changes"}
                        </Button>
                        <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <p className="text-sm text-[#9CA3AF]">Price</p>
                          <p className="mt-2 text-2xl font-semibold text-[#F9FAFB]">
                            {formatCurrency(subscription.price, currency)}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <p className="text-sm text-[#9CA3AF]">Billing period</p>
                          <p className="mt-2 text-2xl font-semibold text-[#F9FAFB]">
                            {formatBillingPeriod(subscription.billingPeriod)}
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <p className="text-sm text-[#9CA3AF]">Need score</p>
                          <p className="mt-2 text-2xl font-semibold text-[#F9FAFB]">
                            {subscription.needScore}%
                          </p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <p className="text-sm text-[#9CA3AF]">{t("Service group", { FR: "Groupe de service", RU: "Группа сервиса", ES: "Grupo de servicio", PT: "Grupo do servico" })}</p>
                          <p className="mt-2 text-xl font-semibold text-[#F9FAFB]">
                            {subscription.serviceGroup ? getLocalizedCategoryName(subscription.serviceGroup, language) : t("Not grouped yet", { FR: "Pas encore groupe", RU: "Пока без группы", ES: "Aun sin grupo", PT: "Ainda sem grupo" })}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-sm text-[#9CA3AF]">Next charge date</p>
                        <p className={cn("mt-2 text-xl font-semibold", nextChargeTone)}>
                          {formatDate(subscription.nextChargeDate)}
                        </p>
                        <p className="mt-1 text-sm text-[#94A3B8]">
                          {daysUntil < 0
                            ? `${Math.abs(daysUntil)} days overdue`
                            : `${daysUntil} day${daysUntil === 1 ? "" : "s"} until renewal`}
                        </p>
                      </div>

                      {subscription.websiteUrl ? (
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <p className="text-sm text-[#9CA3AF]">Website</p>
                          <a
                            href={subscription.websiteUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-[#7DD3FC] transition hover:text-[#A5E4FF]"
                          >
                            <Globe className="h-4 w-4" />
                            Open service website
                          </a>
                        </div>
                      ) : null}

                      {subscription.notes ? (
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <p className="text-sm text-[#9CA3AF]">Notes</p>
                          <p className="mt-2 leading-relaxed text-[#D3DBE4]">{subscription.notes}</p>
                        </div>
                      ) : null}
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card className="glass-hover">
                  <CardHeader>
                    <CardTitle>Service access</CardTitle>
                    <CardDescription>Useful links related to this subscription.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {subscription.websiteUrl ? (
                      <>
                        <a
                          href={subscription.websiteUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex w-full items-center justify-center rounded-xl border border-[#38BDF8]/30 px-4 py-3 text-sm font-medium text-[#7DD3FC] transition hover:bg-[#38BDF8]/10"
                        >
                          <Globe className="mr-2 h-4 w-4" />
                          Open service website
                        </a>
                        <p className="text-sm leading-relaxed text-[#94A3B8]">
                          Use this shortcut to review billing details, plan settings, or
                          cancellation options on the provider website.
                        </p>
                      </>
                    ) : (
                      <p className="text-sm leading-relaxed text-[#94A3B8]">
                        Add a website URL if you want a direct shortcut to the provider account or
                        billing page.
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card className="glass-hover">
                  <CardHeader>
                    <CardTitle>Financial view</CardTitle>
                    <CardDescription>What this subscription means for your budget.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div>
                      <p className="text-sm text-[#9CA3AF]">Monthly equivalent</p>
                      <p className="mt-2 text-2xl font-semibold text-[#4ADE80]">
                        {formatCurrency(monthlyEquivalent, currency)}
                      </p>
                    </div>
                    <div className="border-t border-white/10 pt-5">
                      <p className="text-sm text-[#9CA3AF]">Yearly equivalent</p>
                      <p className="mt-2 text-2xl font-semibold text-[#F9FAFB]">
                        {formatCurrency(yearlyEquivalent, currency)}
                      </p>
                    </div>
                    {subscription.createdAt ? (
                      <div className="border-t border-white/10 pt-5">
                        <p className="text-sm text-[#9CA3AF]">Created</p>
                        <p className="mt-2 text-sm font-medium text-[#D3DBE4]">
                          {formatDate(subscription.createdAt)}
                        </p>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
