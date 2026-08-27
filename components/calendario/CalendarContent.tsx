"use client";

import { useMemo, useState, type FormEvent } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { DatePicker } from "@/components/ui/DatePicker";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { EventDetails } from "@/components/events/EventDetails";
import { calendarService } from "@/lib/services";
import type { CalendarEvent, CalendarEventType } from "@/types";
import { cn, monthLabel } from "@/lib/utils";
import {
  CALENDAR_EVENT_TYPE_LABELS,
  CALENDAR_EVENT_TYPE_TONES,
} from "@/lib/constants";
import { IconChevronLeft, IconChevronRight, IconCalendar, IconCalendarPlus } from "@/components/icons";

export interface CalendarContentProps {
  events: CalendarEvent[];
}

const typeOptions = (Object.keys(CALENDAR_EVENT_TYPE_LABELS) as CalendarEventType[]).map((type) => ({
  value: type,
  label: CALENDAR_EVENT_TYPE_LABELS[type],
}));

function toISOLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function CalendarContent({ events }: CalendarContentProps) {
  const { toast } = useToast();
  const [view, setView] = useState<"mes" | "agenda">("mes");
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selected, setSelected] = useState<CalendarEvent | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const event of events) {
      const key = event.date.slice(0, 10);
      const list = map.get(key) ?? [];
      list.push(event);
      map.set(key, list);
    }
    return map;
  }, [events]);

  const calendar = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const first = new Date(year, month, 1);
    const startOffset = (first.getDay() + 6) % 7; // segunda como primeiro dia
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayISO = toISOLocal(new Date());
    const cells: Array<{ day: number | null; iso: string | null; events: CalendarEvent[] }> = [];

    for (let i = 0; i < startOffset; i++) {
      cells.push({ day: null, iso: null, events: [] });
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const iso = toISOLocal(new Date(year, month, day));
      cells.push({ day, iso, events: eventsByDay.get(iso) ?? [] });
    }
    while (cells.length % 7 !== 0) {
      cells.push({ day: null, iso: null, events: [] });
    }
    return { cells, todayISO };
  }, [cursor, eventsByDay]);

  const agenda = useMemo(() => {
    const todayISO = toISOLocal(new Date());
    return events
      .filter((event) => event.date.slice(0, 10) >= todayISO)
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  }, [events]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const title = formData.get("evt-titulo") as string;
    const type = (formData.get("evt-tipo") as CalendarEventType) || "COMPROMISSO";
    const date = formData.get("evt-data") as string;
    const time = formData.get("evt-hora") as string;
    const duration = (formData.get("evt-duracao") as string) || "30 min";
    const description = formData.get("evt-desc") as string;

    try {
      const created = await calendarService.create({
        title,
        type,
        date,
        time,
        duration,
        description: description || undefined,
      });
      setNewOpen(false);
      toast({ title: "Compromisso criado", message: `${created.title} em ${created.date}`, variant: "success" });
    } catch {
      toast({ title: "Erro ao criar", message: "Não foi possível criar o compromisso.", variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Calendário"
        description="Follow-ups, reuniões, tarefas e vencimentos"
        actions={
          <>
            <div className="flex items-center rounded-lg border border-border bg-surface-1 p-0.5">
              <button
                type="button"
                onClick={() => setView("mes")}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  view === "mes" ? "bg-surface-3 text-foreground" : "text-muted hover:text-foreground"
                )}
              >
                Mês
              </button>
              <button
                type="button"
                onClick={() => setView("agenda")}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  view === "agenda" ? "bg-surface-3 text-foreground" : "text-muted hover:text-foreground"
                )}
              >
                Agenda
              </button>
            </div>
            <Button onClick={() => setNewOpen(true)}>
              <IconCalendarPlus className="h-4 w-4" />
              Novo compromisso
            </Button>
          </>
        }
      />

      {view === "mes" ? (
        <Card>
          <CardContent className="p-0">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h2 className="text-sm font-semibold capitalize text-foreground">
                {monthLabel(cursor)}
              </h2>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
                  aria-label="Mês anterior"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
                >
                  <IconChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
                  aria-label="Próximo mês"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
                >
                  <IconChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 border-b border-border">
              {WEEKDAYS.map((weekday) => (
                <div
                  key={weekday}
                  className="px-2 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-2"
                >
                  {weekday}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {calendar.cells.map((cell, index) => {
                const isToday = cell.iso === calendar.todayISO;
                return (
                  <div
                    key={index}
                    className={cn(
                      "flex min-h-[88px] flex-col gap-1 border-b border-r border-border/60 p-1.5",
                      cell.day === null && "bg-surface-0/40",
                      (index + 1) % 7 === 0 && "border-r-0"
                    )}
                  >
                    {cell.day !== null && (
                      <>
                        <span
                          className={cn(
                            "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                            isToday ? "bg-brand-500 text-white" : "text-muted"
                          )}
                        >
                          {cell.day}
                        </span>
                        <div className="flex flex-col gap-0.5">
                          {cell.events.slice(0, 3).map((event) => (
                            <button
                              key={event.id}
                              type="button"
                              onClick={() => setSelected(event)}
                              className="truncate rounded px-1.5 py-0.5 text-left text-[11px] leading-tight transition-colors hover:opacity-80"
                              style={{
                                backgroundColor: toneBg[event.type],
                                color: toneText[event.type],
                              }}
                            >
                              {event.time !== "00:00" && (
                                <span className="mr-1 opacity-70">{event.time}</span>
                              )}
                              {event.title}
                            </button>
                          ))}
                          {cell.events.length > 3 && (
                            <span className="px-1 text-[10px] text-muted-2">
                              +{cell.events.length - 3} mais
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader title="Agenda" description="Próximos compromissos em ordem cronológica" />
          <CardContent className="px-2 py-2">
            {agenda.length === 0 ? (
              <EmptyState
                icon={<IconCalendar className="h-6 w-6" />}
                title="Agenda livre"
                description="Nenhum compromisso futuro. Crie um novo compromisso."
              />
            ) : (
              <ul className="divide-y divide-border/60">
                {agenda.map((event) => (
                  <li key={event.id}>
                    <button
                      type="button"
                      onClick={() => setSelected(event)}
                      className="flex w-full items-center gap-4 px-3 py-3 text-left transition-colors hover:bg-surface-2"
                    >
                      <div className="w-32 shrink-0">
                        <p className="text-sm font-medium text-foreground">
                          {new Intl.DateTimeFormat("pt-BR", { weekday: "short", day: "2-digit", month: "short" })
                            .format(new Date(event.date + "T00:00:00"))}
                        </p>
                        <p className="text-xs text-muted-2">{event.time}</p>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{event.title}</p>
                        {event.clientName && (
                          <p className="truncate text-xs text-muted">{event.clientName}</p>
                        )}
                      </div>
                      <Badge tone={CALENDAR_EVENT_TYPE_TONES[event.type]}>
                        {CALENDAR_EVENT_TYPE_LABELS[event.type]}
                      </Badge>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}

      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title="Detalhes do compromisso"
      >
        {selected && <EventDetails event={selected} />}
      </Modal>

      <Modal
        open={newOpen}
        onClose={() => setNewOpen(false)}
        title="Novo compromisso"
        description="Agende um follow-up, reunião, tarefa ou lembrete de vencimento"
        footer={
          <>
            <Button variant="ghost" onClick={() => setNewOpen(false)}>Cancelar</Button>
            <Button type="submit" form="event-form" loading={saving}>
              Criar compromisso
            </Button>
          </>
        }
      >
        <form id="event-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input id="evt-titulo" label="Título" placeholder="Ex.: Reunião de alinhamento" required />
          <Select
            id="evt-tipo"
            label="Tipo"
            options={typeOptions}
            placeholder="Selecione"
            required
            defaultValue="COMPROMISSO"
          />
          <div className="grid grid-cols-2 gap-4">
            <DatePicker id="evt-data" label="Data" required />
            <Input id="evt-hora" label="Horário" type="time" required />
          </div>
          <Input id="evt-duracao" label="Duração" placeholder="Ex.: 1 h" />
          <Textarea id="evt-desc" label="Descrição" placeholder="Detalhes do compromisso..." rows={3} />
        </form>
      </Modal>
    </div>
  );
}

const toneBg: Record<CalendarEventType, string> = {
  FOLLOW_UP: "rgba(124,58,237,0.14)",
  REUNIAO: "rgba(96,165,250,0.14)",
  TAREFA: "rgba(251,191,36,0.14)",
  VENCIMENTO: "rgba(248,113,113,0.14)",
  COMPROMISSO: "rgba(138,138,149,0.14)",
};

const toneText: Record<CalendarEventType, string> = {
  FOLLOW_UP: "#c4b5fd",
  REUNIAO: "#93c5fd",
  TAREFA: "#fcd34d",
  VENCIMENTO: "#fca5a5",
  COMPROMISSO: "#a1a1aa",
};