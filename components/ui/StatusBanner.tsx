"use client";

import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, Info, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

type StatusTone = "success" | "error" | "info" | "neutral";

interface StatusBannerProps {
  tone?: StatusTone;
  title?: string;
  children: ReactNode;
  className?: string;
}

const toneConfig: Record<
  StatusTone,
  { icon: typeof Info; wrapper: string; iconClass: string; titleClass: string; textClass: string }
> = {
  success: {
    icon: CheckCircle2,
    wrapper: "border-[#4ADE80]/25 bg-[#4ADE80]/8",
    iconClass: "text-[#4ADE80]",
    titleClass: "text-[#F9FAFB]",
    textClass: "text-[#C7D2D9]",
  },
  error: {
    icon: AlertTriangle,
    wrapper: "border-[#F97373]/25 bg-[#F97373]/8",
    iconClass: "text-[#F97373]",
    titleClass: "text-[#F9FAFB]",
    textClass: "text-[#D8C3C3]",
  },
  info: {
    icon: Sparkles,
    wrapper: "border-[#38BDF8]/25 bg-[#38BDF8]/8",
    iconClass: "text-[#38BDF8]",
    titleClass: "text-[#F9FAFB]",
    textClass: "text-[#C6D3DC]",
  },
  neutral: {
    icon: Info,
    wrapper: "border-white/10 bg-white/5",
    iconClass: "text-[#9CA3AF]",
    titleClass: "text-[#F9FAFB]",
    textClass: "text-[#C6CDD3]",
  },
};

export function StatusBanner({
  tone = "neutral",
  title,
  children,
  className,
}: StatusBannerProps) {
  const config = toneConfig[tone];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "rounded-2xl border px-4 py-3.5 animate-fade-in",
        config.wrapper,
        className
      )}
    >
      <div className="flex items-start gap-3">
        <Icon size={16} className={cn("mt-0.5 shrink-0", config.iconClass)} />
        <div className="min-w-0">
          {title ? <p className={cn("text-sm font-semibold mb-1", config.titleClass)}>{title}</p> : null}
          <div className={cn("text-sm leading-relaxed", config.textClass)}>{children}</div>
        </div>
      </div>
    </div>
  );
}
