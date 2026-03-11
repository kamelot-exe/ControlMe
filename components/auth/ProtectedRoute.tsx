"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shield } from "lucide-react";
import { useMe } from "@/hooks/use-auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const { data: userData, isLoading } = useMe();

  useEffect(() => {
    if (!isLoading && !userData?.data) {
      router.push("/login");
    }
  }, [userData, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="glass max-w-sm w-full rounded-3xl p-8 text-center space-y-4 animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-[#4ADE80]/10 border border-[#4ADE80]/20 flex items-center justify-center mx-auto">
            <Shield size={24} className="text-[#4ADE80]" />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-semibold text-[#F9FAFB]">Checking your session</p>
            <p className="text-sm text-[#9CA3AF]">
              Loading your workspace and account permissions.
            </p>
          </div>
          <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
            <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-[#4ADE80] to-[#38BDF8] animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!userData?.data) {
    return null;
  }

  return <>{children}</>;
}
