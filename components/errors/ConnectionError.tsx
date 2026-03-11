"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface ConnectionErrorProps {
  onRetry?: () => void;
  className?: string;
}

export function ConnectionError({ onRetry, className }: ConnectionErrorProps) {
  return (
    <Card className={cn("glass-hover border-red-500/30 bg-red-500/5 animate-fade-in", className)}>
      <CardHeader>
        <CardTitle className="text-red-400">Connection Error</CardTitle>
        <CardDescription>Unable to connect to the server</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-foreground/70">
          Please ensure the backend server is running on <code className="px-2 py-1 glass-light rounded text-xs">http://localhost:3001</code>
        </p>
        <div className="space-y-2 text-xs text-foreground/60">
          <p>To start the backend:</p>
          <code className="block p-3 glass-light rounded-lg font-mono">
            cd apps/backend
            <br />
            npm run dev
          </code>
        </div>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" className="w-full">
            Retry Connection
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
