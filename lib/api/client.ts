import type { ApiResponse, PaginatedResponse } from "@/shared/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

class ApiClient {
  private refreshPromise: Promise<string> | null = null;

  private getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("auth_token");
  }

  private setToken(token: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem("auth_token", token);
  }

  clearToken(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem("auth_token");
  }

  private async doRefresh(): Promise<string> {
    if (this.refreshPromise) return this.refreshPromise;

    this.refreshPromise = (async () => {
      const currentToken = this.getToken();
      if (!currentToken) throw new Error("No token to refresh");

      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentToken}`,
        },
      });

      if (!res.ok) throw new Error("Refresh failed");

      const data = await res.json();
      const newToken: string | undefined = data?.data?.token;
      if (!newToken) throw new Error("No token in refresh response");

      this.setToken(newToken);
      return newToken;
    })().finally(() => {
      this.refreshPromise = null;
    });

    return this.refreshPromise;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getToken();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options?.headers as Record<string, string> || {}),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    let response: Response;
    try {
      response = await fetch(url, { ...options, headers });
    } catch (error) {
      if (error instanceof TypeError) {
        if (error.message.includes("fetch") || error.message.includes("Failed to fetch")) {
          throw new Error(
            "Unable to connect to the server. Please ensure the backend is running on http://localhost:3001"
          );
        }
      }
      throw error;
    }

    // ── Auto-refresh on 401 ──────────────────────────────────────────────
    if (response.status === 401 && endpoint !== "/auth/refresh" && endpoint !== "/auth/login") {
      try {
        const newToken = await this.doRefresh();
        headers["Authorization"] = `Bearer ${newToken}`;
        response = await fetch(url, { ...options, headers });
      } catch {
        this.clearToken();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        throw new Error("Session expired. Please log in again.");
      }
    }
    // ────────────────────────────────────────────────────────────────────

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: response.statusText };
      }
      const errorMessage = errorData.message || errorData.error || `API Error: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    try {
      return await response.json();
    } catch (error) {
      throw new Error("Invalid response format from server");
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  // Auth helpers
  async login(email: string, password: string) {
    const response = await this.post<{ user: any; token: string }>("/auth/login", {
      email,
      password,
    });
    if (response.data?.token) {
      this.setToken(response.data.token);
    }
    return response;
  }

  async register(email: string, password: string, currency?: string) {
    const response = await this.post<{ user: any; token: string }>("/auth/register", {
      email,
      password,
      currency,
    });
    if (response.data?.token) {
      this.setToken(response.data.token);
    }
    return response;
  }

  logout() {
    this.clearToken();
  }

  async getPaginated<T>(
    endpoint: string,
    params?: Record<string, string | number>
  ): Promise<ApiResponse<PaginatedResponse<T>>> {
    const queryString = params
      ? `?${new URLSearchParams(
          Object.entries(params).map(([k, v]) => [k, String(v)])
        ).toString()}`
      : "";
    return this.get<PaginatedResponse<T>>(`${endpoint}${queryString}`);
  }
}

export const apiClient = new ApiClient();

