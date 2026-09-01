import { CalendarContent } from "@/components/calendario/CalendarContent";
import { calendarService, dealService, clientService } from "@/lib/services";

export const dynamic = "force-dynamic";

export default async function CalendarioPage() {
  const [events, deals, clients] = await Promise.all([
    calendarService.getAll(),
    dealService.getAll(),
    clientService.getAll(),
  ]);

  const clientNames = Object.fromEntries(clients.map((c) => [c.id, c.companyName]));

  return <CalendarContent events={events} deals={deals} clientNames={clientNames} />;
}