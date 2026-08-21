"use client";

import { useEffect, useMemo, useState } from "react";
import { DashboardProvider, useDashboard } from "./DashboardProvider";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardCustomizer } from "./DashboardCustomizer";
import { CommandPalette } from "./CommandPalette";
import { DashboardGrid } from "./DashboardGrid";
import { dashboardSummaryForPeriod } from "@/lib/dashboard/dashboard-mock-data";
import type {
  DashboardData,
  DashboardPeriod,
} from "@/lib/dashboard/dashboard-types";
import { formatDateShort } from "@/lib/utils";

interface DashboardClientProps {
  data: DashboardData;
}

function resolveBucket(period: DashboardPeriod, customRange: { from: string; to: string } | null): Exclude<DashboardPeriod, "custom"> {
  if (period !== "custom") return period;
  let days = 30;
  if (customRange?.from && customRange.to) {
    const from = new Date(customRange.from);
    const to = new Date(customRange.to);
    const diff = Math.round((to.getTime() - from.getTime()) / 86400000);
    if (Number.isFinite(diff) && diff >= 0) days = diff;
  }
  if (days <= 1) return "today";
  if (days <= 7) return "7d";
  if (days <= 30) return "30d";
  return "90d";
}

function periodHeading(period: DashboardPeriod, customRange: { from: string; to: string } | null): string {
  switch (period) {
    case "today":
      return "Resumo do dia · hoje";
    case "7d":
      return "Resumo da semana";
    case "30d":
      return "Resumo do mês";
    case "90d":
      return "Resumo do trimestre";
    case "custom":
      return customRange?.from
        ? `Período personalizado · ${formatDateShort(customRange.from)} a ${formatDateShort(customRange.to)}`
        : "Período personalizado";
  }
}

function DashboardInner({ data }: DashboardClientProps) {
  const { preferences } = useDashboard();
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  const bucket = resolveBucket(preferences.period, preferences.customRange);

  const summary = useMemo(() => {
    const { kpis, metrics } = dashboardSummaryForPeriod(bucket, {
      clients: data.clients.length,
      pendingCount: data.tasks.filter((task) => task.status !== "CONCLUIDA").length,
    });
    const goals = { ...data.goals, achieved: Math.min(kpis.faturamento.value, data.goals.target), percentage: Math.round((Math.min(kpis.faturamento.value, data.goals.target) / data.goals.target) * 1000) / 10, remaining: Math.max(data.goals.target - Math.min(kpis.faturamento.value, data.goals.target), 0) };
    return { kpis, metrics, goals };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bucket, data.clients.length]);

  const periodKey = `${preferences.period}-${preferences.customRange?.from ?? ""}-${preferences.customRange?.to ?? ""}-${bucket}`;

  return (
    <div className="flex flex-col gap-7">
      <DashboardHeader
        userName={data.user?.name ?? "equipe"}
        greeting={data.greeting}
        subtitle={periodHeading(preferences.period, preferences.customRange)}
        onOpenCustomizer={() => setCustomizerOpen(true)}
        onOpenPalette={() => setPaletteOpen(true)}
      />

      <DashboardGrid data={data} summary={summary} periodKey={periodKey} heading={periodHeading(preferences.period, preferences.customRange)} />

      <DashboardCustomizer open={customizerOpen} onClose={() => setCustomizerOpen(false)} />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} clients={data.clients} />
    </div>
  );
}

export function DashboardClient({ data }: DashboardClientProps) {
  return (
    <DashboardProvider organizations={data.organizations}>
      <DashboardInner data={data} />
    </DashboardProvider>
  );
}