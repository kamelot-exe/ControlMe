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
      {icon && (
        <div className="text-6xl opacity-40 mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-xl font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="text-sm text-foreground/60 max-w-md">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick} className="mt-4">
          {action.label}
        </Button>
      )}
    </div>
  );
}

