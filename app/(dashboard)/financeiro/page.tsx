import {
  paymentService,
  commissionService,
  orderService,
  goalService,
  clientService,
} from "@/lib/services";
import { FinanceiroContent } from "@/components/financeiro/FinanceiroContent";

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
    <FinanceiroContent
      payments={payments}
      paymentStats={paymentStats}
      commissions={commissions}
      orders={orders}
      goals={goals}
      clients={clients.map((client) => client.name)}
    />
  );
}