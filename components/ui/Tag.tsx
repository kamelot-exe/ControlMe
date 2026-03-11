import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

interface TagProps {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "info" | "purple";
  size?: "sm" | "md";
  className?: string;
}

export function Tag({
  children,
  variant = "default",
  size = "md",
  className,
}: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg font-medium",
        {
          "bg-white/10 text-foreground": variant === "default",
          "bg-green-500/20 text-green-400": variant === "success",
          "bg-yellow-500/20 text-yellow-400": variant === "warning",
          "bg-red-500/20 text-red-400": variant === "error",
          "bg-blue-500/20 text-blue-400": variant === "info",
          "bg-purple-500/20 text-purple-400": variant === "purple",
          "px-2 py-1 text-xs": size === "sm",
          "px-3 py-1.5 text-sm": size === "md",
        },
        className
      )}
    >
      {children}
    </span>
  );
}

