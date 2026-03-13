"use client";

import { useEffect, useState } from "react";
import { Save, Trash2, X } from "lucide-react";
import { useAppUi } from "@/components/ui";
import { translate } from "@/lib/i18n";
import type { Subscription } from "@/shared/types";
import { useDeleteSubscription, useUpdateSubscription } from "@/hooks/use-subscriptions";
import { NeedScoreSlider } from "./NeedScoreSlider";
import {
  SubscriptionNamePicker,
  type CatalogSuggestion,
} from "./SubscriptionNamePicker";
import {
  DEFAULT_SUBSCRIPTION_CATEGORY,
  SERVICE_GROUP_OPTIONS,
} from "./subscription-catalog";
import { formatBillingPeriod } from "@/lib/utils/format";

interface SubscriptionDrawerProps {
  subscription: Subscription | null;
  onClose: () => void;
}

export function SubscriptionDrawer({
  subscription,
  onClose,
}: SubscriptionDrawerProps) {
  const updateSubscription = useUpdateSubscription();
  const deleteSubscription = useDeleteSubscription();
  const { showToast, language } = useAppUi();
  const t = (fallback: string, values?: Record<string, string>) =>
    translate(language, values ?? {}, fallback);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [form, setForm] = useState({
    name: "",
    price: 0,
    category: DEFAULT_SUBSCRIPTION_CATEGORY,
    serviceGroup: "",
    needScore: 70,
    billingPeriod: "MONTHLY" as "DAILY" | "MONTHLY" | "YEARLY",
    nextChargeDate: "",
    isActive: true,
    websiteUrl: "",
    notes: "",
  });

  useEffect(() => {
    if (!subscription) return;

    setForm({
      name: subscription.name ?? "",
      price: subscription.price ?? 0,
      category: subscription.category ?? DEFAULT_SUBSCRIPTION_CATEGORY,
      serviceGroup: subscription.serviceGroup ?? "",
      needScore: subscription.needScore ?? 70,
      billingPeriod: subscription.billingPeriod ?? "MONTHLY",
      nextChargeDate: subscription.nextChargeDate
        ? new Date(subscription.nextChargeDate).toISOString().slice(0, 10)
        : "",
      isActive: subscription.isActive ?? true,
      websiteUrl: subscription.websiteUrl ?? "",
      notes: subscription.notes ?? "",
    });
    setConfirmDelete(false);
  }, [subscription]);

  const isOpen = Boolean(subscription);

  function applyCatalogSuggestion(suggestion: CatalogSuggestion) {
    setForm((value) => ({
      ...value,
      name: `${suggestion.service} (${suggestion.plan})`,
      price: Number.parseFloat(String(suggestion.price)) || value.price,
      billingPeriod: suggestion.billingPeriod as "DAILY" | "MONTHLY" | "YEARLY",
      serviceGroup: suggestion.group || value.serviceGroup,
      needScore: suggestion.defaultNeedScore ?? value.needScore,
      websiteUrl: suggestion.website || value.websiteUrl,
    }));
  }

  async function handleSave() {
    if (!subscription) return;

    try {
      await updateSubscription.mutateAsync({
        id: subscription.id,
        data: {
          name: form.name,
          price: Number(form.price),
          category: form.category,
          serviceGroup: form.serviceGroup || undefined,
          needScore: form.needScore,
          billingPeriod: form.billingPeriod,
          nextChargeDate: form.nextChargeDate
            ? new Date(form.nextChargeDate).toISOString()
            : undefined,
          isActive: form.isActive,
          websiteUrl: form.websiteUrl || undefined,
          notes: form.notes || undefined,
        },
      });
      showToast(t("Changes saved.", { FR: "Modifications enregistrées.", RU: "Изменения сохранены.", UK: "Зміни збережено.", GE: "Änderungen gespeichert.", ES: "Cambios guardados.", PT: "Alterações salvas.", IT: "Modifiche salvate.", PL: "Zmiany zapisane.", TR: "Değişiklikler kaydedildi.", UZ: "O'zgarishlar saqlandi." }));
      onClose();
    } catch {
      // Mutation error is surfaced by the query layer.
    }
  }

  async function handleDelete() {
    if (!subscription) return;

    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    await deleteSubscription.mutateAsync(subscription.id);
    onClose();
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-200 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{
          background: "rgba(8,14,26,0.98)",
          borderLeft: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <h2 className="text-lg font-bold tracking-tight text-[#F9FAFB]">
            {t("Quick edit", { FR: "Modification rapide", RU: "Быстрое редактирование", UK: "Швидке редагування", GE: "Schnell bearbeiten", ES: "Edición rápida", PT: "Edicao rapida", IT: "Modifica rapida", PL: "Szybka edycja", TR: "Hızlı düzenleme", UZ: "Tez tahrirlash" })}
          </h2>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-[#9CA3AF] transition-all duration-150 hover:bg-white/10 hover:text-[#F9FAFB]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
          <SubscriptionNamePicker
            value={form.name}
            onChange={(name) => setForm((value) => ({ ...value, name }))}
            onSelectSuggestion={applyCatalogSuggestion}
            placeholder={t("Pick a service or type your own", { FR: "Choisissez un service ou saisissez le vôtre", RU: "Выберите сервис или введите свой вариант", UK: "Оберіть сервіс або введіть свій варіант", GE: "Dienst wählen oder eigenen Namen eingeben", ES: "Elige un servicio o escribe el tuyo", PT: "Escolha um servico ou digite o seu", IT: "Scegli un servizio o scrivi il tuo", PL: "Wybierz usługę lub wpisz własną", TR: "Bir servis seçin veya kendiniz yazın", UZ: "Servisni tanlang yoki o'zingiz yozing" })}
          />

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">
                {t("Price", { FR: "Prix", RU: "Цена", UK: "Ціна", GE: "Preis", ES: "Precio", PT: "Preco", IT: "Prezzo", PL: "Cena", TR: "Fiyat", UZ: "Narx" })}
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(event) =>
                  setForm((value) => ({
                    ...value,
                    price: parseFloat(event.target.value) || 0,
                  }))
                }
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-[#F9FAFB] transition-all duration-150 focus:border-[#4ADE80]/50 focus:outline-none"
              />
            </div>

            <div className="flex-1">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">
                {t("Billing", { FR: "Facturation", RU: "Период", UK: "Період", GE: "Abrechnung", ES: "Facturación", PT: "Cobranca", IT: "Fatturazione", PL: "Rozliczenie", TR: "Faturalandırma", UZ: "To'lov davri" })}
              </label>
              <select
                value={form.billingPeriod}
                onChange={(event) =>
                  setForm((value) => ({
                    ...value,
                    billingPeriod: event.target.value as "DAILY" | "MONTHLY" | "YEARLY",
                  }))
                }
                className="app-select w-full cursor-pointer rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-[#F9FAFB] transition-all duration-150 focus:border-[#4ADE80]/50 focus:outline-none"
              >
                {(["DAILY", "MONTHLY", "YEARLY"] as const).map((period) => (
                  <option key={period} value={period}>
                    {formatBillingPeriod(period)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">
              {t("Next charge date", { FR: "Date du prochain paiement", RU: "Дата следующего списания", UK: "Дата наступного списання", GE: "Nächstes Abbuchungsdatum", ES: "Fecha del próximo cargo", PT: "Data da próxima cobrança", IT: "Data del prossimo addebito", PL: "Data następnej płatności", TR: "Sonraki ödeme tarihi", UZ: "Keyingi to'lov sanasi" })}
            </label>
            <input
              type="date"
              value={form.nextChargeDate}
              onChange={(event) =>
                setForm((value) => ({ ...value, nextChargeDate: event.target.value }))
              }
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-[#F9FAFB] transition-all duration-150 focus:border-[#4ADE80]/50 focus:outline-none"
              style={{ colorScheme: "dark" }}
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">
              {t("Group", { FR: "Groupe", RU: "Группа", UK: "Група", GE: "Gruppe", ES: "Grupo", PT: "Grupo", IT: "Gruppo", PL: "Grupa", TR: "Grup", UZ: "Guruh" })}
            </label>
            <select
              value={form.serviceGroup}
              onChange={(event) =>
                setForm((value) => ({ ...value, serviceGroup: event.target.value }))
              }
              className="app-select w-full cursor-pointer rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-[#F9FAFB] transition-all duration-150 focus:border-[#4ADE80]/50 focus:outline-none"
            >
              <option value="">
                {t("No group yet", { FR: "Pas encore de groupe", RU: "Группа не выбрана", UK: "Групу ще не вибрано", GE: "Noch keine Gruppe", ES: "Sin grupo todavía", PT: "Sem grupo ainda", IT: "Nessun gruppo ancora", PL: "Brak grupy", TR: "Henüz grup yok", UZ: "Hali guruh yo'q" })}
              </option>
              {SERVICE_GROUP_OPTIONS.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </div>

          <NeedScoreSlider
            value={form.needScore}
            onChange={(needScore) =>
              setForm((value) => ({ ...value, needScore }))
            }
          />

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">
              {t("Website URL", { FR: "URL du site", RU: "Сайт", UK: "Сайт", GE: "Website-URL", ES: "URL del sitio", PT: "URL do site", IT: "URL del sito", PL: "Adres strony", TR: "Site URL", UZ: "Sayt manzili" })}
            </label>
            <input
              type="url"
              value={form.websiteUrl}
              onChange={(event) =>
                setForm((value) => ({ ...value, websiteUrl: event.target.value }))
              }
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-[#F9FAFB] placeholder:text-[#6B7280] transition-all duration-150 focus:border-[#4ADE80]/50 focus:outline-none"
              placeholder="https://example.com"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">
              {t("Notes", { FR: "Notes", RU: "Заметки", UK: "Нотатки", GE: "Notizen", ES: "Notas", PT: "Notas", IT: "Note", PL: "Notatki", TR: "Notlar", UZ: "Izohlar" })}
            </label>
            <textarea
              value={form.notes}
              onChange={(event) => setForm((value) => ({ ...value, notes: event.target.value }))}
              rows={3}
              className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-[#F9FAFB] placeholder:text-[#6B7280] transition-all duration-150 focus:border-[#4ADE80]/50 focus:outline-none"
              placeholder={t("Optional notes...", { FR: "Notes optionnelles...", RU: "Необязательные заметки...", UK: "Необов'язкові нотатки...", GE: "Optionale Notizen...", ES: "Notas opcionales...", PT: "Notas opcionais...", IT: "Note facoltative...", PL: "Opcjonalne notatki...", TR: "İsteğe bağlı notlar...", UZ: "Ixtiyoriy izohlar..." })}
            />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4">
            <div>
              <p className="text-sm font-semibold text-[#F9FAFB]">
                {t("Active", { FR: "Actif", RU: "Активна", UK: "Активна", GE: "Aktiv", ES: "Activa", PT: "Ativa", IT: "Attiva", PL: "Aktywna", TR: "Aktif", UZ: "Faol" })}
              </p>
              <p className="mt-0.5 text-xs text-[#9CA3AF]">
                {t("Toggle subscription status", { FR: "Changer le statut", RU: "Переключить статус подписки", UK: "Перемкнути статус підписки", GE: "Status umschalten", ES: "Cambiar estado", PT: "Alterar status", IT: "Cambia stato", PL: "Przełącz status", TR: "Durumu değiştir", UZ: "Holatni o'zgartirish" })}
              </p>
            </div>
            <button
              onClick={() => setForm((value) => ({ ...value, isActive: !value.isActive }))}
              className={`relative h-6 w-12 rounded-full transition-colors duration-200 ${
                form.isActive ? "bg-[#4ADE80]" : "bg-white/15"
              }`}
            >
              <span
                className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                  form.isActive ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        <div className="space-y-3 border-t border-white/10 px-6 py-5">
          <button
            onClick={handleSave}
            disabled={updateSubscription.isPending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#4ADE80] py-3 text-sm font-bold text-[#060B16] transition-all duration-150 hover:bg-[#4ADE80]/90 disabled:opacity-50"
          >
            <Save size={15} />
            {updateSubscription.isPending
              ? t("Saving...", { FR: "Enregistrement...", RU: "Сохранение...", UK: "Збереження...", GE: "Speichern...", ES: "Guardando...", PT: "Salvando...", IT: "Salvataggio...", PL: "Zapisywanie...", TR: "Kaydediliyor...", UZ: "Saqlanmoqda..." })
              : t("Save changes", { FR: "Enregistrer", RU: "Сохранить изменения", UK: "Зберегти зміни", GE: "Änderungen speichern", ES: "Guardar cambios", PT: "Salvar alterações", IT: "Salva modifiche", PL: "Zapisz zmiany", TR: "Değişiklikleri kaydet", UZ: "O'zgarishlarni saqlash" })}
          </button>

          <button
            onClick={handleDelete}
            disabled={deleteSubscription.isPending}
            className={`flex w-full items-center justify-center gap-2 rounded-xl border py-3 text-sm font-semibold transition-all duration-150 disabled:opacity-50 ${
              confirmDelete
                ? "border-[#F97373]/40 bg-[#F97373]/15 text-[#F97373]"
                : "border-white/10 text-[#9CA3AF] hover:border-[#F97373]/30 hover:bg-[#F97373]/8 hover:text-[#F97373]"
            }`}
          >
            <Trash2 size={15} />
            {deleteSubscription.isPending
              ? t("Deleting...", { FR: "Suppression...", RU: "Удаление...", UK: "Видалення...", GE: "Löschen...", ES: "Eliminando...", PT: "Excluindo...", IT: "Eliminazione...", PL: "Usuwanie...", TR: "Siliniyor...", UZ: "O'chirilmoqda..." })
              : confirmDelete
                ? t("Tap again to confirm delete", { FR: "Touchez encore pour confirmer", RU: "Нажмите еще раз для подтверждения", UK: "Натисніть ще раз для підтвердження", GE: "Erneut drücken zum Bestätigen", ES: "Pulsa otra vez para confirmar", PT: "Toque novamente para confirmar", IT: "Tocca di nuovo per confermare", PL: "Kliknij ponownie, aby potwierdzić", TR: "Onaylamak için tekrar dokunun", UZ: "Tasdiqlash uchun yana bosing" })
                : t("Delete subscription", { FR: "Supprimer l'abonnement", RU: "Удалить подписку", UK: "Видалити підписку", GE: "Abo löschen", ES: "Eliminar suscripción", PT: "Excluir assinatura", IT: "Elimina abbonamento", PL: "Usuń subskrypcję", TR: "Aboneliği sil", UZ: "Obunani o'chirish" })}
          </button>
        </div>
      </div>
    </>
  );
}
