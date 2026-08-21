"use client";

import type { ReactNode } from "react";
import { DashboardWidget } from "./DashboardWidget";
import type { Activity } from "@/types";
import { relativeTimeLabel } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { IconUsers, IconTrendingUp, IconRefresh, IconCreditCard, IconCheckSquare } from "@/components/icons";

interface ActivityTimelineProps {
  activities: Activity[];
}

const TYPE_STYLE: Record<Activity["type"], { icon: ReactNode; tone: string; ring: string }> = {
  CLIENTE: { icon: <IconUsers className="h-4 w-4" />, tone: "text-info", ring: "border-info/30 bg-info/10" },
  VENDA: { icon: <IconTrendingUp className="h-4 w-4" />, tone: "text-success", ring: "border-success/30 bg-success/10" },
  FOLLOW_UP: { icon: <IconRefresh className="h-4 w-4" />, tone: "text-brand-300", ring: "border-brand-500/30 bg-brand-500/10" },
  PAGAMENTO: { icon: <IconCreditCard className="h-4 w-4" />, tone: "text-warning", ring: "border-warning/30 bg-warning/10" },
  TAREFA: { icon: <IconCheckSquare className="h-4 w-4" />, tone: "text-muted", ring: "border-border bg-surface-2" },
};

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  return (
    <DashboardWidget
      title="Atividade recente"
      subtitle="O que aconteceu na operação"
    >
      <ol className="relative flex flex-col gap-2 border-l border-border pl-6">
        {activities.map((activity) => {
          const style = TYPE_STYLE[activity.type];
          const dotColor = style.tone.replace("text-", "bg-");
          return (
            <li
              key={activity.id}
              className="group relative flex items-start gap-3 rounded-lg py-1.5 transition-colors hover:bg-surface-2/70"
            >
              <span
                className={cn(
                  "absolute -left-[29px] top-3.5 h-2 w-2 rounded-full ring-4 ring-surface-1",
                  dotColor
                )}
                aria-hidden="true"
              />
              <span
                className={cn(
                  "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
                  style.ring,
                  style.tone
                )}
              >
                {style.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{activity.title}</p>
                <p className="mt-0.5 truncate text-xs text-muted">{activity.detail}</p>
                <p className="mt-1 text-[11px] text-muted-2">{activity.actor}</p>
              </div>
              <span className="shrink-0 text-[11px] text-muted-2 tabular-nums">
                {relativeTimeLabel(activity.createdAt)}
              </span>
            </li>
          );
        })}
      </ol>
    </DashboardWidget>
  );
}