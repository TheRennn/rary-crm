"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { mapPoints, selectTickIndices, smoothPath } from "./chart-utils";

export interface SeriesPoint {
  label: string;
  value: number;
}

interface AreaChartProps {
  data: SeriesPoint[];
  color?: string;
  formatValue: (value: number) => string;
  className?: string;
  height?: number | "auto";
}

const VIEW_WIDTH = 720;
const VIEW_HEIGHT = 220;

export function AreaChart({
  data,
  color = "var(--brand-primary)",
  formatValue,
  className,
  height = 220,
}: AreaChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  const gradientId = useMemo(
    () => `area-grad-${color.replace(/\W/g, "")}-${data.length}-${data[0]?.value}`,
    [color, data]
  );

  const { line, area } = useMemo(() => {
    const points = mapPoints(
      data.map((d) => d.value),
      VIEW_WIDTH,
      VIEW_HEIGHT,
      10,
      14
    );
    const path = smoothPath(points);
    const area = `${path} L ${points[points.length - 1].x} ${VIEW_HEIGHT} L ${points[0].x} ${VIEW_HEIGHT} Z`;
    return { line: path, area };
  }, [data]);

  const max = Math.max(...data.map((d) => d.value));
  const gridLines = [0.25, 0.5, 0.75, 1];
  const tickIndices = useMemo(() => selectTickIndices(data.length, 6), [data.length]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  function handleMove(event: React.MouseEvent) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const ratio = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    const index = Math.round(ratio * (data.length - 1));
    setActive(index);
  }

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full select-none", className)}
      style={height !== "auto" ? { height } : undefined}
      onMouseMove={handleMove}
      onMouseLeave={() => setActive(null)}
    >
      <svg
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        preserveAspectRatio="none"
        className="h-full w-full"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {gridLines.map((ratio) => (
          <line
            key={ratio}
            x1={0}
            x2={VIEW_WIDTH}
            y1={VIEW_HEIGHT * (1 - ratio)}
            y2={VIEW_HEIGHT * (1 - ratio)}
            stroke="var(--border)"
            strokeOpacity="0.5"
            strokeDasharray="3 6"
            vectorEffect="non-scaling-stroke"
          />
        ))}

        <path d={area} fill={`url(#${gradientId})`} style={{ opacity: mounted ? 1 : 0, transition: "opacity 0.7s ease 0.3s" }} />

        <path
          d={line}
          fill="none"
          stroke={color}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          pathLength={1}
          style={{
            strokeDasharray: 1,
            strokeDashoffset: mounted ? 0 : 1,
            transition: "stroke-dashoffset 1.1s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />
      </svg>

      {/* Hover alvo */}
      <div
        className="absolute inset-0 opacity-0"
        style={{
          background:
            "radial-gradient(120px 100% at center, color-mix(in srgb, var(--brand-primary) 10%, transparent), transparent)",
        }}
        aria-hidden="true"
      />

      {active !== null && data[active] && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2"
          style={{
            left: `${(active / Math.max(data.length - 1, 1)) * 100}%`,
            bottom: "calc(100% + 10px)",
          }}
        >
          <div className="whitespace-nowrap rounded-lg border border-border bg-surface-2/95 px-3 py-2 text-center shadow-xl shadow-black/40 backdrop-blur">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted">
              {data[active].label}
            </p>
            <p className="text-sm font-semibold text-foreground">
              {formatValue(data[active].value)}
            </p>
          </div>
          <div
            className="mx-auto h-0 w-px"
            style={{ background: color, opacity: 0.5 }}
          />
        </div>
      )}

      {/* Eixo X */}
      <div
        className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 text-[10px] text-muted-2 sm:text-[11px]"
        style={{ paddingTop: 6 }}
      >
        {tickIndices.map((index, i, arr) => (
          <span
            key={`${data[index].label}-${index}`}
            className={cn(
              "min-w-0 flex-1 truncate text-center",
              i === 0 && "text-left",
              i === arr.length - 1 && "text-right",
              active === index ? "font-semibold text-foreground" : ""
            )}
          >
            {data[index].label}
          </span>
        ))}
      </div>

      {/* magnitude para os tooltips */}
      {typeof max === "number" && <span className="sr-only">{formatValue(max)}</span>}
    </div>
  );
}