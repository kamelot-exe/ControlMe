"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ConnectionError } from "@/components/errors/ConnectionError";
import { useLogin } from "@/hooks/use-auth";
import { isConnectionError } from "@/hooks/use-api-error";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const login = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await login.mutateAsync({ email, password });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 md:p-16 lg:p-24">
      <div className="mx-auto max-w-md w-full animate-scale-in">
        <Card className="glass-hover">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-3xl font-semibold tracking-tight">Welcome Back</CardTitle>
            <CardDescription className="text-base">
              Sign in to your ControlMe account
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
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="focus-ring transition-all duration-200 focus:scale-[1.01]"
              />
              
              <Button 
                type="submit" 
                className="w-full bg-[#4ADE80]/20 hover:bg-[#4ADE80]/30 text-[#4ADE80] border border-[#4ADE80]/30" 
                size="lg" 
                disabled={login.isPending}
              >
                {login.isPending ? "Signing in..." : "Sign In"}
              </Button>
            </form>
            
            <div className="mt-6 space-y-3 text-center">
              <p className="text-sm text-[#9CA3AF]">
                <Link
                  href="/forgot-password"
                  className="text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors"
                >
                  Forgot your password?
                </Link>
              </p>
              <p className="text-sm text-[#9CA3AF]">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="text-[#4ADE80] hover:text-[#4ADE80]/80 transition-colors underline underline-offset-4"
                >
                  Register
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
