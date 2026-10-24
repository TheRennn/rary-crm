import {
  paymentService,
  commissionService,
  orderService,
  recebimentoService,
  goalService,
  clientService,
  productService,
} from "@/lib/services";
import { FinanceiroContentClient } from "@/components/financeiro/FinanceiroContentClient";

export const dynamic = "force-dynamic";

export default async function FinanceiroPage() {
  const [payments, paymentStats, commissions, orders, recebimentos, recebimentoStats, goals, clients, products] = await Promise.all([
    paymentService.getAll(),
    paymentService.getStats().catch(() => ({ received: 0, pending: 0, overdue: 0, totalForecast: 0, receivedCount: 0, pendingCount: 0, overdueCount: 0 })),
    commissionService.getAll(),
    orderService.getAll(),
    recebimentoService.getAll(),
    recebimentoService.getStats().catch(() => ({ total: 0, totalCount: 0, pendingValue: 0, pendingCount: 0, paidValue: 0, paidCount: 0, overdueValue: 0, overdueCount: 0 })),
    goalService.getAll(),
    clientService.getAll(),
    productService.getAll(),
  ]);

  return (
    <FinanceiroContentClient
      payments={payments}
      paymentStats={paymentStats}
      commissions={commissions}
      orders={orders}
      recebimentos={recebimentos}
      recebimentoStats={recebimentoStats}
      goals={goals}
      products={products}
      clients={clients.map((client) => ({
        id: client.id,
        name: `[${client.kind === "FORNECEDOR" ? "FOR" : "CLT"}] ${client.name}`,
      }))}
    />
  );
}
