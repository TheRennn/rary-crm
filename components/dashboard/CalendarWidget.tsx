"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { DashboardWidget } from "./DashboardWidget";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import type { CalendarEvent } from "@/types";
import { CALENDAR_EVENT_TYPE_LABELS, CALENDAR_EVENT_TYPE_TONES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { IconChevronLeft, IconChevronRight, IconArrowRight } from "@/components/icons";

interface CalendarWidgetProps {
  events: CalendarEvent[];
}

const WEEKDAY_LABELS = ["D", "S", "T", "Q", "Q", "S", "S"];

function eventsForDay(events: CalendarEvent[], year: number, month: number, day: number): CalendarEvent[] {
  return events.filter((event) => {
    const date = new Date(event.date);
    return date.getFullYear() === year && date.getMonth() === month && date.getDate() === day;
  });
}

export function CalendarWidget({ events }: CalendarWidgetProps) {
  const today = new Date();
  const [view, setView] = useState({ y: today.getFullYear(), m: today.getMonth() });
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const firstDay = new Date(view.y, view.m, 1).getDay();
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();

  const monthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" })
        .format(new Date(view.y, view.m, 1))
        .toUpperCase(),
    [view]
  );

  const cells = Array.from({ length: 42 }, (_, index) => {
    const day = index - firstDay + 1;
    if (day < 1 || day > daysInMonth) return null;
    const dayEvents = eventsForDay(events, view.y, view.m, day);
    const isToday =
      today.getFullYear() === view.y && today.getMonth() === view.m && today.getDate() === day;
    return { day, events: dayEvents, isToday };
  });

  const selectedEvents = selectedDay
    ? eventsForDay(events, view.y, view.m, selectedDay)
    : [];

  return (
    <DashboardWidget
      title={monthLabel}
      subtitle="Resumo do mês"
      action={
        <Link
          href="/calendario"
          className="group inline-flex items-center gap-1 text-xs font-medium text-brand-300 hover:text-brand-200"
        >
          Abrir calendário
          <IconArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      }
    >
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => {
            const prev = new Date(view.y, view.m - 1, 1);
            setView({ y: prev.getFullYear(), m: prev.getMonth() });
          }}
          aria-label="Mês anterior"
          className="rounded-md p-1 text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
        >
          <IconChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => {
            const next = new Date(view.y, view.m + 1, 1);
            setView({ y: next.getFullYear(), m: next.getMonth() });
          }}
          aria-label="Próximo mês"
          className="rounded-md p-1 text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
        >
          <IconChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1 text-center">
        {WEEKDAY_LABELS.map((label, index) => (
          <span key={index} className="text-[10px] font-semibold uppercase text-muted-2">
            {label}
          </span>
        ))}
        {cells.map((cell, index) => {
          if (!cell) return <span key={index} />;
          const hasEvents = cell.events.length > 0;
          return (
            <button
              key={index}
              type="button"
              onClick={() => hasEvents && setSelectedDay(cell.day)}
              className={cn(
                "relative mx-auto flex h-7 w-7 items-center justify-center rounded-lg text-xs transition-all",
                !hasEvents && "text-muted-2",
                hasEvents && "font-semibold text-brand-300 hover:bg-brand-500/15",
                cell.isToday && "ring-1 ring-brand-500 text-foreground",
                hasEvents && cell.isToday && "bg-brand-500/15"
              )}
              aria-label={`${cell.day} de ${monthLabel}, ${cell.events.length} compromissos`}
            >
              {cell.day}
              {hasEvents && (
                <span
                  className={cn(
                    "absolute bottom-0.5 h-1 w-1 rounded-full",
                    cell.isToday ? "bg-brand-400" : "bg-brand-500/70"
                  )}
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex items-center gap-3 border-t border-border pt-3 text-[11px] text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-500" /> com eventos
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full ring-1 ring-brand-500 bg-surface-2" /> hoje
        </span>
      </div>

      <Modal
        open={selectedDay !== null}
        onClose={() => setSelectedDay(null)}
        title={selectedDay ? `${String(selectedDay).padStart(2, "0")} ${monthLabel}` : ""}
        size="sm"
      >
        <ul className="flex flex-col gap-2">
          {selectedEvents.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted">
              Nenhum compromisso neste dia.
            </p>
          ) : (
            selectedEvents.map((event) => (
              <li
                key={event.id}
                className="flex items-start gap-3 rounded-lg border border-border bg-surface-2/60 p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{event.title}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    {event.time} · {event.duration}
                    {event.clientName ? ` · ${event.clientName}` : ""}
                  </p>
                </div>
                <Badge tone={CALENDAR_EVENT_TYPE_TONES[event.type]}>
                  {CALENDAR_EVENT_TYPE_LABELS[event.type]}
                </Badge>
              </li>
            ))
          )}
        </ul>
      </Modal>
    </DashboardWidget>
  );
}