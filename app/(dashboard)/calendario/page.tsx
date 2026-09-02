import { CalendarContent } from "@/components/calendario/CalendarContent";
import { calendarService, dealService, clientService, paymentService } from "@/lib/services";

export const dynamic = "force-dynamic";

export default async function CalendarioPage() {
  const [events, deals, clients, payments] = await Promise.all([
    calendarService.getAll().catch(() => []),
    dealService.getAll().catch(() => []),
    clientService.getAll().catch(() => []),
    paymentService.getAll().catch(() => []),
  ]);

  const clientNames = Object.fromEntries(clients.map((c) => [c.id, c.companyName]));

  return <CalendarContent events={events} deals={deals} payments={payments} clientNames={clientNames} />;
}