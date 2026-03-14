export const SUPPORTED_BILLING_PERIODS = [
  "DAILY",
  "MONTHLY",
  "YEARLY",
] as const;

export const SUPPORTED_CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "RUB",
  "JPY",
  "CAD",
  "AUD",
  "CHF",
  "CNY",
  "INR",
] as const;

export const NOTIFICATION_DELIVERY_TYPES = [
  "RENEWAL",
  "UNUSED",
  "WEEKLY_DIGEST",
  "MONTHLY_DIGEST",
] as const;

export const NOTIFICATION_DELIVERY_STATUSES = [
  "PENDING",
  "SENT",
  "SKIPPED",
  "FAILED",
] as const;

export type SupportedBillingPeriod =
  (typeof SUPPORTED_BILLING_PERIODS)[number];
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];
export type NotificationDeliveryType =
  (typeof NOTIFICATION_DELIVERY_TYPES)[number];
export type NotificationDeliveryStatus =
  (typeof NOTIFICATION_DELIVERY_STATUSES)[number];
