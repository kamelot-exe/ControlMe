"use client";

import { type ReactNode } from "react";
import { Button } from "./Button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-8 text-center space-y-4 animate-fade-in",
        className
      )}
    >
      {icon ? <div className="text-6xl opacity-60 mb-2">{icon}</div> : null}
      <h3 className="text-xl font-semibold text-[#F9FAFB]">{title}</h3>
      {description ? <p className="text-sm text-[#C7CDD3] max-w-md leading-relaxed">{description}</p> : null}
      {action ? <Button onClick={action.onClick} className="mt-4">{action.label}</Button> : null}
    </div>
  );
}
