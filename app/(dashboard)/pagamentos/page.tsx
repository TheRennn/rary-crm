import { PaymentsContent } from "@/components/pagamentos/PaymentsContent";
import { paymentService } from "@/lib/services";

export default async function PagamentosPage() {
  const [payments, stats] = await Promise.all([
    paymentService.getAll(),
    paymentService.getStats(),
  ]);

  return <PaymentsContent payments={payments} stats={stats} />;
}