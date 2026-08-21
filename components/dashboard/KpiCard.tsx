"use client";

import type { ReactNode } from "react";
import { useCountUp } from "./hooks/useCountUp";
import { Sparkline } from "./charts/Sparkline";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  icon: ReactNode;
  value: number;
  format: (value: number) => string;
  delta: number;
  direction: "up" | "down" | "neutral";
  goodWhen: "up" | "down";
  sparkline: number[];
  delay?: number;
  periodKey?: string;
}

const toneFor = (direction: "up" | "down" | "neutral", goodWhen: "up" | "down") => {
  if (direction === "neutral") return "text-muted";
  const isGood = direction === goodWhen;
  return isGood ? "text-success" : "text-danger";
};

export function KpiCard({
  title,
  icon,
  value,
  format,
  delta,
  direction,
  goodWhen,
  sparkline,
  delay = 0,
  periodKey = "default",
}: KpiCardProps) {
  const { value: animated } = useCountUp(value, 700, periodKey);

  return (
    <div
      className="group/kpi relative flex h-full select-none flex-col justify-between gap-3 overflow-hidden rounded-xl border border-border bg-surface-1 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-500/40 hover:shadow-[0_14px_40px_-14px_color-mix(in_srgb,var(--brand-primary)_55%,transparent)]"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="dash-widget-sub text-xs font-medium text-muted">{title}</p>
          <p className="mt-1 text-lg font-bold leading-tight tracking-tight text-foreground tabular-nums sm:text-xl 2xl:text-2xl">
            {format(animated)}
          </p>
        </div>
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-2 text-muted transition-all duration-300 group-hover/kpi:scale-110 group-hover/kpi:border-brand-500/40 group-hover/kpi:text-brand-300",
            title === "Faturamento" || title === "Vendas" ? "text-brand-300" : ""
          )}
        >
          {icon}
        </span>
      </div>

      <div className="flex min-w-0 items-center justify-between gap-2">
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums",
            toneFor(direction, goodWhen)
          )}
          style={{
            background:
              direction === "neutral"
                ? "color-mix(in srgb, var(--muted) 12%, transparent)"
                : (direction === goodWhen
                    ? "color-mix(in srgb, var(--success) 12%, transparent)"
                    : "color-mix(in srgb, var(--danger) 12%, transparent)"),
          }}
        >
          {direction === "up" ? "↑" : direction === "down" ? "↓" : "•"} {Math.abs(delta).toFixed(1).replace(".", ",")}%
        </span>
        <span className="hidden shrink-0 sm:block">
          <Sparkline
            data={sparkline}
            width={84}
            height={32}
            color={direction === "neutral" ? "var(--muted)" : "var(--brand-primary)"}
            className="block w-[84px]"
          />
        </span>
      </div>

      {/* Tooltip */}
      <div
        className="pointer-events-none absolute right-3 top-3 z-10 origin-top-right scale-90 rounded-lg border border-border bg-surface-2/95 px-2.5 py-1.5 text-[11px] text-muted opacity-0 shadow-lg shadow-black/40 backdrop-blur transition-all duration-200 group-hover/kpi:scale-100 group-hover/kpi:opacity-100"
        role="tooltip"
      >
        Comparado ao período anterior
      </div>
    </div>
  );
}