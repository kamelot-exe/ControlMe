import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/shared/types";

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

export function useSmartAlerts() {
  return useQuery<ApiResponse<{ alerts: NotificationAlert[] }>>({
    queryKey: ["notifications", "smart"],
    queryFn: () =>
      apiClient.get<{ alerts: NotificationAlert[] }>("/notifications/smart"),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
}
