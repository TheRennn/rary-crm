import type { CalendarEvent } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import {
  CALENDAR_EVENT_TYPE_LABELS,
  CALENDAR_EVENT_TYPE_TONES,
} from "@/lib/constants";
import { IconCalendar, IconClock, IconUser } from "@/components/icons";

export interface EventDetailsProps {
  event: CalendarEvent;
}

export function EventDetails({ event }: EventDetailsProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={CALENDAR_EVENT_TYPE_TONES[event.type]} dot>
          {CALENDAR_EVENT_TYPE_LABELS[event.type]}
        </Badge>
        {event.clientName && (
          <Badge tone="neutral">{event.clientName}</Badge>
        )}
      </div>

      <div>
        <p className="text-lg font-semibold text-foreground">{event.title}</p>
        {event.description && (
          <p className="mt-1 text-sm leading-relaxed text-muted">{event.description}</p>
        )}
      </div>

      <dl className="space-y-2.5 rounded-lg border border-border bg-surface-1 p-4 text-sm">
        <div className="flex items-center gap-3">
          <IconCalendar className="h-4 w-4 text-muted-2" />
          <dt className="w-20 text-muted-2">Data</dt>
          <dd className="font-medium text-foreground">
            {formatDate(event.date, {
              weekday: "short",
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </dd>
        </div>
        <div className="flex items-center gap-3">
          <IconClock className="h-4 w-4 text-muted-2" />
          <dt className="w-20 text-muted-2">Horário</dt>
          <dd className="font-medium text-foreground">
            {event.time} {event.duration !== "—" && <span className="text-muted-2">· {event.duration}</span>}
          </dd>
        </div>
        {event.clientName && (
          <div className="flex items-center gap-3">
            <IconUser className="h-4 w-4 text-muted-2" />
            <dt className="w-20 text-muted-2">Cliente</dt>
            <dd className="font-medium text-foreground">{event.clientName}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}