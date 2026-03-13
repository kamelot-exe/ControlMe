"use client";

import { useMemo, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface DonutChartData {
  name: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutChartData[];
  className?: string;
  valueFormatter?: (value: number) => string;
}

const COLORS = [
  "#4ADE80",
  "#38BDF8",
  "#F97373",
  "#F59E0B",
  "#8B5CF6",
  "#EC4899",
  "#10B981",
  "#6366F1",
];

export function DonutChart({
  data,
  className,
  valueFormatter = (value) => value.toFixed(2),
}: DonutChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const normalized = useMemo(() => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    return {
      total,
      segments: data.map((item) => ({
        ...item,
        share: total > 0 ? item.value / total : 0,
      })),
    };
  }, [data]);

  const activeItem =
    activeIndex != null && normalized.segments[activeIndex]
      ? normalized.segments[activeIndex]
      : normalized.segments[0] ?? null;

  return (
    <div className={className}>
      <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-center">
        <div className="mx-auto flex w-full max-w-[320px] items-center justify-center">
          <div className="relative h-[300px] w-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={normalized.segments}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="value"
                  isAnimationActive={false}
                  stroke="transparent"
                >
                  {normalized.segments.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color || COLORS[index % COLORS.length]}
                      stroke="transparent"
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="flex h-[148px] w-[148px] flex-col items-center justify-center rounded-full border border-white/10 bg-[rgba(8,14,26,0.96)] text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                {activeItem ? (
                  <>
                    <p className="max-w-[110px] text-xs uppercase tracking-[0.22em] text-[#7B8794]">
                      {activeItem.name}
                    </p>
                    <p className="mt-3 text-xl font-semibold text-[#F9FAFB]">
                      {valueFormatter(activeItem.value)}
                    </p>
                    <p className="mt-1 text-xs text-[#AAB6C2]">
                      {(activeItem.share * 100).toFixed(0)}%
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-xs uppercase tracking-[0.22em] text-[#7B8794]">
                      Total
                    </p>
                    <p className="mt-3 text-xl font-semibold text-[#F9FAFB]">
                      {valueFormatter(normalized.total)}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="min-w-0">
          <div className="max-h-[320px] space-y-2 overflow-y-auto pr-1">
            {normalized.segments.map((entry, index) => {
              const isActive = activeIndex === index;

              return (
                <button
                  key={`${entry.name}-${index}`}
                  type="button"
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                  onFocus={() => setActiveIndex(index)}
                  onBlur={() => setActiveIndex(null)}
                  className={`flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                    isActive
                      ? "border-white/20 bg-white/[0.08]"
                      : "border-white/10 bg-white/[0.04] hover:bg-white/[0.06]"
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="truncate text-sm text-[#DCE6EE]">{entry.name}</span>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-3">
                    <span className="text-xs text-[#93A1AF]">
                      {(entry.share * 100).toFixed(0)}%
                    </span>
                    <span className="text-sm font-semibold text-[#F9FAFB]">
                      {valueFormatter(entry.value)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
