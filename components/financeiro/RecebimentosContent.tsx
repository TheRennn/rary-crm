"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/StatCard";
import { SearchInput } from "@/components/ui/SearchInput";
import { Filter } from "@/components/ui/Filter";
import { Badge } from "@/components/ui/Badge";
import { DataTable, type TableColumn } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { RegisterRecebimentoModal } from "./RegisterRecebimentoModal";
import type { Recebimento, PaymentStatus } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PAYMENT_STATUS_LABELS, PAYMENT_STATUS_TONES } from "@/lib/constants";
import { useToast } from "@/components/ui/Toast";
import { Dropdown } from "@/components/ui/Dropdown";
import { IconTrendingUp, IconPlus, IconEdit, IconTrash } from "@/components/icons";
import type { RecebimentoStats } from "@/lib/services";

export interface RecebimentosContentProps {
  recebimentos: Recebimento[];
  stats: RecebimentoStats;
  clients: { id: string; name: string }[];
  existingCompanies: string[];
  currentUserId?: string;
  onDelete?: (recebimento: Recebimento) => void;
}

const paymentStatusOptions = (Object.keys(PAYMENT_STATUS_LABELS) as PaymentStatus[]).map((s) => ({
  value: s,
  label: PAYMENT_STATUS_LABELS[s],
}));

export function RecebimentosContent({
  recebimentos,
  stats,
  clients,
  existingCompanies,
  currentUserId,
  onDelete,
}: RecebimentosContentProps) {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("TODOS");
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecebimento, setEditRecebimento] = useState<Recebimento | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return recebimentos.filter((r) => {
      if (
        q &&
        !r.product.toLowerCase().includes(q) &&
        !r.companyName.toLowerCase().includes(q) &&
        !r.clientName.toLowerCase().includes(q)
      ) {
        return false;
      }
      if (paymentStatus !== "TODOS" && r.status !== paymentStatus) return false;
      return true;
    });
  }, [recebimentos, query, paymentStatus]);

  const columns: TableColumn<Recebimento>[] = [
    {
      key: "data",
      header: "Data",
      render: (r) => (
        <span className="text-muted">{r.date ? formatDate(r.date) : "—"}</span>
      ),
    },
    {
      key: "cliente",
      header: "Cliente",
      render: (r) => (
        <span className="text-foreground/90">{r.clientName || "—"}</span>
      ),
    },
    {
      key: "empresa",
      header: "Empresa",
      render: (r) => (
        <span className="text-foreground/90">{r.companyName}</span>
      ),
    },
    {
      key: "produto",
      header: "Produto",
      render: (r) => (
        <span className="font-medium text-foreground">{r.product}</span>
      ),
    },
    {
      key: "valor",
      header: "Valor",
      render: (r) => {
        const hasEntry = r.entryEnabled && r.entryValue && r.entryValue > 0;
        const hasShipping = r.shippingEnabled && r.shippingValue && r.shippingValue > 0;
        const hasDiscounts = hasEntry || hasShipping;
        return (
          <div className="flex flex-col">
            <span className="font-medium text-foreground">{formatCurrency(r.value)}</span>
            {hasDiscounts && (
              <span className="text-[11px] text-danger">
                -{hasEntry ? ` entrada ${formatCurrency(r.entryValue!)}` : ""}
                {hasShipping ? ` embarque ${formatCurrency(r.shippingValue!)}` : ""}
              </span>
            )}
            {hasDiscounts && (
              <span className="text-[11px] font-semibold text-foreground">= {formatCurrency(r.finalValue)}</span>
            )}
            {r.installments > 1 && (
              <span className="text-[11px] text-muted">{r.installments}x {formatCurrency(r.installmentValue)}</span>
            )}
          </div>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <Badge tone={PAYMENT_STATUS_TONES[r.status]} dot>
          {PAYMENT_STATUS_LABELS[r.status]}
        </Badge>
      ),
    },
    {
      key: "acoes",
      header: "Ações",
      className: "w-14",
      render: (r) => (
        <Dropdown
          align="right"
          triggerClassName="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-surface-3"
          trigger={<span className="text-muted">•••</span>}
          items={[
            {
              label: "Editar",
              icon: <IconEdit className="h-4 w-4" />,
              onClick: () => {
                setEditRecebimento(r);
                setModalOpen(true);
              },
            },
            {
              label: "Excluir",
              icon: <IconTrash className="h-4 w-4" />,
              danger: true,
              onClick: () => onDelete?.(r),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Recebimentos"
        description="Acompanhe os recebimentos do representante"
        actions={
          <Button onClick={() => { setEditRecebimento(null); setModalOpen(true); }}>
            <IconPlus className="h-4 w-4" />
            Novo recebimento
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total" value={formatCurrency(stats.total)} icon={<IconTrendingUp className="h-5 w-5" />} trend="neutral" trendLabel={`${stats.totalCount} registro(s)`} />
        <StatCard label="Pendentes" value={formatCurrency(stats.pendingValue)} icon={<IconTrendingUp className="h-5 w-5" />} trend="up" trendLabel={`${stats.pendingCount} pendente(s)`} />
        <StatCard label="Recebidos" value={formatCurrency(stats.paidValue)} icon={<IconTrendingUp className="h-5 w-5" />} trend="neutral" trendLabel={`${stats.paidCount} pago(s)`} />
        <StatCard label="Atrasados" value={formatCurrency(stats.overdueValue)} icon={<IconTrendingUp className="h-5 w-5" />} trend="down" trendLabel={`${stats.overdueCount} atrasado(s)`} />
      </div>

      <div className="rounded-xl border border-border bg-surface-1">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Buscar por produto, empresa ou cliente..."
            className="w-full sm:max-w-xs"
          />
          <div className="flex gap-2">
            <Filter
              options={paymentStatusOptions}
              value={paymentStatus}
              onChange={setPaymentStatus}
              className="w-full sm:w-48"
            />
          </div>
        </div>
        <DataTable
          columns={columns}
          data={filtered}
          rowKey={(r) => r.id}
          empty={
            <EmptyState
              icon={<IconTrendingUp className="h-6 w-6" />}
              title="Nenhum recebimento encontrado"
              description="Ajuste os filtros ou registre um novo recebimento."
            />
          }
        />
      </div>

      <RegisterRecebimentoModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditRecebimento(null); }}
        clients={clients}
        existingCompanies={existingCompanies}
        currentUserId={currentUserId}
        editRecebimento={editRecebimento}
      />
    </div>
  );
}
