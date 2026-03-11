"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "./Button";
import { Card, CardContent } from "./Card";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <Card className={cn("animate-fade-in border border-[#F97373]/20 bg-[#F97373]/[0.04]", className)}>
      <CardContent className="py-12">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#F97373]/12 border border-[#F97373]/20 flex items-center justify-center">
            <AlertTriangle size={24} className="text-[#F97373]" />
          </div>
          <h3 className="text-xl font-semibold text-[#F9FAFB]">{title}</h3>
          <p className="text-sm text-[#C7CDD3] max-w-md leading-relaxed">{message}</p>
          {onRetry ? (
            <Button onClick={onRetry} variant="outline" className="mt-4 border-white/15">
              Try Again
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
