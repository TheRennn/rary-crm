"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutSegment[];
  formatValue: (value: number) => string;
  centerLabel?: string;
  centerValue?: string;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function DonutChart({
  data,
  formatValue,
  centerLabel,
  centerValue,
  size = 160,
  strokeWidth = 18,
  className,
}: DonutChartProps) {
  const [mounted, setMounted] = useState(false);

  const total = data.reduce((sum, segment) => sum + segment.value, 0) || 1;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const segments = useMemo(() => {
    return data.map((segment, index) => {
      const prior = data.slice(0, index).reduce((sum, s) => sum + s.value, 0) / total;
      const fraction = segment.value / total;
      return {
        key: `${segment.label}-${index}`,
        dash: fraction * circumference,
        offset: prior * circumference,
      };
    });
  }, [data, total, circumference]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Distribuição">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--border)"
            strokeWidth={strokeWidth}
          />
          {segments.map((segment, index) => {
            const dataPoint = data[index];
            return (
              <circle
                key={segment.key}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={dataPoint.color}
                strokeWidth={strokeWidth}
                strokeLinecap="butt"
                strokeDasharray={`${segment.dash} ${circumference - segment.dash}`}
                strokeDashoffset={-segment.offset}
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
                style={{
                  opacity: mounted ? 1 : 0,
                  transition: `opacity 0.5s ease ${index * 0.12}s`,
                }}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {centerValue && (
            <p className="text-lg font-bold tracking-tight text-foreground">{centerValue}</p>
          )}
          {centerLabel && <p className="text-[11px] text-muted">{centerLabel}</p>}
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5">
        {data.map((segment) => (
          <div key={segment.label} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: segment.color }} />
            <span className="text-xs text-muted">{segment.label}</span>
            <span className="text-xs font-semibold text-foreground">
              {formatValue(segment.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}