import { calendarRepository } from "@/lib/repositories";
import type { CalendarEvent } from "@/types";
import type { CreateCalendarEventInput, UpdateCalendarEventInput } from "@/lib/repositories/calendar-repository";

/**
 * Service de eventos de calendário.
 */
export class CalendarService {
  async getAll(): Promise<CalendarEvent[]> {
    return calendarRepository.findAll();
  }

  async create(input: CreateCalendarEventInput): Promise<CalendarEvent> {
    return calendarRepository.create(input);
  }

  async update(id: string, input: UpdateCalendarEventInput): Promise<CalendarEvent> {
    return calendarRepository.update(id, input);
  }

  async delete(id: string): Promise<void> {
    return calendarRepository.delete(id);
  }

  async getByDate(dateISO: string): Promise<CalendarEvent[]> {
    const events = await this.getAll();
    const target = dateISO.slice(0, 10);
    return events.filter((e) => e.date.slice(0, 10) === target);
  }
}

export const calendarService = new CalendarService();