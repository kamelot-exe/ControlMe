import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type { MonthlyAnalytics, ApiResponse, SavingsSummary, SpendingHistory } from "@/shared/types";

export function useMonthlyAnalytics() {
  return useQuery<ApiResponse<MonthlyAnalytics>>({
    queryKey: ["analytics", "monthly"],
    queryFn: () => apiClient.get<MonthlyAnalytics>("/analytics/monthly"),
  });
}

export function useCategoryAnalytics() {
  return useQuery<ApiResponse<{ category: string; total: number; count: number }[]>>({
    queryKey: ["analytics", "categories"],
    queryFn: () => apiClient.get<{ category: string; total: number; count: number }[]>("/analytics/categories"),
  });
}

export function useSavingsSummary() {
  return useQuery<ApiResponse<SavingsSummary>>({
    queryKey: ["analytics", "savings"],
    queryFn: () => apiClient.get<SavingsSummary>("/analytics/savings"),
  });
}

export function useSpendingHistory() {
  return useQuery<ApiResponse<SpendingHistory[]>>({
    queryKey: ["analytics", "history"],
    queryFn: () => apiClient.get<SpendingHistory[]>("/analytics/history"),
  });
}
