"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ConnectionError } from "@/components/errors/ConnectionError";
import { useRegister } from "@/hooks/use-auth";
import { isConnectionError } from "@/hooks/use-api-error";
import type { Currency } from "@/shared/types";

export default function RegisterPage() {
  const router = useRouter();
  const register = useRegister();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [currency, setCurrency] = useState<Currency>("USD");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await register.mutateAsync({ email, password, currency });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to register");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 md:p-16 lg:p-24">
      <div className="mx-auto max-w-md w-full animate-scale-in">
        <Card className="glass-hover">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-3xl font-semibold tracking-tight">Get Started</CardTitle>
            <CardDescription className="text-base">
              Create your ControlMe account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && isConnectionError(new Error(error)) ? (
                <ConnectionError onRetry={() => setError("")} />
              ) : error ? (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm animate-fade-in">
                  {error}
                </div>
              ) : null}
              
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="focus-ring transition-all duration-200 focus:scale-[1.01]"
              />
              
              <Input
                label="Password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="focus-ring transition-all duration-200 focus:scale-[1.01]"
              />
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#F9FAFB]/80">
                  Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as Currency)}
                  className="app-select w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-[#F9FAFB] focus-ring transition-all duration-200 hover:bg-white/10 focus:scale-[1.01]"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="RUB">RUB - Russian Ruble</option>
                  <option value="JPY">JPY - Japanese Yen</option>
                </select>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-[#4ADE80]/20 hover:bg-[#4ADE80]/30 text-[#4ADE80] border border-[#4ADE80]/30" 
                size="lg" 
                disabled={register.isPending}
              >
                {register.isPending ? "Creating account..." : "Create Account"}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-[#9CA3AF]">
                Already have an account?{" "}
                <Link 
                  href="/login" 
                  className="text-[#4ADE80] hover:text-[#4ADE80]/80 transition-colors underline underline-offset-4"
                >
                  Login
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
