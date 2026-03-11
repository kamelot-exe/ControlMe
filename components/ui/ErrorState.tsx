"use client";

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
    <Card className={cn("animate-fade-in", className)}>
      <CardContent className="py-12">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="text-5xl mb-2">⚠️</div>
          <h3 className="text-xl font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-foreground/60 max-w-md">{message}</p>
          {onRetry && (
            <Button onClick={onRetry} variant="outline" className="mt-4">
              Try Again
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

