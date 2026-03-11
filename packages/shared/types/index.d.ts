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
export type BillingPeriod = "DAILY" | "MONTHLY" | "YEARLY";
export type Currency = "USD" | "EUR" | "GBP" | "RUB" | "JPY";
export interface User {
    id: string;
    email: string;
    passwordHash: string;
    currency: Currency;
    createdAt: Date | string;
}
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
    notes?: string;
    isActive: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    usage?: {
        lastConfirmedUseAt: Date | string;
    } | null;
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
