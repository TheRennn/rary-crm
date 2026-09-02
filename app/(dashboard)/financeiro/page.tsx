import {
  paymentService,
  commissionService,
  orderService,
  goalService,
  clientService,
  productService,
} from "@/lib/services";
import { FinanceiroContentClient } from "@/components/financeiro/FinanceiroContentClient";

export const dynamic = "force-dynamic";

export default async function FinanceiroPage() {
  const [payments, paymentStats, commissions, orders, goals, clients, products] = await Promise.all([
    paymentService.getAll().catch(() => []),
    paymentService.getStats().catch(() => ({ received: 0, pending: 0, overdue: 0, totalForecast: 0, receivedCount: 0, pendingCount: 0, overdueCount: 0 })),
    commissionService.getAll().catch(() => []),
    orderService.getAll().catch(() => []),
    goalService.getAll().catch(() => []),
    clientService.getAll().catch(() => []),
    productService.getAll().catch(() => []),
  ]);

  return (
    <FinanceiroContentClient
      payments={payments}
      paymentStats={paymentStats}
      commissions={commissions}
      orders={orders}
      goals={goals}
      products={products}
      clients={clients.map((client) => ({ id: client.id, name: client.name }))}
    />
  );
}