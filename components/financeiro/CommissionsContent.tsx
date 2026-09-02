"use client";

import { useMemo, useState } from "react";
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
import { CommissionDetailModal } from "./CommissionDetailModal";
import {
  IconCheckCircle,
  IconAlertCircle,
  IconClock,
  IconTrendingUp,
  IconEdit,
  IconTrash,
  IconEye,
} from "@/components/icons";

export interface CommissionsContentProps {
  commissions: Commission[];
  onEdit?: (commission: Commission) => void;
  onDelete?: (commission: Commission) => void;
}

const MONTH_NAMES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function formatPeriod(period: string): string {
  if (!period) return "—";
  const parts = period.split("-");
  if (parts.length !== 2) return period;
  const year = parts[0];
  const monthIndex = parseInt(parts[1], 10) - 1;
  if (isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11) return period;
  return `${MONTH_NAMES[monthIndex]}/${year.slice(2)}`;
}

function formatPeriodFull(period: string): string {
  if (!period) return "—";
  const parts = period.split("-");
  if (parts.length !== 2) return period;
  const year = parts[0];
  const monthIndex = parseInt(parts[1], 10) - 1;
  if (isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11) return period;
  return `${MONTH_NAMES[monthIndex]} ${year}`;
}

function getInstallmentValueInPeriod(commission: Commission, period: string): number {
  if (!commission.installments || commission.installments.length === 0) {
    return commission.period === period ? commission.value : 0;
  }
  return commission.installments
    .filter((inst) => inst.dueDate.slice(0, 7) === period)
    .reduce((acc, inst) => acc + inst.value, 0);
}

function getInstallmentStatusInPeriod(commission: Commission, period: string): PaymentStatus | null {
  if (!commission.installments || commission.installments.length === 0) {
    return commission.period === period ? commission.status : null;
  }
  const matching = commission.installments.filter((inst) => inst.dueDate.slice(0, 7) === period);
  if (matching.length === 0) return null;
  if (matching.some((inst) => inst.status === "ATRASADO")) return "ATRASADO";
  if (matching.every((inst) => inst.status === "PAGO")) return "PAGO";
  return "PENDENTE";
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

function summarizeByPeriod(commissions: Commission[], period: string) {
  let received = 0;
  let receivedCount = 0;
  let pending = 0;
  let pendingCount = 0;
  let overdue = 0;
  let overdueCount = 0;

  commissions.forEach((c) => {
    const value = getInstallmentValueInPeriod(c, period);
    if (value === 0) return;

    const st = getInstallmentStatusInPeriod(c, period);
    if (st === "PAGO") {
      received += value;
      receivedCount++;
    } else if (st === "ATRASADO") {
      overdue += value;
      overdueCount++;
    } else {
      pending += value;
      pendingCount++;
    }
  });

  return {
    received,
    pending,
    overdue,
    totalForecast: pending + overdue,
    receivedCount,
    pendingCount,
    overdueCount,
  };
}

export function CommissionsContent({ commissions, onEdit, onDelete }: CommissionsContentProps) {
  const { toast } = useToast();
  const [status, setStatus] = useState("TODOS");
  const [period, setPeriod] = useState("TODOS");
  const [company, setCompany] = useState("TODOS");
  const [detailOpen, setDetailOpen] = useState(false);

  const periods = useMemo(() => {
    const allPeriods = new Set<string>();
    commissions.forEach((c) => {
      if (c.period) allPeriods.add(c.period);
      c.installments?.forEach((inst) => {
        if (inst.dueDate) {
          const month = inst.dueDate.slice(0, 7);
          if (month) allPeriods.add(month);
        }
      });
    });
    return Array.from(allPeriods)
      .filter((p) => /^\d{4}-\d{2}$/.test(p))
      .sort()
      .reverse()
      .map((p) => ({ value: p, label: formatPeriod(p) }));
  }, [commissions]);

  const companies = useMemo(
    () => Array.from(new Set(commissions.map((c) => c.companyName))),
    [commissions]
  );

  const filtered = useMemo(() => {
    return commissions.filter((commission) => {
      if (status !== "TODOS" && commission.status !== status) return false;
      if (period !== "TODOS") {
        const valueInPeriod = getInstallmentValueInPeriod(commission, period);
        if (valueInPeriod === 0) return false;
      }
      if (company !== "TODOS" && commission.companyName !== company) return false;
      return true;
    });
  }, [commissions, status, period, company]);

  const stats = useMemo(() => {
    if (period !== "TODOS") {
      return summarizeByPeriod(filtered, period);
    }
    return summarize(filtered);
  }, [filtered, period]);

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
    if (period !== "TODOS") {
      const receivable = filtered.reduce(
        (acc, c) => acc + getInstallmentValueInPeriod(c, period),
        0
      );
      const paid = filtered
        .filter((c) => getInstallmentStatusInPeriod(c, period) === "PAGO")
        .reduce((acc, c) => acc + getInstallmentValueInPeriod(c, period), 0);
      return { receivable, paid, total: receivable + paid };
    }
    const receivable = filtered
      .filter((c) => c.status === "PENDENTE" || c.status === "ATRASADO")
      .reduce((acc, c) => acc + c.value, 0);
    const paid = filtered.filter((c) => c.status === "PAGO").reduce((acc, c) => acc + c.value, 0);
    return { receivable, paid, total: receivable + paid };
  }, [filtered, period]);

  const columns: TableColumn<Commission>[] = [
    {
      key: "empresa",
      header: "Empresa",
      render: (commission) => (
        <span className="font-medium text-foreground">{commission.companyName}</span>
      ),
    },
    {
      key: "periodo",
      header: "Competência",
      render: (commission) => (
        <span className="text-muted">{formatPeriod(commission.period)}</span>
      ),
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
      header: "Base",
      render: (commission) => <span className="text-muted">{formatCurrency(commission.baseValue)}</span>,
    },
    {
      key: "valor",
      header: "A receber",
      render: (commission) => {
        const value = period !== "TODOS"
          ? getInstallmentValueInPeriod(commission, period)
          : commission.value;
        return (
          <span className="font-semibold text-foreground">{formatCurrency(value)}</span>
        );
      },
    },
    {
      key: "vencimento",
      header: "Vencimento",
      render: (commission) => {
        let dueDate = commission.dueDate;
        let statusForDate = commission.status;

        if (period !== "TODOS" && commission.installments && commission.installments.length > 0) {
          const inst = commission.installments.find((i) => i.dueDate.slice(0, 7) === period);
          if (inst) {
            dueDate = inst.dueDate;
            statusForDate = inst.status;
          }
        }

        return (
          <div>
            <span className={cn("text-foreground/90", isOverdue(dueDate) && statusForDate !== "PAGO" && "text-danger")}>
              {formatDate(dueDate, { day: "2-digit", month: "short" })}
            </span>
            <span className="ml-1.5 text-xs text-muted-2">{relativeLabel(dueDate)}</span>
          </div>
        );
      },
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
      render: (commission) => {
        const st = period !== "TODOS"
          ? getInstallmentStatusInPeriod(commission, period)
          : commission.status;
        if (!st) return <span className="text-muted-2">—</span>;
        return (
          <Badge tone={PAYMENT_STATUS_TONES[st]} dot>
            {PAYMENT_STATUS_LABELS[st]}
          </Badge>
        );
      },
    },
    {
      key: "obs",
      header: "Obs",
      render: (commission) =>
        commission.notes ? (
          <span className="block max-w-[180px] truncate text-muted" title={commission.notes}>
            {commission.notes}
          </span>
        ) : (
          <span className="text-muted-2">—</span>
        ),
    },
    {
      key: "acoes",
      header: "",
      className: "w-14",
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

  const periodLabel = period !== "TODOS" ? formatPeriodFull(period) : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="A receber"
          value={formatCurrency(stats.pending)}
          icon={<IconClock className="h-5 w-5" />}
          trend="up"
          trendLabel={periodLabel ? `${periodLabel} · ${stats.pendingCount} parcela(s)` : `${stats.pendingCount} comissões`}
        />
        <StatCard
          label="Recebido"
          value={formatCurrency(stats.received)}
          icon={<IconCheckCircle className="h-5 w-5" />}
          trend="neutral"
          trendLabel={periodLabel ? `${periodLabel} · ${stats.receivedCount} parcela(s)` : `${stats.receivedCount} comissões`}
        />
        <StatCard
          label="Em atraso"
          value={formatCurrency(stats.overdue)}
          icon={<IconAlertCircle className="h-5 w-5" />}
          trend="down"
          trendLabel={periodLabel ? `${periodLabel} · ${stats.overdueCount} parcela(s)` : `${stats.overdueCount} vencidas`}
        />
        <StatCard
          label="Total previsto"
          value={formatCurrency(stats.totalForecast)}
          icon={<IconTrendingUp className="h-5 w-5" />}
          trend="neutral"
          trendLabel={periodLabel ? "no período selecionado" : "comissões a receber"}
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
        <div className="border-b border-border p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Filter
              options={statusOptions}
              value={status}
              onChange={setStatus}
              className="w-full"
              label="Status"
            />
            <Filter
              options={periods}
              value={period}
              onChange={setPeriod}
              className="w-full"
              label="Competência"
            />
            <Filter
              options={companies.map((c) => ({ value: c, label: c }))}
              value={company}
              onChange={setCompany}
              className="w-full"
              label="Empresa"
            />
            <button
              type="button"
              onClick={() => setDetailOpen(true)}
              className="inline-flex h-11 items-center justify-center gap-2 self-end rounded-xl border border-brand-500/30 bg-brand-500/10 px-4 text-sm font-medium text-brand-300 transition-colors hover:bg-brand-500/20 hover:text-brand-200"
            >
              <IconEye className="h-4 w-4" />
              Ver tudo
            </button>
          </div>
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

      <CommissionDetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        commissions={commissions}
      />
    </div>
  );
}
