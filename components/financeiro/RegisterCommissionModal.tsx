"use client";

import { useMemo, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { IconPlus } from "@/components/icons";
import { useToast } from "@/components/ui/Toast";
import { commissionService } from "@/lib/services";
import { COMMISSION_METHOD_OPTIONS } from "@/lib/constants";
import type { Commission, CommissionPaymentMethod } from "@/types";
import { formatCurrency, cn } from "@/lib/utils";

export interface RegisterCommissionModalProps {
  open: boolean;
  onClose: () => void;
  existingCompanies: string[];
  onCreated: (commission: Commission) => void;
}

const inputClasses =
  "w-full rounded-lg border border-border-strong bg-surface-1 px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20";

export function RegisterCommissionModal({
  open,
  onClose,
  existingCompanies,
  onCreated,
}: RegisterCommissionModalProps) {
  const { toast } = useToast();
  const [company, setCompany] = useState("");
  const [period, setPeriod] = useState("");
  const [rate, setRate] = useState("");
  const [baseValue, setBaseValue] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState<Commission["status"]>("PENDENTE");
  const [method, setMethod] = useState<CommissionPaymentMethod>("A_VISTA");
  const [installmentsCount, setInstallmentsCount] = useState(1);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previewValue = useMemo(() => {
    const r = Number(rate) || 0;
    const b = Number(baseValue) || 0;
    return Math.round((b * r) / 100);
  }, [rate, baseValue]);

  const installmentsCountEffective =
    method === "A_VISTA" ? 1 : Math.max(1, Math.floor(installmentsCount));
  const installmentValue = installmentsCountEffective
    ? previewValue / installmentsCountEffective
    : 0;

  function reset() {
    setCompany("");
    setPeriod("");
    setRate("");
    setBaseValue("");
    setDueDate("");
    setStatus("PENDENTE");
    setMethod("A_VISTA");
    setInstallmentsCount(1);
    setNotes("");
    setError(null);
  }

  function handleClose() {
    if (saving) return;
    reset();
    onClose();
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const companyName = company.trim();
    if (!companyName) {
      setError("Informe a empresa representada.");
      return;
    }
    if (!period) {
      setError("Informe a competência (mês/ano).");
      return;
    }
    const rateValue = Number(rate);
    const baseValueNumber = Number(baseValue);
    if (!Number.isFinite(rateValue) || rateValue <= 0) {
      setError("Informe uma porcentagem de comissão válida.");
      return;
    }
    if (!Number.isFinite(baseValueNumber) || baseValueNumber <= 0) {
      setError("Informe a base de cálculo (valor vendido).");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const created = await commissionService.create({
        companyName,
        period,
        rate: rateValue,
        baseValue: baseValueNumber,
        dueDate: dueDate || undefined,
        status,
        method,
        installmentsCount: method === "A_VISTA" ? 1 : installmentsCountEffective,
        notes: notes.trim() || undefined,
      });
      onCreated(created);
      toast({
        title: "Comissão registrada",
        message:
          created.installments && created.installments.length > 1
            ? `${created.installments.length}x de ${formatCurrency(created.installments[0].value)} de ${created.companyName} — competência ${created.period}.`
            : `${formatCurrency(created.value)} de ${created.companyName} — competência ${created.period}.`,
        variant: "success",
      });
      reset();
      onClose();
    } catch {
      setError("Não foi possível registrar a comissão. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Registrar comissão"
      description="Comissão a receber de uma empresa representada"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={handleClose} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" form="commission-form" loading={saving}>
            <IconPlus className="h-4 w-4" />
            {previewValue > 0 ? `Salvar ${formatCurrency(previewValue)}` : "Salvar"}
          </Button>
        </>
      }
    >
      <form id="commission-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="cm-company" className="text-xs font-medium text-muted">
            Empresa representada <span className="text-danger">*</span>
          </label>
          <input
            id="cm-company"
            list="cm-companies"
            value={company}
            onChange={(event) => setCompany(event.target.value)}
            placeholder="Ex.: Eletro Sul"
            className={inputClasses}
            required
          />
          <datalist id="cm-companies">
            {existingCompanies.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="cm-period" className="text-xs font-medium text-muted">
              Competência <span className="text-danger">*</span>
            </label>
            <input
              id="cm-period"
              type="month"
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
              className={inputClasses}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="cm-status" className="text-xs font-medium text-muted">
              Status
            </label>
            <select
              id="cm-status"
              value={status}
              onChange={(event) => setStatus(event.target.value as Commission["status"])}
              className={inputClasses}
            >
              <option value="PENDENTE">Pendente (a receber)</option>
              <option value="PAGO">Pago</option>
              <option value="ATRASADO">Em atraso</option>
              <option value="CANCELADO">Cancelado</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="cm-rate" className="text-xs font-medium text-muted">
              Comissão (%) <span className="text-danger">*</span>
            </label>
            <input
              id="cm-rate"
              type="number"
              min="0"
              step="0.5"
              value={rate}
              onChange={(event) => setRate(event.target.value)}
              placeholder="Ex.: 5"
              className={inputClasses}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="cm-base" className="text-xs font-medium text-muted">
              Base de cálculo (R$) <span className="text-danger">*</span>
            </label>
            <input
              id="cm-base"
              type="number"
              min="0"
              step="0.01"
              value={baseValue}
              onChange={(event) => setBaseValue(event.target.value)}
              placeholder="Ex.: 50000"
              className={inputClasses}
              required
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted">Forma de recebimento</span>
          <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Forma de recebimento">
            {COMMISSION_METHOD_OPTIONS.map((option) => {
              const isActive = method === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  onClick={() => setMethod(option.value)}
                  className={cn(
                    "flex items-center justify-center gap-1 rounded-lg border px-2 py-2 text-xs font-medium transition-colors",
                    isActive
                      ? "border-brand-500/50 bg-brand-500/10 text-brand-300"
                      : "border-border-strong bg-surface-1 text-muted hover:text-foreground"
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        {method !== "A_VISTA" && (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="cm-installments" className="text-xs font-medium text-muted">
              Parcelamento
            </label>
            <div className="flex items-center gap-2">
              <input
                id="cm-installments"
                type="number"
                min="1"
                max="24"
                step="1"
                value={installmentsCount}
                onChange={(event) => setInstallmentsCount(Number(event.target.value) || 1)}
                className={cn(inputClasses, "w-24")}
              />
              <span className="text-sm text-muted">
                {installmentsCountEffective > 1
                  ? `parcelas de ${formatCurrency(installmentValue)}`
                  : "pagamento em parcela única"}
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="cm-due" className="text-xs font-medium text-muted">
            {method === "A_VISTA" ? "Vencimento (liquidação)" : "Vencimento (1ª parcela)"}
          </label>
          <input
            id="cm-due"
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            className={inputClasses}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="cm-notes" className="text-xs font-medium text-muted">
            Observação
          </label>
          <textarea
            id="cm-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={2}
            placeholder="Detalhes do acordo"
            className={cn(inputClasses, "resize-none")}
          />
        </div>

        <div className="flex flex-col gap-0.5 rounded-lg border border-border bg-surface-2 px-3 py-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Valor da comissão</span>
            <span className="text-sm font-bold tabular-nums text-foreground">
              {previewValue > 0 ? formatCurrency(previewValue) : "—"}
            </span>
          </div>
          {installmentsCountEffective > 1 && previewValue > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-muted">Parcelamento</span>
              <span className="text-xs font-medium tabular-nums text-muted">
                {installmentsCountEffective}x de {formatCurrency(installmentValue)}
              </span>
            </div>
          )}
        </div>

        {error && (
          <p className="rounded-lg border border-danger/25 bg-danger/10 px-3 py-2 text-xs font-medium text-danger">
            {error}
          </p>
        )}
      </form>
    </Modal>
  );
}