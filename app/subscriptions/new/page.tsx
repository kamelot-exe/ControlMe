"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppShell } from "@/components/layout/AppShell";
import { NeedScoreSlider } from "@/components/subscriptions/NeedScoreSlider";
import {
  SubscriptionNamePicker,
  type CatalogSuggestion,
} from "@/components/subscriptions/SubscriptionNamePicker";
import { useAppUi } from "@/components/ui";
import {
  DEFAULT_SUBSCRIPTION_CATEGORY,
  SERVICE_GROUP_OPTIONS,
} from "@/components/subscriptions/subscription-catalog";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useCreateSubscription } from "@/hooks/use-subscriptions";
import { translate } from "@/lib/i18n";
import { formatBillingPeriod } from "@/lib/utils/format";
import type { BillingPeriod, CreateSubscriptionDto } from "@/shared/types";

export default function NewSubscriptionPage() {
  const { language } = useAppUi();
  const t = (fallback: string, values?: Record<string, string>) =>
    translate(language, (values ?? {}) as Record<typeof language, string>, fallback);
  const router = useRouter();
  const createMutation = useCreateSubscription();
  const [formData, setFormData] = useState<CreateSubscriptionDto>({
    name: "",
    price: 0,
    billingPeriod: "MONTHLY",
    nextChargeDate: new Date().toISOString().split("T")[0],
    category: DEFAULT_SUBSCRIPTION_CATEGORY,
    serviceGroup: "",
    needScore: 70,
    notes: "",
  });

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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const result = await createMutation.mutateAsync(formData);
      if (result.data) {
        router.push(`/subscriptions/${result.data.id}`);
      }
    } catch (error) {
      console.error("Failed to create subscription:", error);
    }
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="min-h-[calc(100vh-2rem)] px-8 py-8 md:px-10 md:py-10 lg:px-12 lg:py-12">
          <div className="w-full max-w-5xl animate-fade-in">
            <div className="w-full max-w-4xl space-y-8">
              <Link
                href="/subscriptions"
                className="inline-flex items-center gap-2 text-[#9CA3AF] transition-colors hover:text-[#F9FAFB] animate-slide-up"
              >
                <span aria-hidden="true">←</span>
                <span>{t("Back to subscriptions", { FR: "Retour aux abonnements", RU: "Назад к подпискам", ES: "Volver a suscripciones", PT: "Voltar para assinaturas" })}</span>
              </Link>

              <div className="space-y-2 animate-slide-up" style={{ animationDelay: "0.1s" }}>
                <h1 className="text-5xl font-bold tracking-tight text-[#F9FAFB]">
                  {t("Add Subscription", { FR: "Ajouter un abonnement", RU: "Добавить подписку", ES: "Agregar suscripcion", PT: "Adicionar assinatura" })}
                </h1>
                <p className="text-lg text-[#9CA3AF]">
                  {t("Capture the renewal, score its value, and keep your future costs visible.", { FR: "Enregistrez le renouvellement et gardez les prochains paiements visibles.", RU: "Зафиксируйте продление и держите будущие списания на виду.", ES: "Registra la renovacion y mantén visibles los futuros cobros.", PT: "Registre a renovacao e mantenha os proximos pagamentos visiveis." })}
                </p>
              </div>

              <Card className="glass-hover animate-slide-up" style={{ animationDelay: "0.2s" }}>
                <CardHeader>
                  <CardTitle>{t("Subscription details", { FR: "Details de l'abonnement", RU: "Детали подписки", ES: "Detalles de la suscripcion", PT: "Detalhes da assinatura" })}</CardTitle>
                  <CardDescription>
                    {t("Choose the service, set the billing cycle, and score how necessary it is.", { FR: "Choisissez le service, le cycle de paiement et son importance.", RU: "Выберите сервис, цикл оплаты и оцените его важность.", ES: "Elige el servicio, el ciclo de cobro y su importancia.", PT: "Escolha o servico, o ciclo de cobranca e sua importancia." })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <SubscriptionNamePicker
                      value={formData.name}
                      onChange={(name) => setFormData({ ...formData, name })}
                      onSelectSuggestion={applyCatalogSuggestion}
                      placeholder={t("Netflix, Notion, Spotify, or your own custom name", { FR: "Netflix, Notion, Spotify ou votre propre nom", RU: "Netflix, Notion, Spotify или своё название", ES: "Netflix, Notion, Spotify o tu propio nombre", PT: "Netflix, Notion, Spotify ou seu proprio nome" })}
                      required
                    />

                    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
                      <div className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                          <Input
                            label={t("Price", { FR: "Prix", RU: "Цена", ES: "Precio", PT: "Preco" })}
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={formData.price || ""}
                            onChange={(event) =>
                              setFormData({
                                ...formData,
                                price: Number.parseFloat(event.target.value) || 0,
                              })
                            }
                            required
                            className="focus-ring"
                          />

                          <div className="space-y-2">
                            <label className="text-sm font-medium text-[#F9FAFB]/80">
                              {t("Billing period", { FR: "Periode de facturation", RU: "Период оплаты", ES: "Periodo de cobro", PT: "Periodo de cobranca" })}
                            </label>
                            <select
                              value={formData.billingPeriod}
                              onChange={(event) =>
                                setFormData({
                                  ...formData,
                                  billingPeriod: event.target.value as BillingPeriod,
                                })
                              }
                              className="app-select w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[#F9FAFB] transition-all duration-150 hover:bg-white/10 focus-ring"
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
                          label={t("Next charge date", { FR: "Prochaine date", RU: "Дата следующего списания", ES: "Proximo cobro", PT: "Proxima cobranca" })}
                          type="date"
                          value={
                            typeof formData.nextChargeDate === "string"
                              ? formData.nextChargeDate
                              : ""
                          }
                          onChange={(event) =>
                            setFormData({ ...formData, nextChargeDate: event.target.value })
                          }
                          required
                          className="focus-ring"
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
                            className="app-select w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[#F9FAFB] transition-all duration-150 hover:bg-white/10 focus-ring"
                          >
                            <option value="">{t("No group yet", { FR: "Pas encore de groupe", RU: "Пока без группы", ES: "Aun sin grupo", PT: "Ainda sem grupo" })}</option>
                            {SERVICE_GROUP_OPTIONS.map((group) => (
                              <option key={group} value={group}>
                                {group}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-[#F9FAFB]/80">{t("Notes", { FR: "Notes", RU: "Заметки", ES: "Notas", PT: "Notas" })}</label>
                          <textarea
                            value={formData.notes || ""}
                            onChange={(event) =>
                              setFormData({ ...formData, notes: event.target.value })
                            }
                            className="min-h-[120px] w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[#F9FAFB] placeholder:text-[#9CA3AF] transition-all duration-150 hover:bg-white/10 focus-ring"
                            placeholder={t("Optional notes...", { FR: "Notes facultatives...", RU: "Необязательные заметки...", ES: "Notas opcionales...", PT: "Notas opcionais..." })}
                          />
                        </div>
                      </div>

                      <NeedScoreSlider
                        value={formData.needScore ?? 70}
                        onChange={(needScore) => setFormData({ ...formData, needScore })}
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        type="submit"
                        disabled={createMutation.isPending}
                        size="lg"
                        className="flex-1 border border-[#4ADE80]/30 bg-[#4ADE80]/20 text-[#4ADE80] hover:bg-[#4ADE80]/30"
                      >
                        {createMutation.isPending ? t("Creating...", { FR: "Creation...", RU: "Создание...", ES: "Creando...", PT: "Criando..." }) : t("Create subscription", { FR: "Creer l'abonnement", RU: "Создать подписку", ES: "Crear suscripcion", PT: "Criar assinatura" })}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => router.back()}
                        size="lg"
                      >
                        {t("Cancel", { FR: "Annuler", RU: "Отмена", ES: "Cancelar", PT: "Cancelar" })}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
