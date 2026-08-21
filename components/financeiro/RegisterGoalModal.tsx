"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { IconPlus } from "@/components/icons";
import { useToast } from "@/components/ui/Toast";
import { goalService } from "@/lib/services";
import { GOAL_TARGET_LABELS } from "@/lib/constants";
import { formatCurrency, cn } from "@/lib/utils";
import type { Goal, GoalTargetType } from "@/types";
import type { GoalCurrents } from "./GoalsView";

export interface RegisterGoalModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (goal: Goal) => void;
  currents?: GoalCurrents;
}

const inputClasses =
  "w-full rounded-lg border border-border-strong bg-surface-1 px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20";

const GOAL_TYPE_OPTIONS: { value: GoalTargetType; label: string; hint: string }[] = [
  { value: "CLIENTES", label: "Clientes", hint: "quantidade" },
  { value: "FATURAMENTO", label: "Faturamento", hint: "em reais" },
  { value: "VENDAS", label: "Vendas", hint: "em reais" },
];

export function RegisterGoalModal({ open, onClose, onCreated, currents }: RegisterGoalModalProps) {
  const { toast } = useToast();
  const [targetType, setTargetType] = useState<GoalTargetType>("FATURAMENTO");
  const [targetValue, setTargetValue] = useState("");
  const [period, setPeriod] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setTargetType("FATURAMENTO");
    setTargetValue("");
    setPeriod("");
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
    const value = Number(targetValue);
    if (!Number.isFinite(value) || value <= 0) {
      setError("Informe um valor de meta válido.");
      return;
    }
    if (!period) {
      setError("Informe a competência (mês/ano).");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const snapshot = currents?.[targetType.toLowerCase() as keyof GoalCurrents];
      const created = await goalService.create({
        targetType,
        targetValue: value,
        period,
        currentValue: snapshot,
        notes: notes.trim() || undefined,
      });
      onCreated(created);
      toast({
        title: "Meta registrada",
        message: `${GOAL_TARGET_LABELS[targetType]} de ${formatCurrency(value)} para ${period}.`,
        variant: "success",
      });
      reset();
      onClose();
    } catch {
      setError("Não foi possível registrar a meta. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Adicionar meta"
      description="Meta de clientes, faturamento ou vendas para a empresa"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={handleClose} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" form="goal-form" loading={saving}>
            <IconPlus className="h-4 w-4" />
            {targetValue ? `Salvar ${formatCurrency(Number(targetValue) || 0)}` : "Salvar"}
          </Button>
        </>
      }
    >
      <form id="goal-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted">Tipo de meta</span>
          <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Tipo de meta">
            {GOAL_TYPE_OPTIONS.map((option) => {
              const isActive = targetType === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  onClick={() => setTargetType(option.value)}
                  className={cn(
                    "flex flex-col items-center gap-0.5 rounded-lg border px-2 py-2 text-xs font-medium transition-colors",
                    isActive
                      ? "border-brand-500/50 bg-brand-500/10 text-brand-300"
                      : "border-border-strong bg-surface-1 text-muted hover:text-foreground"
                  )}
                >
                  {option.label}
                  <span className="text-[10px] font-normal opacity-70">{option.hint}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="gl-value" className="text-xs font-medium text-muted">
              {targetType === "CLIENTES" ? "Meta de clientes" : "Meta (R$)"}{" "}
              <span className="text-danger">*</span>
            </label>
            <input
              id="gl-value"
              type="number"
              min="0"
              step={targetType === "CLIENTES" ? "1" : "0.01"}
              value={targetValue}
              onChange={(event) => setTargetValue(event.target.value)}
              placeholder={targetType === "CLIENTES" ? "Ex.: 24" : "Ex.: 420000"}
              className={inputClasses}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="gl-period" className="text-xs font-medium text-muted">
              Competência <span className="text-danger">*</span>
            </label>
            <input
              id="gl-period"
              type="month"
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
              className={inputClasses}
              required
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="gl-notes" className="text-xs font-medium text-muted">
            Observação
          </label>
          <textarea
            id="gl-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={2}
            placeholder="Ex.: Foco em contas novas no trimestre"
            className={cn(inputClasses, "resize-none")}
          />
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