import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type { NotificationSettings, ApiResponse } from "@/shared/types";

export function useNotificationSettings() {
  return useQuery<ApiResponse<NotificationSettings>>({
    queryKey: ["settings", "notifications"],
    queryFn: () => apiClient.get<NotificationSettings>("/settings/notifications"),
  });
}

export function useUpdateNotificationSettings() {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<NotificationSettings>,
    Error,
    Partial<NotificationSettings>
  >({
    mutationFn: (data: Partial<NotificationSettings>) =>
      apiClient.put<NotificationSettings>("/settings/notifications", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", "notifications"] });
    },
  });
}

export function useExportPDF() {
  return useMutation<ApiResponse<{ message: string }>, Error>({
    mutationFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/export/pdf`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to export PDF");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `controlme-export-${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      return { data: { message: "PDF exported" } };
    },
  });
}

