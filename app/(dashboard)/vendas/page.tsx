import { SalesContentClient } from "@/components/vendas/SalesContentClient";
import { clientService, dealService, userService } from "@/lib/services";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function VendasPage() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  const [deals, stats, clients, currentUser] = await Promise.all([
    dealService.getAll().catch(() => []),
    dealService.getStats().catch(() => ({ total: 0, concludedCount: 0, totalValue: 0, averageTicket: 0, concludedValue: 0, pendingValue: 0, canceledValue: 0, byStatus: {}, byMonth: {} })),
    clientService.getAll().catch(() => []),
    authUser ? userService.getCurrentUser(authUser, supabase).catch(() => null) : null,
  ]);

  const clientMap = new Map(clients.map((client) => [client.id, client.companyName]));

  return (
    <SalesContentClient
      deals={deals}
      stats={stats}
      clientNames={Object.fromEntries(clientMap)}
      clients={clients.map((c) => ({ id: c.id, name: c.companyName, code: c.code }))}
      currentUserId={currentUser?.id ?? ""}
    />
  );
}