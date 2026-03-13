"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface CatalogSuggestion {
  id: string;
  service: string;
  group: string;
  subcategory: string;
  similarityGroup: string;
  region: string;
  country: string;
  plan: string;
  price: string | number;
  currency: string;
  billingPeriod: string;
  website: string;
  logoHint: string;
  priority: string;
  defaultNeedScore: number;
  planRank: number;
  isFamilyPlan: boolean;
  isStudentPlan: boolean;
  isBusinessPlan: boolean;
}

interface SubscriptionNamePickerProps {
  value: string;
  onChange: (value: string) => void;
  onSelectSuggestion?: (suggestion: CatalogSuggestion) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
}

function formatSuggestionLabel(suggestion: CatalogSuggestion) {
  return `${suggestion.service} (${suggestion.plan})`;
}

export function SubscriptionNamePicker({
  value,
  onChange,
  onSelectSuggestion,
  label = "Name",
  placeholder = "Start typing a service name",
  required,
}: SubscriptionNamePickerProps) {
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [suggestions, setSuggestions] = useState<CatalogSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const normalizedValue = value.trim().toLowerCase();

  const hasExactMatch = useMemo(
    () =>
      suggestions.some(
        (option) => formatSuggestionLabel(option).toLowerCase() === normalizedValue,
      ),
    [normalizedValue, suggestions],
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
  }, [normalizedValue, suggestions.length]);

  useEffect(() => {
    optionRefs.current[highlightedIndex]?.scrollIntoView({ block: "nearest" });
  }, [highlightedIndex]);

  useEffect(() => {
    const controller = new AbortController();
    const query = value.trim();

    if (!open) {
      return () => controller.abort();
    }

    async function loadSuggestions() {
      setIsLoading(true);

      try {
        const token = window.localStorage.getItem("auth_token");
        const params = new URLSearchParams({
          limit: "12",
          ...(query ? { query } : {}),
        });

        const response = await fetch(`${API_BASE_URL}/catalog?${params.toString()}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Unable to load catalog suggestions");
        }

        const payload = (await response.json()) as CatalogSuggestion[] | { data?: CatalogSuggestion[] };
        const nextSuggestions = Array.isArray(payload)
          ? payload
          : Array.isArray(payload.data)
            ? payload.data
            : [];

        setSuggestions(nextSuggestions);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }
        setSuggestions([]);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    const timeoutId = window.setTimeout(loadSuggestions, query ? 180 : 0);
    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [open, value]);

  function applyValue(nextValue: string, suggestion?: CatalogSuggestion) {
    onChange(nextValue);
    if (suggestion && onSelectSuggestion) {
      onSelectSuggestion(suggestion);
    }
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
              suggestions.length === 0 ? 0 : (current + 1) % suggestions.length,
            );
          }

          if (event.key === "ArrowUp") {
            event.preventDefault();
            setHighlightedIndex((current) =>
              suggestions.length === 0
                ? 0
                : current === 0
                  ? suggestions.length - 1
                  : current - 1,
            );
          }

          if (event.key === "Enter") {
            event.preventDefault();

            if (suggestions[highlightedIndex]) {
              applyValue(
                formatSuggestionLabel(suggestions[highlightedIndex]),
                suggestions[highlightedIndex],
              );
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
              Service catalog
            </div>
            <span className="tracking-[0.18em] text-[#7C8A98]">Up Down Enter</span>
          </div>

          <div className="mt-2 max-h-80 space-y-1 overflow-y-auto pr-1">
            {isLoading ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-4 text-sm text-[#9CA3AF]">
                Loading suggestions...
              </div>
            ) : null}

            {!isLoading &&
              suggestions.map((option, index) => {
                const isActive = index === highlightedIndex;
                const labelText = formatSuggestionLabel(option);
                const isSelected = labelText.toLowerCase() === normalizedValue;

                return (
                  <button
                    key={option.id}
                    ref={(element) => {
                      optionRefs.current[index] = element;
                    }}
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => applyValue(labelText, option)}
                    className={cn(
                      "flex w-full items-start justify-between rounded-2xl border px-3 py-3 text-left text-sm transition",
                      isActive
                        ? "border-[#4ADE80]/50 bg-[#4ADE80] text-[#05111A] shadow-[0_10px_24px_rgba(74,222,128,0.25)]"
                        : "border-transparent text-[#D3DBE4] hover:bg-white/6",
                    )}
                  >
                    <div className="min-w-0">
                      <div className="truncate font-medium">{labelText}</div>
                      <div
                        className={cn(
                          "mt-1 text-xs",
                          isActive ? "text-[#10301D]" : "text-[#8EA0AF]",
                        )}
                      >
                        {option.country} • {option.group} • {option.price} {option.currency} /{" "}
                        {option.billingPeriod}
                      </div>
                    </div>
                    {isSelected ? (
                      <Check
                        className={cn(
                          "mt-0.5 h-4 w-4 shrink-0",
                          isActive ? "text-[#05111A]" : "text-[#4ADE80]",
                        )}
                      />
                    ) : null}
                  </button>
                );
              })}

            {!isLoading && suggestions.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-4 text-sm text-[#9CA3AF]">
                No matching services found yet.
              </div>
            ) : null}

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
