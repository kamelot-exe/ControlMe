import { cn } from "@/lib/utils";
import { type InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="text-sm font-medium text-[#F9FAFB]/80">
            {label}
          </label>
        )}
        <input
          className={cn(
            "w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-[#F9FAFB] placeholder:text-[#9CA3AF] focus-ring transition-all duration-150",
            "hover:bg-white/10 focus:bg-white/10",
            error && "border-[#F97373]/50 focus:ring-[#F97373]/50",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-sm text-[#F97373]">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
