"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/StatCard";
import { SearchInput } from "@/components/ui/SearchInput";
import { Filter } from "@/components/ui/Filter";
import { Badge } from "@/components/ui/Badge";
import { DataTable, type TableColumn } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { Dropdown } from "@/components/ui/Dropdown";
import { IconTrendingUp, IconPlus, IconEdit, IconTrash } from "@/components/icons";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { PAYMENT_STATUS_LABELS, PAYMENT_STATUS_TONES } from "@/lib/constants";
import type { Commission, Order, Recebimento, Payment, PaymentStatus } from "@/types";

type UnifiedItem = {
  id: string;
  type: "comissao" | "pedido" | "recebimento" | "pagamento";
  company: string;
  client: string;
  product: string;
  value: number;
  status: PaymentStatus;
  date: string;
  period: string;
  code?: string;
  installments?: number;
  installmentValue?: number;
  entryEnabled?: boolean;
  entryValue?: number;
  shippingEnabled?: boolean;
  shippingValue?: number;
  raw: Commission | Order | Recebimento | Payment;
};

export interface RepresentanteContentProps {
  commissions: Commission[];
  orders: Order[];
  recebimentos: Recebimento[];
  payments: Payment[];
  existingCompanies: string[];
  onEditCommission?: (c: Commission) => void;
  onEditOrder?: (o: Order) => void;
  onEditRecebimento?: (r: Recebimento) => void;
  onEditPayment?: (p: Payment) => void;
  onDeleteCommission?: (c: Commission) => void;
  onDeleteOrder?: (o: Order) => void;
  onDeleteRecebimento?: (r: Recebimento) => void;
  onDeletePayment?: (p: Payment) => void;
}

const TYPE_OPTIONS = [
  { value: "comissao", label: "Comissão" },
  { value: "pedido", label: "Pedido" },
  { value: "recebimento", label: "Recebimento" },
  { value: "pagamento", label: "Pagamento" },
];

const TYPE_BADGE_TONE: Record<string, "brand" | "info" | "success" | "warning"> = {
  comissao: "brand",
  pedido: "info",
  recebimento: "success",
  pagamento: "warning",
};

const TYPE_LABEL: Record<string, string> = {
  comissao: "Comissão",
  pedido: "Pedido",
  recebimento: "Recebimento",
  pagamento: "Pagamento",
};

const paymentStatusOptions = (Object.keys(PAYMENT_STATUS_LABELS) as PaymentStatus[]).map((s) => ({
  value: s,
  label: PAYMENT_STATUS_LABELS[s],
}));

function toUnified(commissions: Commission[], orders: Order[], recebimentos: Recebimento[], payments: Payment[]): UnifiedItem[] {
  const items: UnifiedItem[] = [];

  commissions.forEach((c) => {
    items.push({
      id: c.id,
      type: "comissao",
      company: c.companyName,
      client: "",
      product: `Comissão ${c.rate}%`,
      value: c.value,
      status: c.status,
      date: c.dueDate,
      period: c.period,
      raw: c,
    });
  });

  orders.forEach((o) => {
    items.push({
      id: o.id,
      type: "pedido",
      company: o.companyName,
      client: o.clientName,
      product: o.items.map((i) => i.product).join(", ") || "Pedido",
      value: o.total,
      status: o.status,
      date: o.date,
      period: o.period,
      code: o.code,
      installments: undefined,
      entryEnabled: !!o.entryValue,
      entryValue: o.entryValue,
      shippingEnabled: !!o.shippingValue,
      shippingValue: o.shippingValue,
      raw: o,
    });
  });

  recebimentos.forEach((r) => {
    items.push({
      id: r.id,
      type: "recebimento",
      company: r.companyName,
      client: r.clientName,
      product: r.product,
      value: r.finalValue,
      status: r.status,
      date: r.date ?? r.createdAt,
      period: "",
      installments: r.installments,
      installmentValue: r.installmentValue,
      entryEnabled: r.entryEnabled,
      entryValue: r.entryValue,
      shippingEnabled: r.shippingEnabled,
      shippingValue: r.shippingValue,
      raw: r,
    });
  });

  payments.forEach((p) => {
    items.push({
      id: p.id,
      type: "pagamento",
      company: "",
      client: p.clientName,
      product: p.description,
      value: p.value,
      status: p.status,
      date: p.dueDate,
      period: "",
      raw: p,
    });
  });

  return items;
}

export function RepresentanteContent({
  commissions,
  orders,
  recebimentos,
  payments,
  existingCompanies,
  onEditCommission,
  onEditOrder,
  onEditRecebimento,
  onEditPayment,
  onDeleteCommission,
  onDeleteOrder,
  onDeleteRecebimento,
  onDeletePayment,
}: RepresentanteContentProps) {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("TODOS");
  const [statusFilter, setStatusFilter] = useState("TODOS");
  const [companyFilter, setCompanyFilter] = useState("TODOS");

  const allItems = useMemo(() => toUnified(commissions, orders, recebimentos, payments), [commissions, orders, recebimentos, payments]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allItems.filter((item) => {
      if (q && !item.company.toLowerCase().includes(q) && !item.client.toLowerCase().includes(q) && !item.product.toLowerCase().includes(q) && !(item.code ?? "").toLowerCase().includes(q)) return false;
      if (typeFilter !== "TODOS" && item.type !== typeFilter) return false;
      if (statusFilter !== "TODOS" && item.status !== statusFilter) return false;
      if (companyFilter !== "TODOS" && item.company !== companyFilter) return false;
      return true;
    });
  }, [allItems, query, typeFilter, statusFilter, companyFilter]);

  const totalValue = allItems.reduce((s, i) => s + i.value, 0);
  const pendingValue = allItems.filter((i) => i.status === "PENDENTE" || i.status === "ATRASADO").reduce((s, i) => s + i.value, 0);
  const paidValue = allItems.filter((i) => i.status === "PAGO").reduce((s, i) => s + i.value, 0);
  const overdueValue = allItems.filter((i) => i.status === "ATRASADO").reduce((s, i) => s + i.value, 0);

  const companyOptions = useMemo(() => {
    const names = new Set(allItems.map((i) => i.company).filter(Boolean));
    return Array.from(names).sort().map((n) => ({ value: n, label: n }));
  }, [allItems]);

  function handleEdit(item: UnifiedItem) {
    if (item.type === "comissao") onEditCommission?.(item.raw as Commission);
    else if (item.type === "pedido") onEditOrder?.(item.raw as Order);
    else if (item.type === "recebimento") onEditRecebimento?.(item.raw as Recebimento);
    else onEditPayment?.(item.raw as Payment);
  }

  function handleDelete(item: UnifiedItem) {
    if (item.type === "comissao") onDeleteCommission?.(item.raw as Commission);
    else if (item.type === "pedido") onDeleteOrder?.(item.raw as Order);
    else if (item.type === "recebimento") onDeleteRecebimento?.(item.raw as Recebimento);
    else onDeletePayment?.(item.raw as Payment);
  }

  const columns: TableColumn<UnifiedItem>[] = [
    {
      key: "tipo",
      header: "Tipo",
      render: (item) => (
        <Badge tone={TYPE_BADGE_TONE[item.type]}>{TYPE_LABEL[item.type]}</Badge>
      ),
    },
    {
      key: "empresa",
      header: "Empresa",
      render: (item) => <span className="font-medium text-foreground">{item.company || "—"}</span>,
    },
    {
      key: "cliente",
      header: "Cliente",
      render: (item) => (
        item.client ? (
          <span className="text-foreground/80">{item.client}</span>
        ) : (
          <span className="text-muted-2">—</span>
        )
      ),
    },
    {
      key: "produto",
      header: "Detalhe",
      render: (item) => (
        <div className="flex flex-col">
          <span className="text-foreground/90">{item.product}</span>
          {item.code && <span className="font-mono text-[11px] text-muted-2">{item.code}</span>}
        </div>
      ),
    },
    {
      key: "valor",
      header: "Valor",
      render: (item) => {
        const hasEntry = item.entryEnabled && item.entryValue && item.entryValue > 0;
        const hasShipping = item.shippingEnabled && item.shippingValue && item.shippingValue > 0;
        const hasDiscounts = hasEntry || hasShipping;
        return (
          <div className="flex flex-col">
            <span className="font-medium text-foreground">{formatCurrency(item.value)}</span>
            {hasDiscounts && (
              <span className="text-[11px] text-danger">
                -{hasEntry ? ` entrada ${formatCurrency(item.entryValue!)}` : ""}
                {hasShipping ? ` embarque ${formatCurrency(item.shippingValue!)}` : ""}
              </span>
            )}
            {item.installments && item.installments > 1 && item.installmentValue && (
              <span className="text-[11px] text-muted">{item.installments}x {formatCurrency(item.installmentValue)}</span>
            )}
          </div>
        );
      },
    },
    {
      key: "data",
      header: "Data",
      render: (item) => <span className="text-muted">{item.date ? formatDate(item.date) : "—"}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (item) => (
        <Badge tone={PAYMENT_STATUS_TONES[item.status]} dot>
          {PAYMENT_STATUS_LABELS[item.status]}
        </Badge>
      ),
    },
    {
      key: "acoes",
      header: "Ações",
      className: "w-14",
      render: (item) => (
        <Dropdown
          align="right"
          triggerClassName="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-surface-3"
          trigger={<span className="text-muted">•••</span>}
          items={[
            { label: "Editar", icon: <IconEdit className="h-4 w-4" />, onClick: () => handleEdit(item) },
            { label: "Excluir", icon: <IconTrash className="h-4 w-4" />, danger: true, onClick: () => handleDelete(item) },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Representante"
        description="Comissões, pedidos e recebimentos integrados"
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total" value={formatCurrency(totalValue)} icon={<IconTrendingUp className="h-5 w-5" />} trend="neutral" trendLabel={`${allItems.length} registro(s)`} />
        <StatCard label="Pendentes" value={formatCurrency(pendingValue)} icon={<IconTrendingUp className="h-5 w-5" />} trend="up" trendLabel="a receber" />
        <StatCard label="Recebidos" value={formatCurrency(paidValue)} icon={<IconTrendingUp className="h-5 w-5" />} trend="neutral" trendLabel="liquidados" />
        <StatCard label="Atrasados" value={formatCurrency(overdueValue)} icon={<IconTrendingUp className="h-5 w-5" />} trend="down" trendLabel="em atraso" />
      </div>

      <div className="rounded-xl border border-border bg-surface-1">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Buscar por empresa, cliente ou produto..."
            className="w-full sm:max-w-xs"
          />
          <div className="flex gap-2">
            <Filter options={TYPE_OPTIONS} value={typeFilter} onChange={setTypeFilter} className="w-full sm:w-40" />
            <Filter options={paymentStatusOptions} value={statusFilter} onChange={setStatusFilter} className="w-full sm:w-40" />
            <Filter options={companyOptions} value={companyFilter} onChange={setCompanyFilter} className="w-full sm:w-48" />
          </div>
        </div>
        <DataTable
          columns={columns}
          data={filtered}
          rowKey={(item) => `${item.type}-${item.id}`}
          empty={
            <EmptyState
              icon={<IconTrendingUp className="h-6 w-6" />}
              title="Nenhum registro encontrado"
              description="Registre comissões, pedidos ou recebimentos para visualizar."
            />
          }
        />
      </div>
    </div>
  );
}
