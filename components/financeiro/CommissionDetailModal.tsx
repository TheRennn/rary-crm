"use client";

import { useMemo, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Filter } from "@/components/ui/Filter";
import { Badge } from "@/components/ui/Badge";
import { StatCard } from "@/components/ui/StatCard";
import { DataTable, type TableColumn } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Commission, PaymentStatus } from "@/types";
import { cn, formatCurrency, formatDate, isOverdue, relativeLabel } from "@/lib/utils";
import { PAYMENT_STATUS_LABELS, PAYMENT_STATUS_TONES, COMMISSION_METHOD_LABELS } from "@/lib/constants";
import {
  IconCheckCircle,
  IconAlertCircle,
  IconClock,
  IconTrendingUp,
  IconX,
} from "@/components/icons";

export interface CommissionDetailModalProps {
  open: boolean;
  onClose: () => void;
  commissions: Commission[];
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

const statusOptions = (Object.keys(PAYMENT_STATUS_LABELS) as PaymentStatus[]).map((status) => ({
  value: status,
  label: PAYMENT_STATUS_LABELS[status],
}));

export function CommissionDetailModal({
  open,
  onClose,
  commissions,
}: CommissionDetailModalProps) {
  const [status, setStatus] = useState("TODOS");
  const [period, setPeriod] = useState("TODOS");
  const [company, setCompany] = useState("TODOS");
  const [search, setSearch] = useState("");

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
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesSearch =
          commission.companyName.toLowerCase().includes(searchLower) ||
          commission.notes?.toLowerCase().includes(searchLower) ||
          commission.period.toLowerCase().includes(searchLower) ||
          formatPeriodFull(commission.period).toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }
      return true;
    });
  }, [commissions, status, period, company, search]);

  const stats = useMemo(() => {
    if (period !== "TODOS") {
      return summarizeByPeriod(filtered, period);
    }

    const received = filtered.filter((c) => c.status === "PAGO");
    const pending = filtered.filter((c) => c.status === "PENDENTE");
    const overdue = filtered.filter((c) => c.status === "ATRASADO");
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
  }, [filtered, period]);

  const companySummaries = useMemo(() => {
    const map = new Map<string, { receivable: number; received: number; count: number; averageRate: number }>();

    filtered.forEach((commission) => {
      const existing = map.get(commission.companyName) || { receivable: 0, received: 0, count: 0, averageRate: 0 };
      if (commission.status === "PAGO") {
        existing.received += commission.value;
      } else {
        existing.receivable += commission.value;
      }
      existing.count += 1;
      map.set(commission.companyName, existing);
    });

    return Array.from(map.entries())
      .map(([companyName, data]) => ({
        companyName,
        ...data,
        averageRate: data.count > 0 ? filtered.filter((c) => c.companyName === companyName).reduce((acc, c) => acc + c.rate, 0) / data.count : 0,
      }))
      .sort((a, b) => (b.receivable + b.received) - (a.receivable + a.received));
  }, [filtered]);

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
  ];

  const hasActiveFilters = status !== "TODOS" || period !== "TODOS" || company !== "TODOS" || search !== "";
  const periodLabel = period !== "TODOS" ? formatPeriodFull(period) : null;

  function clearFilters() {
    setStatus("TODOS");
    setPeriod("TODOS");
    setCompany("TODOS");
    setSearch("");
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Visão geral das comissões"
      description="Acompanhe todas as comissões por empresa representada"
      size="xl"
      footer={
        <Button type="button" variant="secondary" onClick={onClose}>
          Fechar
        </Button>
      }
    >
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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

        <section className="rounded-xl border border-border bg-surface-2 p-4">
          <h3 className="mb-3 text-sm font-semibold text-foreground">Por empresa representada</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
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
                      : "border-border bg-surface-1 hover:border-brand-500/30"
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

        <div className="rounded-xl border border-border bg-surface-2 p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div className="relative lg:col-span-2">
              <input
                type="text"
                placeholder="Buscar empresa, período ou observação..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 w-full appearance-none rounded-xl border border-border bg-surface-1 px-3 pl-10 text-sm text-foreground transition-all focus:outline-none focus:ring-2 focus:border-brand-500/60 focus:ring-brand-500/25"
              />
              <svg
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-2"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </div>
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
          </div>
          {hasActiveFilters && (
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-muted transition-colors hover:text-danger"
              >
                <IconX className="h-3.5 w-3.5" />
                Limpar filtros
              </button>
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-surface-1">
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
    </Modal>
  );
}
