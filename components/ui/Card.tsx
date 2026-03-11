import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  style?: React.CSSProperties;
  accent?: "green" | "blue" | "red" | "purple";
}

export function Card({ children, className, hover = true, style, accent }: CardProps) {
  const accentColors: Record<string, string> = {
    green: "border-l-[#4ADE80]",
    blue: "border-l-[#38BDF8]",
    red: "border-l-[#F87171]",
    purple: "border-l-[#8B5CF6]",
  };

  return (
    <div
      className={cn(
        "glass rounded-3xl p-6",
        hover && "glass-hover",
        accent && "border-l-2",
        accent && accentColors[accent],
        className
      )}
      style={style}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={cn("mb-5 space-y-1", className)}>{children}</div>
  );
}

interface CardTitleProps {
  children: ReactNode;
  className?: string;
}

export function CardTitle({ children, className }: CardTitleProps) {
  return (
    <h3 className={cn("text-xl font-semibold text-[#F9FAFB] tracking-tight", className)}>
      {children}
    </h3>
  );
}

interface CardDescriptionProps {
  children: ReactNode;
  className?: string;
}

export function CardDescription({ children, className }: CardDescriptionProps) {
  return (
    <p className={cn("text-sm text-[#9CA3AF]", className)}>{children}</p>
  );
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return <div className={cn("space-y-4", className)}>{children}</div>;
}
