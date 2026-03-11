"use client";

import { useMemo, useRef } from "react";
import { cn } from "@/lib/utils";

interface NeedScoreSliderProps {
  value: number;
  onChange: (value: number) => void;
}

function getNeedLabel(value: number) {
  if (value >= 80) return "Essential";
  if (value >= 60) return "Useful";
  if (value >= 40) return "Optional";
  return "Easy to cut";
}

export function NeedScoreSlider({
  value,
  onChange,
}: NeedScoreSliderProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const label = getNeedLabel(value);
  const fillColor = useMemo(() => {
    const hue = Math.round((value / 100) * 120);
    return `hsl(${hue} 84% 58%)`;
  }, [value]);

  function updateFromClientY(clientY: number) {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const relative = 1 - (clientY - rect.top) / rect.height;
    const next = Math.max(0, Math.min(100, Math.round(relative * 20) * 5));
    onChange(next);
  }

  return (
    <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(17,24,39,0.88),rgba(7,12,23,0.96))] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.26)]">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#F9FAFB]">Need score</p>
          <p className="mt-1 text-sm text-[#94A3B8]">
            Drag the vertical scale to show how necessary this subscription feels in real life.
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-semibold text-[#F9FAFB]">{value}%</p>
          <p className="text-sm font-medium" style={{ color: fillColor }}>
            {label}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6 md:flex-row md:items-center md:gap-8">
        <div className="flex items-center gap-4">
          <div className="flex h-64 flex-col justify-between py-1 text-xs text-[#6B7280]">
            <span>100%</span>
            <span>75%</span>
            <span>50%</span>
            <span>25%</span>
            <span>0%</span>
          </div>

          <div
            ref={trackRef}
            role="slider"
            tabIndex={0}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={value}
            aria-label="Need score"
            onMouseDown={(event) => {
              updateFromClientY(event.clientY);

              const handleMove = (moveEvent: MouseEvent) =>
                updateFromClientY(moveEvent.clientY);
              const handleUp = () => {
                window.removeEventListener("mousemove", handleMove);
                window.removeEventListener("mouseup", handleUp);
              };

              window.addEventListener("mousemove", handleMove);
              window.addEventListener("mouseup", handleUp);
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowUp") {
                event.preventDefault();
                onChange(Math.min(100, value + 5));
              }
              if (event.key === "ArrowDown") {
                event.preventDefault();
                onChange(Math.max(0, value - 5));
              }
            }}
            className="relative h-72 w-8 cursor-pointer rounded-full border border-white/10 bg-[#0A1220] shadow-[inset_0_8px_24px_rgba(0,0,0,0.35),0_12px_30px_rgba(0,0,0,0.18)] outline-none"
          >
            <div className="absolute inset-[3px] rounded-full bg-white/[0.03]" />
            <div
              className="absolute bottom-[3px] left-[3px] right-[3px] rounded-full transition-[height,background-color] duration-150 ease-out"
              style={{
                height: `calc(${value}% - 6px)`,
                minHeight: value > 0 ? "14px" : "0px",
                backgroundColor: fillColor,
                boxShadow: `0 0 24px color-mix(in srgb, ${fillColor} 35%, transparent)`,
              }}
            />
            <div
              className="absolute left-1/2 h-8 w-8 -translate-x-1/2 rounded-full border-2 border-[#F9FAFB] bg-[#0B1424] shadow-[0_0_0_6px_rgba(255,255,255,0.06)] transition-[bottom] duration-150 ease-out"
              style={{ bottom: `calc(${value}% - 16px)` }}
            />
          </div>
        </div>

        <div className="flex-1 space-y-3 text-sm">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[#DCE6EE]">
            <span className="font-medium text-[#4ADE80]">80-100%</span> Keep this unless
            price or overlap becomes a problem.
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[#DCE6EE]">
            <span className="font-medium text-[#7DD3FC]">60-75%</span> Useful, but still worth
            reviewing against alternatives.
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[#DCE6EE]">
            <span className="font-medium text-[#F59E0B]">40-55%</span> Optional and should be
            checked before the next renewal.
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[#DCE6EE]">
            <span className="font-medium text-[#F97373]">0-35%</span> Low-value subscription and
            likely a cancellation candidate.
          </div>
        </div>
      </div>
    </div>
  );
}
