import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type { ApiResponse, PaginatedResponse } from "@/shared/types";

export function useApiQuery<T>(
  key: string[],
  endpoint: string,
  options?: {
    enabled?: boolean;
    staleTime?: number;
  }
) {
  return useQuery<ApiResponse<T>>({
    queryKey: key,
    queryFn: () => apiClient.get<T>(endpoint),
    enabled: options?.enabled,
    staleTime: options?.staleTime,
  });
}

export function usePaginatedQuery<T>(
  key: string[],
  endpoint: string,
  params?: Record<string, string | number>,
  options?: {
    enabled?: boolean;
  }
) {
  return useQuery<ApiResponse<PaginatedResponse<T>>>({
    queryKey: [...key, params],
    queryFn: () => apiClient.getPaginated<T>(endpoint, params),
    enabled: options?.enabled,
  });
}

export function useApiMutation<TData, TVariables = unknown>(
  endpoint: string,
  method: "POST" | "PUT" | "DELETE" = "POST",
  options?: {
    invalidateQueries?: string[][];
    onSuccess?: (data: ApiResponse<TData>) => void;
  }
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: TVariables) => {
      switch (method) {
        case "POST":
          return apiClient.post<TData>(endpoint, variables);
        case "PUT":
          return apiClient.put<TData>(endpoint, variables);
        case "DELETE":
          return apiClient.delete<TData>(endpoint);
        default:
          throw new Error(`Unsupported method: ${method}`);
      }
    },
    onSuccess: (data) => {
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: key });
        });
      }
      options?.onSuccess?.(data);
    },
  });
}

