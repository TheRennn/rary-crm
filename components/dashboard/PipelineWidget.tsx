"use client";

import Link from "next/link";
import { DashboardWidget } from "./DashboardWidget";
import { formatDashboardCurrency } from "@/lib/dashboard/dashboard-mock-data";
import type { PipelineData } from "@/lib/dashboard/dashboard-types";
import { IconArrowRight } from "@/components/icons";

interface PipelineWidgetProps {
  data: PipelineData;
}

const STAGE_COLORS = [
  "var(--brand-primary)",
  "var(--brand-primary)",
  "color-mix(in srgb, var(--brand-primary) 75%, var(--brand-primary-light))",
  "var(--brand-300)",
  "var(--brand-200)",
];

export function PipelineWidget({ data }: PipelineWidgetProps) {
  const maxValue = Math.max(...data.stages.map((stage) => stage.value), 1);

  return (
    <DashboardWidget
      title="Pipeline de vendas"
      subtitle={`${data.totalCount} oportunidades · ${formatDashboardCurrency(data.totalValue)}`}
      action={
        <Link
          href="/vendas"
          className="group inline-flex items-center gap-1 text-xs font-medium text-brand-300 transition-colors hover:text-brand-200"
        >
          Ver vendas
          <IconArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          {data.stages.map((stage, index) => {
            const width = Math.max((stage.value / maxValue) * 100, 2);
            return (
              <div key={stage.id} className="group/stage">
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">{stage.label}</span>
                  <span className="text-muted">
                    {stage.count} · {formatDashboardCurrency(stage.value)}
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-surface-2">
                  <div
                    className="animate-grow-width h-full rounded-full"
                    style={{
                      width: `${width}%`,
                      background: STAGE_COLORS[index % STAGE_COLORS.length],
                      animationDelay: `${index * 90}ms`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-3 gap-2 border-t border-border pt-3">
          <div>
            <p className="text-[11px] text-muted">Oportunidades</p>
            <p className="text-sm font-semibold text-foreground tabular-nums">{data.totalCount}</p>
          </div>
          <div>
            <p className="text-[11px] text-muted">Em negociação</p>
            <p className="text-sm font-semibold text-foreground tabular-nums">
              {data.stages.filter((s) => s.id !== "fechamento").length}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-muted">Conversão</p>
            <p className="text-sm font-semibold text-foreground tabular-nums">
              {data.conversion.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%
            </p>
          </div>
        </div>
      </div>
    </DashboardWidget>
  );
}