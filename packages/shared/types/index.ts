// Shared types for ControlMe
// Used across backend and web app

export interface ApiError {
  code: string;
  details?: unknown;
  message: string;
  statusCode: number;
}

export interface ApiResponseMeta {
  cached?: boolean;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  page?: number;
  pageSize?: number;
  total?: number;
  totalPages?: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: ApiError;
  meta?: ApiResponseMeta;
}

export interface ApiErrorResponse {
  data: null;
  message: string;
  error: ApiError;
  meta?: ApiResponseMeta;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Domain Models

export type BillingPeriod = "DAILY" | "MONTHLY" | "YEARLY";

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
export type SubscriptionReviewStatus =
  | "keep"
  | "review"
  | "cancel_candidate";

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

export interface AuthSession {
  user: PublicUser;
  token: string;
  refreshToken: string;
  tokenExpiresIn: string;
  refreshTokenExpiresIn: string;
}

export type ApiResponsePublicUser = ApiResponse<PublicUser>;

export interface Subscription {
  id: string;
  userId: string;
  name: string;
  price: number;
  billingPeriod: BillingPeriod;
  nextChargeDate: Date | string;
  category: string;
  serviceGroup?: string | null;
  needScore: number;
  websiteUrl?: string | null;
  notes?: string | null;
  isActive: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  usage?: { lastConfirmedUseAt: Date | string | null } | null;
}

export interface SubscriptionUsage {
  id: string;
  subscriptionId: string;
  lastConfirmedUseAt: Date | string | null;
}

export interface NotificationSettings {
  id: string;
  userId: string;
  prechargeReminderDays: number;
  smartAlertsEnabled: boolean;
  renewalEmailsEnabled: boolean;
  unusedEmailsEnabled: boolean;
  weeklyDigestEnabled: boolean;
  monthlyDigestEnabled: boolean;
  weeklyDigestDay: number;
  monthlyDigestDay: number;
  digestTime?: string | null;
  timeZone?: string | null;
}

export interface CatalogEntry {
  id: string;
  service: string;
  group: string;
  subcategory: string;
  similarityGroup: string;
  region: string;
  country: string;
  plan: string;
  price: number;
  currency: string;
  billingPeriod: BillingPeriod;
  website: string;
  logoHint: string;
  priority: string;
  defaultNeedScore: number;
  planRank: number;
  isFamilyPlan: boolean;
  isStudentPlan: boolean;
  isBusinessPlan: boolean;
}

export interface CatalogMatch extends CatalogEntry {
  confidence: number;
}

export interface CatalogSummary {
  count: number;
  regions: string[];
  groups: string[];
  countries: string[];
}

// DTOs for API

export interface CreateSubscriptionDto {
  name: string;
  price: number;
  billingPeriod: BillingPeriod;
  nextChargeDate: Date | string;
  category: string;
  serviceGroup?: string;
  needScore?: number;
  websiteUrl?: string;
  notes?: string;
}

export interface UpdateSubscriptionDto {
  name?: string;
  price?: number;
  billingPeriod?: BillingPeriod;
  nextChargeDate?: Date | string;
  category?: string;
  serviceGroup?: string;
  needScore?: number;
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

export interface SubscriptionImportResult {
  imported: number;
  errors: string[];
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

export interface UpcomingCharge {
  subscriptionId: string;
  name: string;
  amount: number;
  billingPeriod: BillingPeriod;
  nextChargeDate: Date | string;
  daysUntil: number;
}

export interface SubscriptionOverview {
  totalSubscriptions: number;
  activeSubscriptions: number;
  totalMonthlyCost: number;
  upcomingCharges: UpcomingCharge[];
  inactiveCandidates: number;
}

export interface AnalyticsOverview {
  monthly: MonthlyAnalytics;
  savings: SavingsSummary;
  history: SpendingHistory[];
  upcomingCharges: UpcomingCharge[];
  topCategories: CategoryBreakdown[];
}

export type NotificationAlertType =
  | "PRECHARGE"
  | "UNUSED"
  | "SPENDING_INCREASE"
  | "DUPLICATE";

export interface NotificationAlert {
  type: NotificationAlertType;
  message: string;
  subscriptionId?: string;
  daysUntil?: number;
  percent?: number;
}

export interface NotificationDeliverySummary {
  id: string;
  type: string;
  status: string;
  subscriptionId?: string | null;
  scheduledFor?: Date | string | null;
  sentAt?: Date | string | null;
  createdAt: Date | string;
  payload?: unknown;
}

export interface ExportPreview {
  generatedAt: Date | string;
  currency: string;
  summary: MonthlyAnalytics;
  savings: SavingsSummary;
  subscriptions: Subscription[];
}
