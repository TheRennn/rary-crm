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
import type { Order, OrderType, PaymentStatus } from "@/types";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import {
  ORDER_TYPE_LABELS,
  ORDER_SOURCE_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_TONES,
  type BadgeTone,
} from "@/lib/constants";
import {
  IconSearch,
  IconX,
  IconInbox,
  IconClock,
  IconCheckCircle,
  IconTrendingUp,
  IconEdit,
  IconTrash,
} from "@/components/icons";

export interface PedidosContentProps {
  orders: Order[];
  onEdit?: (order: Order) => void;
  onDelete?: (order: Order) => void;
}

const statusOptions = (Object.keys(PAYMENT_STATUS_LABELS) as PaymentStatus[]).map((status) => ({
  value: status,
  label: PAYMENT_STATUS_LABELS[status],
}));

const typeOptions = (Object.keys(ORDER_TYPE_LABELS) as OrderType[]).map((type) => ({
  value: type,
  label: ORDER_TYPE_LABELS[type],
}));

const sourceOptions = Object.entries(ORDER_SOURCE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const TYPE_TONES: Record<OrderType, BadgeTone> = {
  VENDA: "brand",
  AMOSTRA: "info",
  BONIFICACAO: "warning",
};

export function PedidosContent({ orders, onEdit, onDelete }: PedidosContentProps) {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [type, setType] = useState("TODOS");
  const [status, setStatus] = useState("TODOS");
  const [source, setSource] = useState("TODOS");
  const [product, setProduct] = useState("TODOS");
  const [company, setCompany] = useState("TODOS");
  const [period, setPeriod] = useState("TODOS");

  const stats = useMemo(() => {
    const total = orders.reduce((acc, order) => acc + order.total, 0);
    const open = orders.filter((order) => order.status === "PENDENTE" || order.status === "ATRASADO");
    const settled = orders.filter((order) => order.status === "PAGO");
    const social = orders.filter((order) => order.type === "AMOSTRA" || order.type === "BONIFICACAO");
    return {
      total,
      openCount: open.length,
      openValue: open.reduce((acc, order) => acc + order.total, 0),
      settledCount: settled.length,
      socialCount: social.length,
    };
  }, [orders]);

  const searchTerms = useMemo(
    () => query.trim().toLowerCase().split(/\s+/).filter(Boolean),
    [query]
  );

  const filtered = useMemo(() => {
    return orders.filter((order) => {
      if (type !== "TODOS" && order.type !== type) return false;
      if (status !== "TODOS" && order.status !== status) return false;
      if (source !== "TODOS" && order.source !== source) return false;
      if (company !== "TODOS" && order.companyName !== company) return false;
      if (period !== "TODOS" && order.period !== period) return false;
      if (product !== "TODOS") {
        const productCodes = order.items.map((item) => item.productCode).filter(Boolean);
        const matchesProduct =
          order.items.some((item) => item.product === product) ||
          productCodes.includes(product);
        if (!matchesProduct) return false;
      }
      if (searchTerms.length > 0) {
        const haystack = [
          order.code,
          order.clientName,
          order.companyName,
          ...order.items.flatMap((item) => [item.product, item.productCode ?? ""]),
        ]
          .join(" ")
          .toLowerCase();
        if (!searchTerms.every((term) => haystack.includes(term))) return false;
      }
      return true;
    });
  }, [orders, type, status, source, company, period, product, searchTerms]);

  const products = useMemo(() => {
    const map = new Map<string, string>();
    orders.forEach((order) =>
      order.items.forEach((item) => {
        if (!item.product) return;
        map.set(item.product, item.productCode ? `${item.product} (${item.productCode})` : item.product);
      })
    );
    return Array.from(map.entries());
  }, [orders]);

  const companies = useMemo(
    () => Array.from(new Set(orders.map((order) => order.companyName))).sort(),
    [orders]
  );

  const periods = useMemo(
    () => Array.from(new Set(orders.map((order) => order.period))).sort().reverse(),
    [orders]
  );

  const hasActiveFilters =
    type !== "TODOS" || status !== "TODOS" || source !== "TODOS" || product !== "TODOS" || company !== "TODOS" || period !== "TODOS" || query.trim() !== "";

  function clearFilters() {
    setQuery("");
    setType("TODOS");
    setStatus("TODOS");
    setSource("TODOS");
    setProduct("TODOS");
    setCompany("TODOS");
    setPeriod("TODOS");
  }

  const columns: TableColumn<Order>[] = [
    {
      key: "pedido",
      header: "Pedido",
      render: (order) => (
        <div>
          <span className="font-mono text-xs font-semibold text-foreground">{order.code}</span>
          <span className="ml-1.5 text-xs text-muted-2">{formatDate(order.date, { day: "2-digit", month: "short" })}</span>
        </div>
      ),
    },
    {
      key: "cliente",
      header: "Cliente",
      render: (order) =>
        order.clientId ? (
          <Link href={`/clientes/${order.clientId}`} className="font-medium text-foreground hover:text-brand-300">
            {order.clientName}
          </Link>
        ) : (
          <span className="font-medium text-foreground">{order.clientName}</span>
        ),
    },
    {
      key: "empresa",
      header: "Empresa",
      render: (order) => <span className="text-muted">{order.companyName}</span>,
    },
    {
      key: "tipo",
      header: "Tipo",
      render: (order) => (
        <Badge tone={TYPE_TONES[order.type]}>{ORDER_TYPE_LABELS[order.type]}</Badge>
      ),
    },
    {
      key: "produtos",
      header: "Produtos",
      render: (order) => {
        const shown = order.items.slice(0, 2).map((item) =>
          item.productCode ? `${item.product} ${item.productCode}` : item.product
        );
        const rest = order.items.length - shown.length;
        return (
          <span className={cn("block max-w-[260px] truncate text-muted", rest > 0 && "text-[11px]")}>
            {shown.join(" · ")}
            {rest > 0 ? ` · +${rest} item(ns)` : ""}
          </span>
        );
      },
    },
    {
      key: "origem",
      header: "Origem",
      render: (order) => <span className="text-xs text-muted">{ORDER_SOURCE_LABELS[order.source]}</span>,
    },
    {
      key: "valor",
      header: "Valor",
      render: (order) => (
        <span className={cn("font-semibold tabular-nums", order.total === 0 ? "text-muted" : "text-foreground")}>
          {order.total === 0 ? "—" : formatCurrency(order.total)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (order) => (
        <Badge tone={PAYMENT_STATUS_TONES[order.status]} dot>
          {PAYMENT_STATUS_LABELS[order.status]}
        </Badge>
      ),
    },
    {
      key: "acoes",
      header: "Ações",
      className: "w-10",
      render: (order) => (
        <Dropdown
          align="right"
          triggerClassName="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-surface-3"
          trigger={<span className="text-muted">•••</span>}
          items={[
            {
              label: "Editar",
              icon: <IconEdit className="h-4 w-4" />,
              onClick: () => onEdit?.(order),
            },
            {
              label: "Excluir",
              icon: <IconTrash className="h-4 w-4" />,
              danger: true,
              onClick: () => onDelete?.(order),
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
          label="Total em pedidos"
          value={formatCurrency(stats.total)}
          icon={<IconTrendingUp className="h-5 w-5" />}
          trend="up"
          trendLabel={`${orders.length} pedidos`}
        />
        <StatCard
          label="Em aberto"
          value={formatCurrency(stats.openValue)}
          icon={<IconClock className="h-5 w-5" />}
          trend="neutral"
          trendLabel={`${stats.openCount} pedidos`}
        />
        <StatCard
          label="Liquidados"
          value={stats.settledCount}
          icon={<IconCheckCircle className="h-5 w-5" />}
          trend="neutral"
          trendLabel="pedidos pagos"
        />
        <StatCard
          label="Amostras & bonificação"
          value={stats.socialCount}
          icon={<IconInbox className="h-5 w-5" />}
          trend="neutral"
          trendLabel="registros sociais"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface-1">
        <div className="flex flex-col gap-3 border-b border-border p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-0 flex-1">
              <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-2" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar por código, cliente, produto ou código do produto…"
                className="h-10 w-full rounded-lg border border-border bg-surface-1 pl-9 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-2 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                aria-label="Buscar pedidos"
              />
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-muted transition-colors hover:text-danger"
              >
                <IconX className="h-3.5 w-3.5" />
                Limpar filtros
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            <Filter options={typeOptions} value={type} onChange={setType} className="col-span-2 sm:col-span-1" />
            <Filter options={statusOptions} value={status} onChange={setStatus} className="col-span-2 sm:col-span-1" />
            <Filter options={sourceOptions} value={source} onChange={setSource} className="col-span-2 sm:col-span-1" />
            <Filter
              options={products.map(([name, label]) => ({ value: name, label }))}
              value={product}
              onChange={setProduct}
              className="col-span-2 sm:col-span-1"
            />
            <Filter
              options={companies.map((name) => ({ value: name, label: name }))}
              value={company}
              onChange={setCompany}
              className="col-span-2 sm:col-span-1"
            />
            <Filter
              options={periods.map((periodOption) => ({ value: periodOption, label: periodOption }))}
              value={period}
              onChange={setPeriod}
              className="col-span-2 sm:col-span-1"
            />
          </div>
        </div>
        <DataTable
          columns={columns}
          data={filtered}
          rowKey={(order) => order.id}
          empty={
            <EmptyState
              icon={<IconInbox className="h-6 w-6" />}
              title="Nenhum pedido encontrado"
              description="Ajuste a busca ou os filtros para encontrar o pedido."
            />
          }
        />
      </div>
    </div>
  );
}