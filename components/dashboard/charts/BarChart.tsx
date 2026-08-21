"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { selectTickIndices } from "./chart-utils";

export interface SeriesPoint {
  label: string;
  value: number;
}

interface BarChartProps {
  data: SeriesPoint[];
  formatValue: (value: number) => string;
  color?: string;
  className?: string;
  height?: number;
}

export function BarChart({
  data,
  formatValue,
  color = "var(--brand-primary)",
  className,
  height = 200,
}: BarChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState<number | null>(null);

  const max = Math.max(...data.map((d) => d.value)) || 1;

  function handleMove(event: React.MouseEvent) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const ratio = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    setActive(Math.round(ratio * (data.length - 1)));
  }

  const highlight = (index: number): boolean => index === data.length - 1;

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full select-none", className)}
      style={{ height }}
      onMouseMove={handleMove}
      onMouseLeave={() => setActive(null)}
    >
      <div className="flex h-full items-end gap-[6px]">
        {data.map((point, index) => {
          const pct = Math.max((point.value / max) * 100, 4);
          const isHighlight = highlight(index);
          return (
            <div key={`${point.label}-${index}`} className="group relative flex-1">
              {active === index && (
                <div
                  className="pointer-events-none absolute bottom-[calc(100%+6px)] left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg border border-border bg-surface-2/95 px-2.5 py-1.5 text-center shadow-xl shadow-black/40 backdrop-blur"
                >
                  <p className="text-[10px] font-medium text-muted">{point.label}</p>
                  <p className="text-xs font-semibold text-foreground">
                    {formatValue(point.value)}
                  </p>
                </div>
              )}
              <div
                className="dash-bar animate-bar-rise w-full cursor-pointer rounded-t-md transition-colors"
                style={{
                  height: `${pct}%`,
                  background: isHighlight
                    ? `linear-gradient(to top, ${color}, color-mix(in srgb, ${color} 55%, var(--surface-1)))`
                    : "var(--border-strong)",
                  minHeight: 8,
                  animationDelay: `${index * 40}ms`,
                }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between gap-2 text-[10px] text-muted-2">
        {selectTickIndices(data.length, 7).map((index) => (
          <span key={`${data[index].label}-${index}`} className="whitespace-nowrap">
            {data[index].label}
          </span>
        ))}
      </div>
    </div>
  );
}