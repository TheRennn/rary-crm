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

export type CreateCalendarEventInput = Omit<CalendarEvent, "id">;

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

  async create(input: CreateCalendarEventInput): Promise<CalendarEvent> {
    const supabase = await createUniversalClient();
    const id = `evt-${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;

    const row = {
      id,
      title: input.title,
      type: input.type,
      date: input.date,
      time: input.time,
      duration: input.duration,
      client_id: input.clientId ?? null,
      client_name: input.clientName ?? null,
      description: input.description ?? null,
    };

    const { error: insertError } = await supabase.from("calendar_events").insert(row);
    if (insertError) throw insertError;
    return { id, ...input };
  }

  async delete(id: string): Promise<void> {
    const supabase = await createUniversalClient();
    const { error } = await supabase.from("calendar_events").delete().eq("id", id);
    if (error) throw error;
  }
}

export const calendarRepository = new CalendarRepository();
