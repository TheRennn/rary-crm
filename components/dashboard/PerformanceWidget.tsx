"use client";

import { DashboardWidget } from "./DashboardWidget";
import type { PerformanceRow } from "@/lib/dashboard/dashboard-types";
import { cn } from "@/lib/utils";

interface PerformanceWidgetProps {
  data: PerformanceRow[];
}

const RANK_STYLE: Record<number, string> = {
  1: "bg-brand-500/20 text-brand-300 border-brand-500/40",
  2: "bg-white/5 text-muted border-border",
  3: "bg-white/5 text-muted border-border",
};

export function PerformanceWidget({ data }: PerformanceWidgetProps) {
  const maxSales = Math.max(...data.map((row) => row.sales), 1);

  return (
    <DashboardWidget
      title="Performance comercial"
      subtitle="Ranking de vendas e conversão"
    >
      <ul className="flex flex-col gap-1.5">
        {data.map((row) => (
          <li
            key={row.id}
            className="group grid grid-cols-[1.6fr_1fr_1fr] items-center gap-2 rounded-lg border border-transparent px-2 py-2 transition-colors hover:border-border hover:bg-surface-2/50"
          >
            <span className="flex min-w-0 items-center gap-2">
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-[11px] font-bold",
                  RANK_STYLE[row.rank] ?? "bg-white/5 text-muted border-border"
                )}
              >
                {row.rank}
              </span>
              <span className="truncate text-sm font-medium text-foreground">{row.responsible}</span>
            </span>
            <span className="text-right text-sm font-semibold text-foreground tabular-nums">
              {row.sales}
              <span className="ml-1 text-[10px] font-normal text-muted-2">vendas</span>
            </span>
            <span className="text-right text-sm font-semibold tabular-nums text-brand-300">
              {row.conversion.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-3 border-t border-border pt-3">
        <div className="flex overflow-hidden rounded-full bg-surface-2">
          {data.map((row) => (
            <div
              key={row.id}
              className="animate-grow-width h-1.5"
              style={{
                width: `${(row.sales / maxSales) * 100}%`,
                background: "var(--brand-primary)",
                opacity: 1 - (row.rank - 1) * 0.22,
              }}
            />
          ))}
        </div>
        <p className="mt-2 text-[11px] text-muted-2">
          Líder: <span className="font-medium text-foreground">{data[0]?.responsible}</span> · foco em
          performance comercial
        </p>
      </div>
    </DashboardWidget>
  );
}