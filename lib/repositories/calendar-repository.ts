import { createUniversalClient } from "@/lib/supabase/universal";
import type { CalendarEvent } from "@/types";

function rowToEvent(row: Record<string, unknown>): CalendarEvent {
  return {
    id: row.id as string,
    title: row.title as string,
    type: row.type as CalendarEvent["type"],
    date: row.date as string,
    time: (row.time as string) ?? "09:00",
    duration: (row.duration as string) ?? "30 min",
    clientId: (row.client_id as string) ?? undefined,
    clientName: (row.client_name as string) ?? undefined,
    description: (row.description as string) ?? undefined,
  };
}

export class CalendarRepository {
  async findAll(): Promise<CalendarEvent[]> {
    const supabase = await createUniversalClient();
    const { data, error } = await supabase
      .from("calendar_events")
      .select("*")
      .order("date", { ascending: true });

    if (error || !data) return [];
    return data.map(rowToEvent);
  }
}

export const calendarRepository = new CalendarRepository();
