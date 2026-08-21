"use client";

import { DashboardWidget } from "./DashboardWidget";
import type { InsightItem } from "@/lib/dashboard/dashboard-types";
import { cn } from "@/lib/utils";
import { IconTrendingUp, IconAlertCircle, IconCheckCircle, IconSparkles, IconZap } from "@/components/icons";

interface InsightsWidgetProps {
  items: InsightItem[];
}

const TONE_CONFIG: Record<
  InsightItem["tone"],
  { icon: React.ReactNode; ring: string; iconClass: string }
> = {
  positive: {
    icon: <IconTrendingUp className="h-4 w-4" />,
    ring: "border-success/30 bg-success/10",
    iconClass: "text-success",
  },
  warning: {
    icon: <IconAlertCircle className="h-4 w-4" />,
    ring: "border-warning/30 bg-warning/10",
    iconClass: "text-warning",
  },
  success: {
    icon: <IconCheckCircle className="h-4 w-4" />,
    ring: "border-info/30 bg-info/10",
    iconClass: "text-info",
  },
  info: {
    icon: <IconZap className="h-4 w-4" />,
    ring: "border-brand-500/30 bg-brand-500/10",
    iconClass: "text-brand-300",
  },
  neutral: {
    icon: <IconSparkles className="h-4 w-4" />,
    ring: "border-border bg-surface-2",
    iconClass: "text-muted",
  },
};

export function InsightsWidget({ items }: InsightsWidgetProps) {
  return (
    <DashboardWidget
      title="Insights"
      subtitle="Alertas inteligentes gerados pela operação"
      action={<IconSparkles className="h-4 w-4 text-brand-400" />}
    >
      <ul className="grid gap-2 sm:grid-cols-2">
        {items.map((insight) => {
          const config = TONE_CONFIG[insight.tone];
          return (
            <li
              key={insight.id}
              className="flex items-start gap-3 rounded-lg border border-border px-3 py-3 transition-colors hover:bg-surface-2/60"
            >
              <span
                className={cn(
                  "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
                  config.ring,
                  config.iconClass
                )}
              >
                {config.icon}
              </span>
              <p className="text-sm leading-relaxed text-muted">{insight.message}</p>
            </li>
          );
        })}
      </ul>
    </DashboardWidget>
  );
}