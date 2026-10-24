import { createUniversalClient } from "@/lib/supabase/universal";
import { getUserIdFromUser } from "@/lib/supabase/auth";
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
    status: (row.status as CalendarEvent["status"]) ?? undefined,
  };
}

export type CreateCalendarEventInput = Omit<CalendarEvent, "id">;
export type UpdateCalendarEventInput = Partial<CreateCalendarEventInput>;

export class CalendarRepository {
  async findAll(_companyId?: string | null): Promise<CalendarEvent[]> {
    const supabase = await createUniversalClient();

    const { data, error } = await supabase
      .from("calendar_events")
      .select("*")
      .order("date", { ascending: true });

    if (error) throw error;
    if (!data) throw new Error("O Supabase não retornou dados para esta consulta.");
    return data.map(rowToEvent);
  }

  async create(input: CreateCalendarEventInput): Promise<CalendarEvent> {
    const supabase = await createUniversalClient();
    const ownerId = await getUserIdFromUser();
    if (!ownerId) throw new Error("Não foi possível identificar o usuário desta conta.");
    const id = `evt-${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;

    const row = {
      id,
      owner_user_id: ownerId,
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

  async update(id: string, input: UpdateCalendarEventInput): Promise<CalendarEvent> {
    const supabase = await createUniversalClient();
    const row: Record<string, unknown> = {};
    if (input.title !== undefined) row.title = input.title;
    if (input.type !== undefined) row.type = input.type;
    if (input.date !== undefined) row.date = input.date;
    if (input.time !== undefined) row.time = input.time;
    if (input.duration !== undefined) row.duration = input.duration;
    if (input.clientId !== undefined) row.client_id = input.clientId ?? null;
    if (input.clientName !== undefined) row.client_name = input.clientName ?? null;
    if (input.description !== undefined) row.description = input.description ?? null;
    if (input.status !== undefined) row.status = input.status ?? null;

    const { data, error } = await supabase.from("calendar_events").update(row).eq("id", id).select().single();
    if (error) throw error;
    return rowToEvent(data);
  }

  async delete(id: string): Promise<void> {
    const supabase = await createUniversalClient();
    const { data, error } = await supabase.from("calendar_events").delete().eq("id", id).select("id");
    if (error) throw error;
    if (!data?.length) throw new Error("Registro não encontrado ou sem permissão para excluí-lo.");
  }
}

export const calendarRepository = new CalendarRepository();
