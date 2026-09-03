"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { EventDetails } from "@/components/events/EventDetails";
import type { CalendarEvent } from "@/types";
import { formatDate, isOverdue, isToday } from "@/lib/utils";
import {
  CALENDAR_EVENT_TYPE_LABELS,
  CALENDAR_EVENT_TYPE_TONES,
  ROUTES,
} from "@/lib/constants";
import { IconCalendar, IconCalendarPlus } from "@/components/icons";

export interface UpcomingCommitmentsProps {
  events: CalendarEvent[];
}

export function UpcomingCommitments({ events }: UpcomingCommitmentsProps) {
  const [selected, setSelected] = useState<CalendarEvent | null>(null);

  return (
    <Card>
      <CardHeader
        title="Próximos compromissos"
        description="Calendário do dia e dos próximos dias"
        action={
          <Link
            href={ROUTES.calendario}
            className="text-xs font-medium text-brand-400 hover:text-brand-300"
          >
            Ver calendário
          </Link>
        }
      />
      <CardContent className="px-2 py-2">
        {events.length === 0 ? (
          <EmptyState
            icon={<IconCalendar className="h-6 w-6" />}
            title="Nenhum compromisso"
            description="Agende reuniões, follow-ups e vencimentos no calendário."
            action={
              <Link href={ROUTES.calendario}>
                <button
                  type="button"
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-3 text-xs font-medium text-foreground transition-colors hover:border-border-strong"
                >
                  <IconCalendarPlus className="h-4 w-4" />
                  Novo compromisso
                </button>
              </Link>
            }
          />
        ) : (
          <ul className="divide-y divide-border/60">
            {events.map((event) => (
              <li key={event.id}>
                <button
                  type="button"
                  onClick={() => setSelected(event)}
                  className="flex w-full items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-surface-2"
                >
                  <span className="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-lg border border-border bg-surface-2">
                    <span className="text-xs font-bold leading-none text-foreground">
                      {new Date(event.date).getDate()}
                    </span>
                    <span className="text-[10px] leading-none text-muted-2">
                      {new Intl.DateTimeFormat("pt-BR", { month: "short" })
                        .format(new Date(event.date))
                        .replace(".", "")}
                    </span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-foreground">
                      {event.title}
                    </span>
                    <span className="mt-0.5 flex items-center gap-2 text-xs text-muted">
                      <span>
                        {isToday(event.date)
                          ? "Hoje"
                          : isOverdue(event.date)
                            ? "Em atraso"
                            : formatDate(event.date, { day: "2-digit", month: "2-digit" })}
                      </span>
                      <span className="text-muted-2">·</span>
                      <span>{event.time}</span>
                    </span>
                  </span>
                  <Badge tone={CALENDAR_EVENT_TYPE_TONES[event.type]}>
                    {CALENDAR_EVENT_TYPE_LABELS[event.type]}
                  </Badge>
                </button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title="Detalhes do compromisso"
        footer={
          selected?.clientId ? (
            <Link href={`/clientes/${selected.clientId}`}>
              <button
                type="button"
                className="h-10 rounded-lg border border-border bg-surface-2 px-4 text-sm font-medium text-foreground transition-colors hover:border-border-strong"
              >
                Ver cliente
              </button>
            </Link>
          ) : undefined
        }
      >
        {selected && <EventDetails event={selected} />}
      </Modal>
    </Card>
  );
}