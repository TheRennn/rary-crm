"use client";

import type { ReactNode } from "react";
import { useDashboard } from "./DashboardProvider";
import { WIDGET_META } from "@/lib/dashboard/dashboard-config";
import type { DashboardData } from "@/lib/dashboard/dashboard-types";
import { cn } from "@/lib/utils";
import { IconDollar, IconZap, IconUsers, IconTarget, IconCheckSquare } from "@/components/icons";
import { KpiGrid, type KpiItem } from "./KpiGrid";
import { RevenueChart } from "./RevenueChart";
import { SalesChart } from "./SalesChart";
import { PipelineWidget } from "./PipelineWidget";
import { ActivityTimeline } from "./ActivityTimeline";
import { AttentionCenter } from "./AttentionCenter";
import { FollowUpWidget } from "./FollowUpWidget";
import { CalendarWidget } from "./CalendarWidget";
import { PendingTasks } from "./PendingTasks";
import { RecentClients } from "./RecentClients";
import { PerformanceWidget } from "./PerformanceWidget";
import { GoalsWidget } from "./GoalsWidget";
import { InsightsWidget } from "./InsightsWidget";
import { QuickActions } from "./QuickActions";
import { NewClientsWidget } from "./NewClientsWidget";

interface DashboardGridProps {
  data: DashboardData;
  summary: {
    kpis: DashboardData["kpis"];
    metrics: DashboardData["metrics"];
    goals: DashboardData["goals"];
  };
  periodKey: string;
  heading: string;
}

const sizeClasses: Record<string, string> = {
  small: "md:col-span-1",
  medium: "md:col-span-1",
  large: "lg:col-span-2",
};

function buildKpiItems(summary: DashboardData["kpis"], formatCurrency: (n: number) => string): KpiItem[] {
  return [
    {
      id: "kpi-faturamento",
      title: summary.faturamento.label,
      icon: <IconDollar className="h-[18px] w-[18px]" />,
      value: summary.faturamento.value,
      format: formatCurrency,
      delta: summary.faturamento.delta,
      direction: summary.faturamento.direction,
      goodWhen: summary.faturamento.goodWhen,
      sparkline: summary.faturamento.sparkline,
    },
    {
      id: "kpi-vendas",
      title: summary.vendas.label,
      icon: <IconZap className="h-[18px] w-[18px]" />,
      value: summary.vendas.value,
      format: (value) => value.toLocaleString("pt-BR", { maximumFractionDigits: 0 }),
      delta: summary.vendas.delta,
      direction: summary.vendas.direction,
      goodWhen: summary.vendas.goodWhen,
      sparkline: summary.vendas.sparkline,
    },
    {
      id: "kpi-clientes",
      title: summary.clientes.label,
      icon: <IconUsers className="h-[18px] w-[18px]" />,
      value: summary.clientes.value,
      format: (value) => value.toLocaleString("pt-BR", { maximumFractionDigits: 0 }),
      delta: summary.clientes.delta,
      direction: summary.clientes.direction,
      goodWhen: summary.clientes.goodWhen,
      sparkline: summary.clientes.sparkline,
    },
    {
      id: "kpi-conversao",
      title: summary.conversao.label,
      icon: <IconTarget className="h-[18px] w-[18px]" />,
      value: summary.conversao.value,
      format: (value) => value.toLocaleString("pt-BR", { maximumFractionDigits: 1 }) + "%",
      delta: summary.conversao.delta,
      direction: summary.conversao.direction,
      goodWhen: summary.conversao.goodWhen,
      sparkline: summary.conversao.sparkline,
    },
    {
      id: "kpi-pendencias",
      title: summary.pendencias.label,
      icon: <IconCheckSquare className="h-[18px] w-[18px]" />,
      value: summary.pendencias.value,
      format: (value) => value.toLocaleString("pt-BR", { maximumFractionDigits: 0 }),
      delta: summary.pendencias.delta,
      direction: summary.pendencias.direction,
      goodWhen: summary.pendencias.goodWhen,
      sparkline: summary.pendencias.sparkline,
    },
  ];
}

export function DashboardGrid({ data, summary, periodKey, heading }: DashboardGridProps) {
  const { enabledWidgets } = useDashboard();
  const kpiItems = buildKpiItems(summary.kpis, (n) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }));

  const renderWidget = (widget: { id: string }): ReactNode | null => {
    switch (widget.id) {
      case "revenue":
        return <RevenueChart data={summary.metrics} heading={heading} />;
      case "sales":
        return <SalesChart data={summary.metrics.sales} heading={heading} />;
      case "pipeline":
        return <PipelineWidget data={data.pipeline} />;
      case "activities":
        return <ActivityTimeline activities={data.activities} />;
      case "attention":
        return <AttentionCenter items={data.attention} />;
      case "followups":
        return <FollowUpWidget today={data.followUpsToday} overdueCount={data.followUpsOverdueCount} next={data.followUpsNext} />;
      case "calendar":
        return <CalendarWidget events={data.calendarEvents} />;
      case "pending":
        return <PendingTasks tasks={data.pendingTasks} />;
      case "recent-clients":
        return <RecentClients clients={data.recentClients} />;
      case "performance":
        return <PerformanceWidget data={data.performance} />;
      case "goals":
        return <GoalsWidget data={summary.goals} />;
      case "insights":
        return <InsightsWidget items={data.insights} />;
      case "quick-actions":
        return <QuickActions />;
      case "new-clients":
        return <NewClientsWidget clients={data.clients} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      <KpiGrid items={kpiItems} periodKey={periodKey} />

      <div className="dash-grid grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {enabledWidgets.map((widget, index) => {
          const meta = WIDGET_META[widget.id];
          if (!meta || widget.id === "kpi") return null;
          return (
            <div
              key={widget.id}
              className={cn("animate-widget-in", sizeClasses[widget.size] ?? "md:col-span-1")}
              style={{ animationDelay: `${Math.min(index * 55, 500)}ms` }}
            >
              {renderWidget(widget)}
            </div>
          );
        })}
      </div>
    </div>
  );
}