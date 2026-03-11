import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", loading, disabled, children, ...props }, ref) => {
    const isDisabled = disabled || loading;

    return (
      <button
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition-all duration-[120ms] ease-out",
          "focus:outline-none focus:ring-2 focus:ring-[#4ADE80]/50 focus:ring-offset-2 focus:ring-offset-transparent",
          "active:scale-[0.97]",
          "disabled:opacity-40 disabled:pointer-events-none",
          // Default = primary green (solid)
          variant === "default" && [
            "bg-[#4ADE80] text-[#060B16]",
            "hover:bg-[#4ADE80]/90",
            "hover:shadow-[0_0_20px_rgba(74,222,128,0.35)]",
          ],
          // Primary alias
          variant === "primary" && [
            "bg-[#4ADE80] text-[#060B16]",
            "hover:bg-[#4ADE80]/90",
            "hover:shadow-[0_0_20px_rgba(74,222,128,0.35)]",
          ],
          // Secondary / outline = glass
          (variant === "outline" || variant === "secondary") && [
            "bg-white/[0.06] border border-white/[0.15] text-[#F9FAFB]",
            "backdrop-blur-[20px]",
            "hover:bg-white/[0.10] hover:border-white/[0.25]",
          ],
          // Danger
          variant === "danger" && [
            "bg-[#F87171]/10 border border-[#F87171]/30 text-[#F87171]",
            "hover:bg-[#F87171]/20 hover:border-[#F87171]/50",
          ],
          // Ghost
          variant === "ghost" && [
            "text-[#9CA3AF]",
            "hover:text-[#F9FAFB] hover:bg-white/5",
          ],
          // Sizes
          size === "sm" && "h-9 px-4 text-sm",
          size === "md" && "h-11 px-6 text-sm",
          size === "lg" && "h-13 px-8 text-base",
          className
        )}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {loading && (
          <svg
            className="w-4 h-4 animate-spin shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
