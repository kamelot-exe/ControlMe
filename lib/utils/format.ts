import type { Currency } from "@/shared/types";

export function formatCurrency(amount: number, currency: Currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

export function formatDateShort(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(d);
}

export function getDaysUntil(date: Date | string): number {
  const d = typeof date === "string" ? new Date(date) : date;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);
  const diff = target.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

import type { Subscription } from "@/shared/types";

export function getUpcomingCharges(subscriptions: Subscription[], days: number = 30): Subscription[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const futureDate = new Date(today);
  futureDate.setDate(futureDate.getDate() + days);

  return subscriptions
    .filter((sub) => sub.isActive)
    .filter((sub) => {
      const chargeDate = typeof sub.nextChargeDate === "string" 
        ? new Date(sub.nextChargeDate) 
        : sub.nextChargeDate;
      chargeDate.setHours(0, 0, 0, 0);
      return chargeDate >= today && chargeDate <= futureDate;
    })
    .sort((a, b) => {
      const dateA = typeof a.nextChargeDate === "string" ? new Date(a.nextChargeDate) : a.nextChargeDate;
      const dateB = typeof b.nextChargeDate === "string" ? new Date(b.nextChargeDate) : b.nextChargeDate;
      return dateA.getTime() - dateB.getTime();
    });
}

