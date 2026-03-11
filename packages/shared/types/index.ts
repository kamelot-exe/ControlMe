// Shared types for ControlMe
// Used across backend and web app

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// Domain Models

export type BillingPeriod = "MONTHLY" | "YEARLY";

export type Currency =
  | "USD"
  | "EUR"
  | "GBP"
  | "RUB"
  | "JPY"
  | "CAD"
  | "AUD"
  | "CHF"
  | "CNY"
  | "INR";

export type UsageStatus = "active" | "at_risk" | "unused";

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  currency: Currency;
  createdAt: Date | string;
}

export interface PublicUser {
  id: string;
  email: string;
  currency: Currency;
  budgetLimit?: number | null;
  createdAt: Date | string;
}

export type ApiResponsePublicUser = ApiResponse<PublicUser>;

export interface Subscription {
  id: string;
  userId: string;
  name: string;
  price: number; // Decimal as number
  billingPeriod: BillingPeriod;
  nextChargeDate: Date | string;
  category: string;
  websiteUrl?: string | null;
  notes?: string;
  isActive: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  usage?: { lastConfirmedUseAt: Date | string } | null;
}

export interface SubscriptionUsage {
  id: string;
  subscriptionId: string;
  lastConfirmedUseAt: Date | string;
}

export interface NotificationSettings {
  id: string;
  userId: string;
  prechargeReminderDays: number;
  smartAlertsEnabled: boolean;
}

// DTOs for API

export interface CreateSubscriptionDto {
  name: string;
  price: number;
  billingPeriod: BillingPeriod;
  nextChargeDate: Date | string;
  category: string;
  websiteUrl?: string;
  notes?: string;
}

export interface UpdateSubscriptionDto {
  name?: string;
  price?: number;
  billingPeriod?: BillingPeriod;
  nextChargeDate?: Date | string;
  category?: string;
  websiteUrl?: string;
  notes?: string;
  isActive?: boolean;
}

export interface RegisterDto {
  email: string;
  password: string;
  currency?: Currency;
}

export interface LoginDto {
  email: string;
  password: string;
}

// Analytics

export interface MonthlyAnalytics {
  totalMonthlyCost: number;
  totalYearlyCost: number;
  activeSubscriptions: number;
  categoryBreakdown: CategoryBreakdown[];
}

export interface CategoryBreakdown {
  category: string;
  total: number;
  count: number;
}

export interface SavingsSummary {
  monthlySavings: number;
  yearlySavings: number;
  unusedCount: number;
}

export interface SpendingHistory {
  month: string;
  total: number;
}
