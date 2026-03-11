"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { SUBSCRIPTION_NAME_OPTIONS } from "./subscription-catalog";

interface SubscriptionNamePickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
}

export function SubscriptionNamePicker({
  value,
  onChange,
  label = "Name",
  placeholder = "Start typing a service name",
  required,
}: SubscriptionNamePickerProps) {
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const normalizedValue = value.trim().toLowerCase();

  const filteredOptions = useMemo(() => {
    const options = normalizedValue
      ? SUBSCRIPTION_NAME_OPTIONS.filter((option) =>
          option.toLowerCase().includes(normalizedValue),
        )
      : SUBSCRIPTION_NAME_OPTIONS;

    return options.slice(0, 8);
  }, [normalizedValue]);

  const hasExactMatch = useMemo(
    () =>
      SUBSCRIPTION_NAME_OPTIONS.some(
        (option) => option.toLowerCase() === normalizedValue,
      ),
    [normalizedValue],
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [normalizedValue]);

  useEffect(() => {
    optionRefs.current[highlightedIndex]?.scrollIntoView({ block: "nearest" });
  }, [highlightedIndex]);

  function applyValue(nextValue: string) {
    onChange(nextValue);
    setOpen(false);
  }

  return (
    <div className="relative" ref={containerRef}>
      <Input
        label={label}
        value={value}
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          onChange(event.target.value);
          setOpen(true);
        }}
        onKeyDown={(event) => {
          if (!open && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
            setOpen(true);
            return;
          }

          if (!open) return;

          if (event.key === "ArrowDown") {
            event.preventDefault();
            setHighlightedIndex((current) =>
              filteredOptions.length === 0
                ? 0
                : (current + 1) % filteredOptions.length,
            );
          }

          if (event.key === "ArrowUp") {
            event.preventDefault();
            setHighlightedIndex((current) =>
              filteredOptions.length === 0
                ? 0
                : current === 0
                  ? filteredOptions.length - 1
                  : current - 1,
            );
          }

          if (event.key === "Enter") {
            event.preventDefault();

            if (filteredOptions[highlightedIndex]) {
              applyValue(filteredOptions[highlightedIndex]);
              return;
            }

            if (value.trim()) {
              applyValue(value.trim());
            }
          }

          if (event.key === "Escape") {
            setOpen(false);
          }
        }}
        placeholder={placeholder}
        required={required}
        autoComplete="off"
      />

      {open ? (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(14,22,40,0.98),rgba(6,11,22,0.98))] p-2 shadow-[0_24px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-2 text-xs uppercase tracking-[0.24em] text-[#6B7280]">
            <div className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5" />
              Suggested services
            </div>
            <span className="tracking-[0.18em] text-[#7C8A98]">Up Down Enter</span>
          </div>

          <div className="mt-2 max-h-72 space-y-1 overflow-y-auto pr-1">
            {filteredOptions.map((option, index) => {
              const isActive = index === highlightedIndex;
              const isSelected = option.toLowerCase() === normalizedValue;

              return (
                <button
                  key={option}
                  ref={(element) => {
                    optionRefs.current[index] = element;
                  }}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => applyValue(option)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-2xl border px-3 py-2.5 text-left text-sm transition",
                    isActive
                      ? "border-[#4ADE80]/50 bg-[#4ADE80] text-[#05111A] shadow-[0_10px_24px_rgba(74,222,128,0.25)]"
                      : "border-transparent text-[#D3DBE4] hover:bg-white/6",
                  )}
                >
                  <span>{option}</span>
                  {isSelected ? (
                    <Check
                      className={cn(
                        "h-4 w-4",
                        isActive ? "text-[#05111A]" : "text-[#4ADE80]",
                      )}
                    />
                  ) : null}
                </button>
              );
            })}

            {value.trim() && !hasExactMatch ? (
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => applyValue(value.trim())}
                className="flex w-full items-center justify-between rounded-2xl border border-dashed border-[#38BDF8]/25 bg-[#38BDF8]/8 px-3 py-2.5 text-left text-sm text-[#D9F2FF] transition hover:bg-[#38BDF8]/12"
              >
                <span>Create &quot;{value.trim()}&quot;</span>
                <span className="text-xs uppercase tracking-[0.2em] text-[#7DD3FC]">
                  Custom
                </span>
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
