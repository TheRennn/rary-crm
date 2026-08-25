import { SalesContent } from "@/components/vendas/SalesContent";
import { clientService, dealService, userService } from "@/lib/services";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function VendasPage() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  const [deals, stats, clients, currentUser, users] = await Promise.all([
    dealService.getAll(),
    dealService.getStats(),
    clientService.getAll(),
    authUser ? userService.getCurrentUser(authUser, supabase) : null,
    userService.getAllUsers(),
  ]);

  const clientMap = new Map(clients.map((client) => [client.id, client.companyName]));

  return (
    <SalesContent
      deals={deals}
      stats={stats}
      clientNames={Object.fromEntries(clientMap)}
      clients={clients.map((c) => ({ id: c.id, name: c.companyName, code: c.code }))}
      users={users.map((u) => ({ id: u.id, name: u.name }))}
      currentUserId={currentUser?.id ?? ""}
    />
  );
}