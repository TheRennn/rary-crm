import { mockDatabase } from "@/lib/db/mock-adapter";
import type { CalendarEvent } from "@/types";

/**
 * Repository de eventos de calendário.
 *
 * TODO: substituir por consultas reais ao banco (PostgreSQL/Supabase).
 */
export class CalendarRepository {
  async findAll(): Promise<CalendarEvent[]> {
    return mockDatabase.read("calendarEvents");
  }
}

export const calendarRepository = new CalendarRepository();