"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-foreground/60">Loading...</div>
      </div>
    );
  }

  if (!userData?.data) {
    return null;
  }

  return <>{children}</>;
}
