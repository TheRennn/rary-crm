"use client";

import { useState } from "react";
import { DashboardWidget } from "./DashboardWidget";
import { AreaChart } from "./charts/AreaChart";
import { formatDashboardCurrency } from "@/lib/dashboard/dashboard-mock-data";
import type { SeriesPoint } from "@/lib/dashboard/dashboard-types";
import { cn } from "@/lib/utils";
import { IconDollar, IconZap, IconUsers } from "@/components/icons";

interface RevenueChartProps {
  data: {
    revenue: SeriesPoint[];
    sales: SeriesPoint[];
    clients: SeriesPoint[];
  };
  heading: string;
}

type MetricKey = "revenue" | "sales" | "clients";

const METRICS: { key: MetricKey; label: string; icon: React.ReactNode; color: string; format: (v: number) => string }[] = [
  { key: "revenue", label: "Faturamento", icon: <IconDollar className="h-3.5 w-3.5" />, color: "var(--brand-primary)", format: formatDashboardCurrency },
  { key: "sales", label: "Vendas", icon: <IconZap className="h-3.5 w-3.5" />, color: "var(--info)", format: (v) => v.toLocaleString("pt-BR", { maximumFractionDigits: 0 }) },
  { key: "clients", label: "Clientes", icon: <IconUsers className="h-3.5 w-3.5" />, color: "var(--success)", format: (v) => v.toLocaleString("pt-BR", { maximumFractionDigits: 0 }) },
];

export function RevenueChart({ data, heading }: RevenueChartProps) {
  const [metric, setMetric] = useState<MetricKey>("revenue");
  const active = METRICS.find((m) => m.key === metric)!;

  return (
    <DashboardWidget
      title="Visão financeira"
      subtitle={heading}
      action={
        <div className="flex items-center gap-1 rounded-lg border border-border bg-surface-2 p-0.5">
          {METRICS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setMetric(item.key)}
              className={cn(
                "flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-colors",
                metric === item.key ? "bg-brand-500/15 text-brand-300" : "text-muted hover:text-foreground"
              )}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      }
    >
      <AreaChart
        data={data[metric]}
        color={active.color}
        formatValue={active.format}
        height="auto"
        className="h-[180px] sm:h-[200px] lg:h-[220px]"
      />
    </DashboardWidget>
  );
}