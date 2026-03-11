import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type { ApiResponsePublicUser, PublicUser, RegisterDto, LoginDto, ApiResponse } from "@/shared/types";
import { useRouter } from "next/navigation";

export function useMe() {
  return useQuery<ApiResponsePublicUser>({
    queryKey: ["auth", "me"],
    queryFn: () => apiClient.get<PublicUser>("/auth/me"),
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginDto) => apiClient.login(data.email, data.password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      router.push("/dashboard");
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: RegisterDto) =>
      apiClient.register(data.email, data.password, data.currency),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      router.push("/dashboard");
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<ApiResponse<{ message: string }>, Error>({
    mutationFn: () => {
      apiClient.logout();
      return Promise.resolve({ data: { message: "Logged out" } });
    },
    onSuccess: () => {
      queryClient.clear();
      router.push("/");
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<ApiResponse<{ success: boolean }>, Error>({
    mutationFn: () => apiClient.delete<{ success: boolean }>("/auth/account"),
    onSuccess: () => {
      queryClient.clear();
      router.push("/");
    },
  });
}

export function useSetBudgetLimit() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<PublicUser>, Error, { budgetLimit: number | null }>({
    mutationFn: (data) =>
      apiClient.patch<PublicUser>("/auth/budget-limit", { budgetLimit: data.budgetLimit }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
}

export function useChangePassword() {
  return useMutation<
    ApiResponse<{ success: boolean }>,
    Error,
    { currentPassword: string; newPassword: string }
  >({
    mutationFn: (data) =>
      apiClient.patch<{ success: boolean }>("/auth/password", data),
  });
}

export function useChangeCurrency() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<PublicUser>, Error, { currency: string }>({
    mutationFn: (data) =>
      apiClient.patch<PublicUser>("/auth/currency", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
}

export function useForgotPassword() {
  return useMutation<ApiResponse<{ sent: boolean; token?: string }>, Error, { email: string }>({
    mutationFn: (data) =>
      apiClient.post<{ sent: boolean; token?: string }>("/auth/forgot-password", data),
  });
}

export function useResetPassword() {
  return useMutation<
    ApiResponse<{ success: boolean }>,
    Error,
    { token: string; password: string }
  >({
    mutationFn: (data) =>
      apiClient.post<{ success: boolean }>("/auth/reset-password", data),
  });
}
