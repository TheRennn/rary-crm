"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useToast } from "@/components/ui/Toast";
import { Dropdown } from "@/components/ui/Dropdown";
import { StatCard } from "@/components/ui/StatCard";
import { Filter } from "@/components/ui/Filter";
import { Badge } from "@/components/ui/Badge";
import { DataTable, type TableColumn } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Payment, PaymentStatus } from "@/types";
import { cn, formatCurrency, formatDate, isOverdue, relativeLabel } from "@/lib/utils";
import { PAYMENT_STATUS_LABELS, PAYMENT_STATUS_TONES } from "@/lib/constants";
import { IconCreditCard, IconCheckCircle, IconAlertCircle, IconClock, IconEdit, IconTrash, IconFileText } from "@/components/icons";
import type { PaymentStats } from "@/lib/services";

export interface PaymentsContentProps {
  payments: Payment[];
  stats: PaymentStats;
  onDelete?: (payment: Payment) => void;
  onEdit?: (payment: Payment) => void;
}

const statusOptions = (Object.keys(PAYMENT_STATUS_LABELS) as PaymentStatus[]).map((status) => ({
  value: status,
  label: PAYMENT_STATUS_LABELS[status],
}));

export function PaymentsContent({ payments, stats, onDelete, onEdit }: PaymentsContentProps) {
  const { toast } = useToast();
  const [status, setStatus] = useState("TODOS");
  const [period, setPeriod] = useState("TODOS");

  const periods = useMemo(
    () => Array.from(new Set(payments.map((p) => p.dueDate.slice(0, 7)))).sort().reverse(),
    [payments]
  );

  const filtered = useMemo(() => {
    return payments.filter((payment) => {
      if (status !== "TODOS" && payment.status !== status) return false;
      if (period !== "TODOS") {
        const paymentMonth = payment.dueDate.slice(0, 7);
        if (paymentMonth !== period) return false;
      }
      return true;
    });
  }, [payments, status, period]);

  const columns: TableColumn<Payment>[] = [
    {
      key: "cliente",
      header: "Cliente",
      render: (payment) => (
        <Link
          href={`/clientes/${payment.clientId}`}
          className="font-medium text-foreground hover:text-brand-300"
        >
          {payment.clientName}
        </Link>
      ),
    },
    {
      key: "compra",
      header: "Compra",
      render: (payment) => <span className="text-muted">{payment.description}</span>,
    },
    {
      key: "valor",
      header: "Valor",
      render: (payment) => (
        <span className="font-medium text-foreground">{formatCurrency(payment.value)}</span>
      ),
    },
    {
      key: "vencimento",
      header: "Vencimento",
      render: (payment) => (
        <div>
          <span className={cn("text-foreground/90", isOverdue(payment.dueDate) && payment.status !== "PAGO" && "text-danger")}>
            {formatDate(payment.dueDate, { day: "2-digit", month: "short" })}
          </span>
          <span className="ml-1.5 text-xs text-muted-2">{relativeLabel(payment.dueDate)}</span>
        </div>
      ),
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
    {
      key: "anexo",
      header: "Anexo",
      render: (payment) =>
        payment.attachmentUrl ? (
          <a
            href={payment.attachmentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-brand-300 hover:text-brand-200"
          >
            <IconFileText className="h-3.5 w-3.5" />
            {payment.attachmentName ?? "Ver anexo"}
          </a>
        ) : (
          <span className="text-muted-2">—</span>
        ),
    },
    {
      key: "acoes",
      header: "Ações",
      className: "w-14",
      render: (payment) => (
        <Dropdown
          align="right"
          triggerClassName="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-surface-3"
          trigger={<span className="text-muted">•••</span>}
          items={[
            {
              label: "Editar",
              icon: <IconEdit className="h-4 w-4" />,
              onClick: () => onEdit?.(payment),
            },
            {
              label: "Excluir",
              icon: <IconTrash className="h-4 w-4" />,
              danger: true,
              onClick: () => onDelete?.(payment),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Recebido"
          value={formatCurrency(stats.received)}
          icon={<IconCheckCircle className="h-5 w-5" />}
          trend="up"
          trendLabel={`${stats.receivedCount} pagamentos`}
        />
        <StatCard
          label="Pendente"
          value={formatCurrency(stats.pending)}
          icon={<IconClock className="h-5 w-5" />}
          trend="neutral"
          trendLabel={`${stats.pendingCount} aguardando`}
        />
        <StatCard
          label="Em atraso"
          value={formatCurrency(stats.overdue)}
          icon={<IconAlertCircle className="h-5 w-5" />}
          trend="down"
          trendLabel={`${stats.overdueCount} vencidos`}
        />
        <StatCard
          label="Total previsto"
          value={formatCurrency(stats.totalForecast)}
          icon={<IconCreditCard className="h-5 w-5" />}
          trend="neutral"
          trendLabel="a receber"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface-1">
        <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
          <Filter
            options={statusOptions}
            value={status}
            onChange={setStatus}
            className="w-full sm:w-44"
          />
          <Filter
            options={periods.map((p) => ({ value: p, label: p }))}
            value={period}
            onChange={setPeriod}
            className="w-full sm:w-36"
          />
        </div>
        <DataTable
          columns={columns}
          data={filtered}
          rowKey={(payment) => payment.id}
          empty={
            <EmptyState
              icon={<IconCreditCard className="h-6 w-6" />}
              title="Nenhum pagamento encontrado"
              description="Ajuste o filtro para encontrar o pagamento."
            />
          }
        />
      </div>
    </div>
  );
}