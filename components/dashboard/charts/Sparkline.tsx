"use client";

import { cn } from "@/lib/utils";
import { mapPoints, smoothPath } from "./chart-utils";

interface SparklineProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
  filled?: boolean;
  className?: string;
}

export function Sparkline({
  data,
  color = "var(--brand-primary)",
  width = 128,
  height = 40,
  filled = true,
  className,
}: SparklineProps) {
  if (data.length === 0) return null;

  const points = mapPoints(data, width, height);
  const line = smoothPath(points);
  const area = `${line} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  const gradientId = `spark-${color.replace(/\W/g, "")}-${data.length}-${data[0]}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height={height}
      preserveAspectRatio="none"
      className={cn("block", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {filled && <path d={area} fill={`url(#${gradientId})`} />}
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}