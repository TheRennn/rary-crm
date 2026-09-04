import { redirect } from "next/navigation";
import { CalendarContent } from "@/components/calendario/CalendarContent";
import { calendarService, dealService, clientService, paymentService, followUpService } from "@/lib/services";
import { createClient } from "@/lib/supabase/server";
import type { CalendarEvent } from "@/types";

export const dynamic = "force-dynamic";

export default async function CalendarioPage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect("/login");
  }

  const [events, deals, clients, payments, followUpGroups] = await Promise.all([
    calendarService.getAll(),
    dealService.getAll(),
    clientService.getAll(),
    paymentService.getAll(),
    followUpService.getGroups(),
  ]);

  const clientNames = Object.fromEntries(clients.map((c) => [c.id, c.companyName]));

  const allFollowUps = [
    ...followUpGroups.hoje,
    ...followUpGroups.atrasados,
    ...followUpGroups.proximos,
    ...followUpGroups.concluidos,
  ];

  const followUpEvents: CalendarEvent[] = allFollowUps.map((fu) => ({
    id: `fu-${fu.id}`,
    title: fu.subject || `Follow-up: ${fu.clientName || "Sem cliente"}`,
    type: "FOLLOW_UP" as CalendarEvent["type"],
    date: fu.date.slice(0, 10),
    time: fu.time || "09:00",
    duration: "30 min",
    clientId: fu.clientId,
    clientName: fu.clientName,
    description: `Tipo: ${fu.type} · Status: ${fu.status}`,
  }));

  return (
    <CalendarContent
      events={[...events, ...followUpEvents]}
      deals={deals}
      payments={payments}
      clientNames={clientNames}
      clients={clients.map((c) => ({ id: c.id, name: c.companyName }))}
    />
  );
}
