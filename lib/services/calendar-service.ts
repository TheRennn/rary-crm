import { calendarRepository } from "@/lib/repositories";
import type { CalendarEvent } from "@/types";

/**
 * Service de eventos de calendário.
 */
export class CalendarService {
  async getAll(): Promise<CalendarEvent[]> {
    return calendarRepository.findAll();
  }

  async getByDate(dateISO: string): Promise<CalendarEvent[]> {
    const events = await this.getAll();
    const target = dateISO.slice(0, 10);
    return events.filter((e) => e.date.slice(0, 10) === target);
  }
}

export const calendarService = new CalendarService();