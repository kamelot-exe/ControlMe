"use client";

import { cn } from "@/lib/utils";

interface ServiceBadgeProps {
  name: string;
  logoHint?: string | null;
  className?: string;
}

function getInitials(name: string) {
  const parts = name
    .replace(/\([^)]*\)/g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "CM";
}

function getAccent(logoHint?: string | null) {
  const source = (logoHint || "").toLowerCase();

  if (source.includes("netflix")) return "#E50914";
  if (source.includes("spotify")) return "#1ED760";
  if (source.includes("apple")) return "#D1D5DB";
  if (source.includes("disney")) return "#5AA9FF";
  if (source.includes("google")) return "#60A5FA";
  if (source.includes("chatgpt")) return "#10A37F";
  if (source.includes("canva")) return "#7C3AED";
  if (source.includes("figma")) return "#F24E1E";
  if (source.includes("amazon")) return "#FFB703";
  if (source.includes("youtube")) return "#FF0000";
  return "#38BDF8";
}

export function ServiceBadge({ name, logoHint, className }: ServiceBadgeProps) {
  const initials = getInitials(name);
  const accent = getAccent(logoHint ?? name);
  const gradientId = `badge-${(logoHint ?? name).replace(/[^a-zA-Z0-9]/g, "").toLowerCase() || "service"}`;

  return (
    <div
      className={cn("overflow-hidden rounded-2xl border", className)}
      style={{
        borderColor: `${accent}40`,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06), 0 12px 28px ${accent}18`,
      }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 64 64" className="h-full w-full" role="presentation">
        <defs>
          <linearGradient id={gradientId} x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity="0.92" />
            <stop offset="100%" stopColor="#07111F" stopOpacity="1" />
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="18" fill={`url(#${gradientId})`} />
        <rect x="1" y="1" width="62" height="62" rx="17" fill="none" stroke="rgba(255,255,255,0.08)" />
        <text
          x="32"
          y="38"
          textAnchor="middle"
          fontSize="18"
          fontWeight="700"
          fill="#F9FAFB"
          letterSpacing="1.5"
          fontFamily="Arial, sans-serif"
        >
          {initials}
        </text>
      </svg>
    </div>
  );
}
