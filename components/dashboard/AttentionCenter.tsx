"use client";

import Link from "next/link";
import { DashboardWidget } from "./DashboardWidget";
import type { AttentionItem } from "@/lib/dashboard/dashboard-types";
import { cn } from "@/lib/utils";
import { IconAlertCircle } from "@/components/icons";

interface AttentionCenterProps {
  items: AttentionItem[];
}

const SEVERITY_STYLES = {
  normal: {
    dot: "bg-muted",
    text: "text-foreground",
    chip: "border-border bg-surface-2",
  },
  warning: {
    dot: "bg-warning",
    text: "text-foreground",
    chip: "border-warning/40 bg-warning/10",
  },
  critical: {
    dot: "bg-danger",
    text: "text-foreground",
    chip: "border-danger/40 bg-danger/10",
  },
};

export function AttentionCenter({ items }: AttentionCenterProps) {
  const total = items.reduce((sum, item) => sum + item.count, 0);

  return (
    <DashboardWidget
      title="Precisa de atenção"
      subtitle={total > 0 ? `${total} itens pedem ação` : "Tudo sob controle"}
      highlighted={total > 0}
      action={<IconAlertCircle className="h-4 w-4 text-brand-400" />}
    >
      <ul className="flex flex-col gap-2">
        {items.map((item) => {
          const style = SEVERITY_STYLES[item.severity];
          const row = (
            <li
              key={item.id}
              className={cn(
                "group flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-all hover:-translate-y-0.5",
                style.chip
              )}
            >
              <span
                className={cn(
                  "h-2 w-2 shrink-0 rounded-full ring-4 ring-transparent transition-all",
                  style.dot
                )}
                aria-hidden="true"
              />
              <span className={cn("min-w-0 flex-1 text-sm font-medium", style.text)}>
                {item.label}
              </span>
              <span
                className={cn(
                  "rounded-md px-2 py-0.5 text-xs font-bold tabular-nums",
                  item.severity === "critical" ? "bg-danger/15 text-danger" : "bg-white/5 text-muted"
                )}
              >
                {item.count}
              </span>
            </li>
          );

          return item.href ? (
            <Link key={item.id} href={item.href}>
              {row}
            </Link>
          ) : (
            row
          );
        })}
      </ul>
    </DashboardWidget>
  );
}