import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type {
  Subscription,
  CreateSubscriptionDto,
  UpdateSubscriptionDto,
  ApiResponse,
} from "@/shared/types";

export function useSubscriptions() {
  return useQuery<ApiResponse<Subscription[]>>({
    queryKey: ["subscriptions"],
    queryFn: () => apiClient.get<Subscription[]>("/subscriptions"),
  });
}

export function useSubscription(id: string) {
  return useQuery<ApiResponse<Subscription>>({
    queryKey: ["subscriptions", id],
    queryFn: () => apiClient.get<Subscription>(`/subscriptions/${id}`),
    enabled: !!id,
  });
}

export function useCreateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSubscriptionDto) =>
      apiClient.post<Subscription>("/subscriptions", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

export function useUpdateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateSubscriptionDto }) => {
      try {
        return await apiClient.patch<Subscription>(`/subscriptions/${id}`, data);
      } catch {
        // Backward compatibility if backend only supports PUT in some environments.
        return apiClient.put<Subscription>(`/subscriptions/${id}`, data);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["subscriptions", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

export function useDeleteSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete<{ message: string }>(`/subscriptions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

