import { SalesContent } from "@/components/vendas/SalesContent";
import { clientService, dealService } from "@/lib/services";

export default async function VendasPage() {
  const [deals, stats, clients] = await Promise.all([
    dealService.getAll(),
    dealService.getStats(),
    clientService.getAll(),
  ]);

  const clientMap = new Map(clients.map((client) => [client.id, client.companyName]));

  return (
    <SalesContent
      deals={deals}
      stats={stats}
      clientNames={Object.fromEntries(clientMap)}
    />
  );
}