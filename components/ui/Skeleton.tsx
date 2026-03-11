"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ className, width, height }: SkeletonProps) {
  return (
    <div
      className={cn("skeleton rounded-xl", className)}
      style={{ width, height }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="glass rounded-2xl p-8 space-y-4">
      <Skeleton height={24} width="60%" />
      <Skeleton height={16} width="40%" />
      <div className="space-y-2 pt-4">
        <Skeleton height={12} width="100%" />
        <Skeleton height={12} width="80%" />
      </div>
    </div>
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={16}
          width={i === lines - 1 ? "60%" : "100%"}
        />
      ))}
    </div>
  );
}

