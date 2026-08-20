"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { SearchInput } from "@/components/ui/SearchInput";
import { Filter } from "@/components/ui/Filter";
import { Badge } from "@/components/ui/Badge";
import { DataTable, type TableColumn } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { SalesByMonth } from "./SalesByMonth";
import type { Deal, DealStatus } from "@/types";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import {
  DEAL_STATUS_LABELS,
  DEAL_STATUS_TONES,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_TONES,
} from "@/lib/constants";
import { IconTrendingUp, IconPlus } from "@/components/icons";
import type { DealStats } from "@/lib/services";

export interface SalesContentProps {
  deals: Deal[];
  stats: DealStats;
  clientNames: Record<string, string>;
}

const statusOptions = (Object.keys(DEAL_STATUS_LABELS) as DealStatus[]).map((status) => ({
  value: status,
  label: DEAL_STATUS_LABELS[status],
}));

export function SalesContent({ deals, stats, clientNames }: SalesContentProps) {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("TODOS");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return deals.filter((deal) => {
      if (
        q &&
        !deal.product.toLowerCase().includes(q) &&
        !deal.code.toLowerCase().includes(q) &&
        !(clientNames[deal.clientId] ?? deal.clientId).toLowerCase().includes(q)
      ) {
        return false;
      }
      if (status !== "TODOS" && deal.status !== status) return false;
      return true;
    });
  }, [deals, query, status, clientNames]);

  const columns: TableColumn<Deal>[] = [
    {
      key: "venda",
      header: "Venda",
      render: (deal) => (
        <div>
          <p className="font-medium text-foreground">{deal.product}</p>
          <p className="font-mono text-xs text-muted-2">{deal.code}</p>
        </div>
      ),
    },
    {
      key: "cliente",
      header: "Cliente",
      render: (deal) => (
        <Link href={`/clientes/${deal.clientId}`} className="text-foreground/90 hover:text-brand-300">
          {clientNames[deal.clientId] ?? deal.clientId}
        </Link>
      ),
    },
    {
      key: "valor",
      header: "Valor",
      render: (deal) => <span className="font-medium text-foreground">{formatCurrency(deal.value)}</span>,
    },
    {
      key: "data",
      header: "Data",
      render: (deal) => <span className="text-muted">{formatDate(deal.createdAt)}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (deal) => (
        <Badge tone={DEAL_STATUS_TONES[deal.status]} dot>
          {DEAL_STATUS_LABELS[deal.status]}
        </Badge>
      ),
    },
    {
      key: "pagamento",
      header: "Pagamento",
      render: (deal) => (
        <Badge tone={PAYMENT_STATUS_TONES[deal.paymentStatus]}>
          {PAYMENT_STATUS_LABELS[deal.paymentStatus]}
        </Badge>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Vendas"
        description="Acompanhe a performance comercial"
        actions={
          <Button
            onClick={() =>
              toast({
                title: "Registro de venda",
                message: "Acesse o cliente para registrar uma venda.",
                variant: "info",
              })
            }
          >
            <IconPlus className="h-4 w-4" />
            Nova venda
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Vendas realizadas" value={stats.total} icon={<IconTrendingUp className="h-5 w-5" />} trend="up" trendLabel={`${stats.concludedCount} concluídas`} />
        <StatCard label="Valor total" value={formatCurrency(stats.totalValue)} icon={<IconTrendingUp className="h-5 w-5" />} trend="neutral" trendLabel="em carteira" />
        <StatCard label="Ticket médio" value={formatCurrency(stats.averageTicket)} icon={<IconTrendingUp className="h-5 w-5" />} trend="neutral" trendLabel="por venda" />
        <StatCard label="Em negociação" value={formatCurrency(stats.pendingValue)} icon={<IconTrendingUp className="h-5 w-5" />} trend="up" trendLabel="potencial" />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-1">
          <SalesByMonth byMonth={stats.byMonth} />
        </div>
        <Card className="xl:col-span-2">
          <CardHeader title="Status das vendas" description="Distribuição do valor por etapa" />
          <CardContent>
            <div className="flex flex-col gap-3">
              {(Object.keys(DEAL_STATUS_LABELS) as DealStatus[]).map((dealStatus) => {
                const value = stats.byStatus[dealStatus] ?? 0;
                const pct = stats.totalValue ? (value / stats.totalValue) * 100 : 0;
                return (
                  <div key={dealStatus}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-muted">{DEAL_STATUS_LABELS[dealStatus]}</span>
                      <span className="font-medium text-foreground">{formatCurrency(value)}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-surface-2">
                      <div
                        className={cn("h-full rounded-full", pct > 0 && "bg-brand-500")}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface-1">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Buscar por produto, código ou cliente..."
            className="w-full sm:max-w-xs"
          />
          <Filter
            options={statusOptions}
            value={status}
            onChange={setStatus}
            className="w-full sm:w-48"
          />
        </div>
        <DataTable
          columns={columns}
          data={filtered}
          rowKey={(deal) => deal.id}
          empty={
            <EmptyState
              icon={<IconTrendingUp className="h-6 w-6" />}
              title="Nenhuma venda encontrada"
              description="Ajuste os filtros para encontrar a venda desejada."
            />
          }
        />
      </div>
    </div>
  );
}