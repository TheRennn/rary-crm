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
import type { Commission, PaymentStatus } from "@/types";
import { cn, formatCurrency, formatDate, isOverdue, relativeLabel } from "@/lib/utils";
import { PAYMENT_STATUS_LABELS, PAYMENT_STATUS_TONES, COMMISSION_METHOD_LABELS } from "@/lib/constants";
import { IconInfo } from "@/components/ui/IconInfo";
import {
  IconCheckCircle,
  IconAlertCircle,
  IconClock,
  IconTrendingUp,
  IconArrowRight,
  IconEdit,
  IconTrash,
} from "@/components/icons";

export interface CommissionsContentProps {
  commissions: Commission[];
  onEdit?: (commission: Commission) => void;
  onDelete?: (commission: Commission) => void;
}

const statusOptions = (Object.keys(PAYMENT_STATUS_LABELS) as PaymentStatus[]).map((status) => ({
  value: status,
  label: PAYMENT_STATUS_LABELS[status],
}));

function summarize(commissions: Commission[]) {
  const received = commissions.filter((c) => c.status === "PAGO");
  const pending = commissions.filter((c) => c.status === "PENDENTE");
  const overdue = commissions.filter((c) => c.status === "ATRASADO");
  const sum = (list: Commission[]) => list.reduce((acc, c) => acc + c.value, 0);
  return {
    received: sum(received),
    pending: sum(pending),
    overdue: sum(overdue),
    totalForecast: sum(pending) + sum(overdue),
    receivedCount: received.length,
    pendingCount: pending.length,
    overdueCount: overdue.length,
  };
}

export function CommissionsContent({ commissions, onEdit, onDelete }: CommissionsContentProps) {
  const { toast } = useToast();
  const [status, setStatus] = useState("TODOS");
  const [period, setPeriod] = useState("TODOS");
  const [company, setCompany] = useState("TODOS");

  const stats = useMemo(() => summarize(commissions), [commissions]);

  const periods = useMemo(
    () => Array.from(new Set(commissions.map((c) => c.period))).sort().reverse(),
    [commissions]
  );
  const companies = useMemo(
    () => Array.from(new Set(commissions.map((c) => c.companyName))),
    [commissions]
  );

  const filtered = useMemo(() => {
    return commissions.filter((commission) => {
      if (status !== "TODOS" && commission.status !== status) return false;
      if (period !== "TODOS" && commission.period !== period) return false;
      if (company !== "TODOS" && commission.companyName !== company) return false;
      return true;
    });
  }, [commissions, status, period, company]);

  const companySummaries = useMemo(() => {
    return companies
      .map((companyName) => {
        const rows = commissions.filter((c) => c.companyName === companyName);
        const receivable = rows
          .filter((c) => c.status === "PENDENTE" || c.status === "ATRASADO")
          .reduce((acc, c) => acc + c.value, 0);
        const received = rows
          .filter((c) => c.status === "PAGO")
          .reduce((acc, c) => acc + c.value, 0);
        const rates = rows.map((c) => c.rate);
        const averageRate = rates.length
          ? rates.reduce((acc, r) => acc + r, 0) / rates.length
          : 0;
        return { companyName, receivable, received, count: rows.length, averageRate };
      })
      .sort((a, b) => b.receivable + b.received - (a.receivable + a.received));
  }, [companies, commissions]);

  const filteredTotals = useMemo(() => {
    const receivable = filtered
      .filter((c) => c.status === "PENDENTE" || c.status === "ATRASADO")
      .reduce((acc, c) => acc + c.value, 0);
    const paid = filtered.filter((c) => c.status === "PAGO").reduce((acc, c) => acc + c.value, 0);
    return { receivable, paid, total: receivable + paid };
  }, [filtered]);

  const columns: TableColumn<Commission>[] = [
    {
      key: "empresa",
      header: "Empresa representada",
      render: (commission) => (
        <span className="font-medium text-foreground">{commission.companyName}</span>
      ),
    },
    {
      key: "periodo",
      header: "Competência",
      render: (commission) => <span className="text-muted">{commission.period}</span>,
    },
    {
      key: "comissao",
      header: "Comissão",
      render: (commission) => (
        <Badge tone="brand">
          {commission.rate.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%
        </Badge>
      ),
    },
    {
      key: "base",
      header: "Base de cálculo",
      render: (commission) => <span className="text-muted">{formatCurrency(commission.baseValue)}</span>,
    },
    {
      key: "valor",
      header: "A receber",
      render: (commission) => (
        <span className="font-semibold text-foreground">{formatCurrency(commission.value)}</span>
      ),
    },
    {
      key: "vencimento",
      header: "Vencimento",
      render: (commission) => (
        <div>
          <span className={cn("text-foreground/90", isOverdue(commission.dueDate) && commission.status !== "PAGO" && "text-danger")}>
            {formatDate(commission.dueDate, { day: "2-digit", month: "short" })}
          </span>
          <span className="ml-1.5 text-xs text-muted-2">{relativeLabel(commission.dueDate)}</span>
        </div>
      ),
    },
    {
      key: "forma",
      header: "Forma",
      render: (commission) => (
        <div className="flex flex-col">
          <span className="text-muted">{COMMISSION_METHOD_LABELS[commission.method]}</span>
          {commission.installments && commission.installments.length > 1 ? (
            <span className="text-xs tabular-nums text-muted-2">
              {commission.installments.length}x de{" "}
              {formatCurrency(commission.installments[0].value)}
            </span>
          ) : (
            <span className="text-xs text-muted-2">parcela única</span>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (commission) => (
        <Badge tone={PAYMENT_STATUS_TONES[commission.status]} dot>
          {PAYMENT_STATUS_LABELS[commission.status]}
        </Badge>
      ),
    },
    {
      key: "obs",
      header: "Observação",
      render: (commission) =>
        commission.notes ? (
          <span className="block max-w-[220px] truncate text-muted" title={commission.notes}>
            {commission.notes}
          </span>
        ) : (
          <span className="text-muted-2">—</span>
        ),
    },
    {
      key: "acoes",
      header: "Ações",
      className: "w-10",
      render: (commission) => (
        <Dropdown
          align="right"
          triggerClassName="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-surface-3"
          trigger={<span className="text-muted">•••</span>}
          items={[
            {
              label: "Editar",
              icon: <IconEdit className="h-4 w-4" />,
              onClick: () => onEdit?.(commission),
            },
            {
              label: "Excluir",
              icon: <IconTrash className="h-4 w-4" />,
              danger: true,
              onClick: () => onDelete?.(commission),
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
          label="A receber"
          value={formatCurrency(stats.pending)}
          icon={<IconClock className="h-5 w-5" />}
          trend="up"
          trendLabel={`${stats.pendingCount} comissões`}
        />
        <StatCard
          label="Recebido"
          value={formatCurrency(stats.received)}
          icon={<IconCheckCircle className="h-5 w-5" />}
          trend="neutral"
          trendLabel={`${stats.receivedCount} comissões`}
        />
        <StatCard
          label="Em atraso"
          value={formatCurrency(stats.overdue)}
          icon={<IconAlertCircle className="h-5 w-5" />}
          trend="down"
          trendLabel={`${stats.overdueCount} vencidas`}
        />
        <StatCard
          label="Total previsto"
          value={formatCurrency(stats.totalForecast)}
          icon={<IconTrendingUp className="h-5 w-5" />}
          trend="neutral"
          trendLabel="comissões a receber"
        />
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-info/25 bg-info/10 px-4 py-3 text-xs text-muted">
        <IconInfo className="h-4 w-4 shrink-0 text-info" />
        <p>
          Representantes recebem conforme a <span className="font-semibold text-foreground">liquidação dos títulos</span>,
          independentemente da empresa representada.
        </p>
      </div>

      <section className="rounded-xl border border-border bg-surface-1 p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-foreground">Por empresa representada</h3>
          <span className="text-xs text-muted">
            {filteredTotals.total > 0
              ? `${formatCurrency(filteredTotals.receivable)} a receber · ${formatCurrency(filteredTotals.paid)} recebido`
              : ""}
            {company !== "TODOS" && (
              <button
                type="button"
                onClick={() => setCompany("TODOS")}
                className="ml-2 text-brand-300 hover:text-brand-200"
              >
                limpar
              </button>
            )}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {companySummaries.map((summary) => {
            const isActive = company === summary.companyName;
            return (
              <button
                key={summary.companyName}
                type="button"
                onClick={() => setCompany(isActive ? "TODOS" : summary.companyName)}
                className={cn(
                  "flex flex-col gap-1.5 rounded-lg border p-3 text-left transition-colors",
                  isActive
                    ? "border-brand-500/50 bg-brand-500/10"
                    : "border-border bg-surface-2 hover:border-brand-500/30"
                )}
              >
                <span className="truncate text-xs font-semibold text-foreground">
                  {summary.companyName}
                </span>
                <span className="text-sm font-bold tabular-nums text-foreground">
                  {formatCurrency(summary.receivable + summary.received)}
                </span>
                <span className="flex items-center justify-between text-[11px] text-muted">
                  <span>{summary.count} comissão(ões)</span>
                  <span className="tabular-nums">
                    {summary.averageRate.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <div className="overflow-hidden rounded-xl border border-border bg-surface-1">
        <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center">
          <div className="flex flex-1 flex-wrap items-center gap-3">
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
              className="w-full sm:w-40"
            />
            <Filter
              options={companies.map((c) => ({ value: c, label: c }))}
              value={company}
              onChange={setCompany}
              className="w-full sm:w-56"
            />
          </div>
          <Link
            href="/financeiro"
            className="inline-flex items-center gap-1 text-xs font-medium text-brand-300 transition-colors hover:text-brand-200"
          >
            Ver tudo
            <IconArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <DataTable
          columns={columns}
          data={filtered}
          rowKey={(commission) => commission.id}
          empty={
            <EmptyState
              icon={<IconTrendingUp className="h-6 w-6" />}
              title="Nenhuma comissão encontrada"
              description="Ajuste os filtros para encontrar a comissão."
            />
          }
        />
      </div>
    </div>
  );
}