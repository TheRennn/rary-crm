"use client";

import { formatCurrency } from "@/lib/utils";
import { IconBuilding, IconTrendingUp, IconCheckCircle, IconClock } from "@/components/icons";
import type { FinancialSummary } from "@/lib/dashboard/dashboard-types";

export interface FinancialWidgetProps {
  data?: FinancialSummary;
}

export function FinancialWidget({ data }: FinancialWidgetProps) {
  if (!data || data.companiesCount === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface-1 p-4">
        <div className="mb-3 flex items-center gap-2">
          <IconBuilding className="h-4 w-4 text-brand-400" />
          <h3 className="text-sm font-semibold text-foreground">Financeiro</h3>
        </div>
        <p className="text-xs text-muted">Registre comissões, pedidos e recebimentos para ver dados financeiros.</p>
      </div>
    );
  }

  const totalPending = data.pendingCommissions + data.pendingOrders + data.pendingRecebimentos;
  const totalPaid = data.paidCommissions + data.paidOrders + data.paidRecebimentos;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface-1 p-4">
      <div className="flex items-center gap-2">
        <IconBuilding className="h-4 w-4 text-brand-400" />
        <h3 className="text-sm font-semibold text-foreground">Financeiro</h3>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col gap-1 rounded-lg bg-surface-2 p-3">
          <div className="flex items-center gap-1.5 text-[11px] text-muted">
            <IconTrendingUp className="h-3 w-3" />
            Comissões
          </div>
          <span className="text-sm font-bold tabular-nums text-foreground">
            {formatCurrency(data.totalCommissions)}
          </span>
          <span className="text-[11px] text-muted">
            {formatCurrency(data.pendingCommissions)} pendente(s)
          </span>
        </div>
        <div className="flex flex-col gap-1 rounded-lg bg-surface-2 p-3">
          <div className="flex items-center gap-1.5 text-[11px] text-muted">
            <IconClock className="h-3 w-3" />
            Pedidos
          </div>
          <span className="text-sm font-bold tabular-nums text-foreground">
            {formatCurrency(data.totalOrders)}
          </span>
          <span className="text-[11px] text-muted">
            {formatCurrency(data.pendingOrders)} pendente(s)
          </span>
        </div>
        <div className="flex flex-col gap-1 rounded-lg bg-surface-2 p-3">
          <div className="flex items-center gap-1.5 text-[11px] text-muted">
            <IconCheckCircle className="h-3 w-3" />
            Recebimentos
          </div>
          <span className="text-sm font-bold tabular-nums text-foreground">
            {formatCurrency(data.totalRecebimentos)}
          </span>
          <span className="text-[11px] text-muted">
            {formatCurrency(data.pendingRecebimentos)} pendente(s)
          </span>
        </div>
      </div>

      {data.pendingByCompany.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-medium text-muted">Pendentes por empresa</span>
          {data.pendingByCompany.slice(0, 5).map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between rounded-lg bg-surface-2 px-3 py-2"
            >
              <span className="truncate text-xs font-medium text-foreground">
                {item.name}
              </span>
              <span className="ml-2 shrink-0 text-xs font-bold tabular-nums text-warning">
                {formatCurrency(item.pending)}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between text-[11px]">
        <span className="text-muted">
          A receber: <span className="font-medium text-warning">{formatCurrency(totalPending)}</span>
        </span>
        <span className="text-muted">
          Recebido: <span className="font-medium text-success">{formatCurrency(totalPaid)}</span>
        </span>
      </div>
    </div>
  );
}
