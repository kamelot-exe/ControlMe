import type { Currency } from "@/shared/types";

export interface AuthenticatedUser {
  id: string;
  email: string;
  currency: Currency;
  createdAt: Date | string;
}
