import { CalendarContent } from "@/components/calendario/CalendarContent";
import { calendarService } from "@/lib/services";

export default async function CalendarioPage() {
  const events = await calendarService.getAll();

  return <CalendarContent events={events} />;
}