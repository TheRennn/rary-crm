"use client";

import { DashboardWidget } from "./DashboardWidget";
import { Badge } from "@/components/ui/Badge";
import type { FollowUp } from "@/types";
import { FOLLOW_UP_TYPE_LABELS } from "@/lib/constants";
import { IconArrowRight } from "@/components/icons";

interface FollowUpWidgetProps {
  today: FollowUp[];
  overdueCount: number;
  next: FollowUp[];
}

const TYPE_TONE: Record<FollowUp["type"], "brand" | "info" | "neutral" | "success" | "warning"> = {
  LIGACAO: "brand",
  WHATSAPP: "success",
  EMAIL: "info",
  REUNIAO: "warning",
  PROPOSTA: "neutral",
  OUTRO: "neutral",
};

function followUpDateTime(followUp: FollowUp): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(followUp.date));
}

export function FollowUpWidget({ today, overdueCount, next }: FollowUpWidgetProps) {
  const list = [...today, ...next].slice(0, 5);

  return (
    <DashboardWidget
      title="Follow-ups de hoje"
      subtitle="Agenda do dia e próximos"
      action={
        <div className="flex items-center gap-1.5">
          {overdueCount > 0 && (
            <Badge tone="danger">{overdueCount} atrasados</Badge>
          )}
          <Badge tone="brand">{today.length} hoje</Badge>
        </div>
      }
    >
      {list.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted">Nenhum follow-up agendado.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {list.map((followUp) => (
            <li
              key={followUp.id}
              className="group flex items-center gap-3 rounded-lg border border-border px-3 py-2.5 transition-all hover:border-brand-500/40 hover:bg-surface-2/50"
            >
              <span className="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-lg border border-border bg-surface-2">
                <span className="text-[11px] font-bold leading-none text-foreground">
                  {followUp.time}
                </span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-foreground">
                  {followUp.clientName}
                </span>
                <span className="mt-0.5 block truncate text-xs text-muted">
                  {followUp.subject ?? "Sem assunto"}
                </span>
                <span className="mt-0.5 block text-[11px] text-muted-2">
                  {followUpDateTime(followUp)}
                </span>
              </span>
              <Badge tone={TYPE_TONE[followUp.type]}>
                {FOLLOW_UP_TYPE_LABELS[followUp.type]}
              </Badge>
              <IconArrowRight className="h-3.5 w-3.5 text-muted-2 transition-transform group-hover:translate-x-0.5" />
            </li>
          ))}
        </ul>
      )}
    </DashboardWidget>
  );
}