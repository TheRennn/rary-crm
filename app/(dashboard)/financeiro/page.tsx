import {
  paymentService,
  commissionService,
  orderService,
  goalService,
  clientService,
} from "@/lib/services";
import { FinanceiroContentClient } from "@/components/financeiro/FinanceiroContentClient";

export const dynamic = "force-dynamic";

export default async function FinanceiroPage() {
  const [payments, paymentStats, commissions, orders, goals, clients] = await Promise.all([
    paymentService.getAll(),
    paymentService.getStats(),
    commissionService.getAll(),
    orderService.getAll(),
    goalService.getAll(),
    clientService.getAll(),
  ]);

  return (
    <FinanceiroContentClient
      payments={payments}
      paymentStats={paymentStats}
      commissions={commissions}
      orders={orders}
      goals={goals}
      clients={clients.map((client) => client.name)}
    />
  );
}