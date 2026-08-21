"use client";

import { DashboardWidget } from "./DashboardWidget";
import { useCountUp } from "./hooks/useCountUp";
import { formatDashboardCurrency } from "@/lib/dashboard/dashboard-mock-data";
import type { GoalData } from "@/lib/dashboard/dashboard-types";

interface GoalsWidgetProps {
  data: GoalData;
}

export function GoalsWidget({ data }: GoalsWidgetProps) {
  const { value: animatedPercent } = useCountUp(data.percentage, 900, String(data.target));
  const percentage = Math.round(animatedPercent * 10) / 10;

  return (
    <DashboardWidget
      title={data.label.toUpperCase()}
      subtitle="Acompanhamento do período"
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {formatDashboardCurrency(data.achieved)}
          </span>
          <span className="text-sm text-muted">de {formatDashboardCurrency(data.target)}</span>
        </div>

        <div className="relative h-3 overflow-hidden rounded-full bg-surface-2">
          <div
            className="animate-grow-width h-full rounded-full bg-gradient-to-r from-brand-600 via-brand-500 to-brand-400"
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xl font-bold tabular-nums text-brand-300">
            {percentage.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%
          </span>
          <span className="text-xs text-muted">
            {data.remaining > 0 ? (
              <>
                Faltam{" "}
                <span className="font-semibold text-foreground">
                  {formatDashboardCurrency(data.remaining)}
                </span>
              </>
            ) : (
              <span className="font-semibold text-success">Meta atingida 🎯</span>
            )}
          </span>
        </div>
      </div>
    </DashboardWidget>
  );
}