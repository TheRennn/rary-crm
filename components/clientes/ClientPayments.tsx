import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DataTable, type TableColumn } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Payment } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PAYMENT_STATUS_LABELS, PAYMENT_STATUS_TONES } from "@/lib/constants";
import { IconCreditCard } from "@/components/icons";

export function ClientPayments({ payments }: { payments: Payment[] }) {
  const columns: TableColumn<Payment>[] = [
    {
      key: "descricao",
      header: "Descrição",
      render: (payment) => <span className="font-medium text-foreground">{payment.description}</span>,
    },
    {
      key: "valor",
      header: "Valor",
      render: (payment) => <span className="font-medium text-foreground">{formatCurrency(payment.value)}</span>,
    },
    {
      key: "vencimento",
      header: "Vencimento",
      render: (payment) => <span className="text-muted">{formatDate(payment.dueDate)}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (payment) => (
        <Badge tone={PAYMENT_STATUS_TONES[payment.status]} dot>
          {PAYMENT_STATUS_LABELS[payment.status]}
        </Badge>
      ),
    },
    {
      key: "forma",
      header: "Forma de pagamento",
      render: (payment) => <span className="text-muted">{payment.method}</span>,
    },
  ];

  return (
    <Card>
      <CardHeader title="Pagamentos" description="Contas a receber do cliente" />
      <CardContent className="pt-2">
        <DataTable
          columns={columns}
          data={payments}
          rowKey={(payment) => payment.id}
          empty={
            <EmptyState
              icon={<IconCreditCard className="h-6 w-6" />}
              title="Nenhum pagamento"
              description="Pagamentos deste cliente aparecerão aqui."
            />
          }
        />
      </CardContent>
    </Card>
  );
}