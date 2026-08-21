"use client";

import { DashboardWidget } from "./DashboardWidget";
import { BarChart } from "./charts/BarChart";
import { formatDashboardCurrency } from "@/lib/dashboard/dashboard-mock-data";
import type { SeriesPoint } from "@/lib/dashboard/dashboard-types";

interface SalesChartProps {
  data: SeriesPoint[];
  heading: string;
}

export function SalesChart({ data, heading }: SalesChartProps) {
  return (
    <DashboardWidget
      title="Evolução de vendas"
      subtitle={`Vendas no período · ${heading}`}
    >
      <BarChart data={data} formatValue={formatDashboardCurrency} color="var(--brand-primary)" height={200} />
    </DashboardWidget>
  );
}