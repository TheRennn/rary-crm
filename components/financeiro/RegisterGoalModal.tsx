"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { MaskedInput } from "@/components/ui/MaskedInput";
import { IconPlus } from "@/components/icons";
import { useToast } from "@/components/ui/Toast";
import { goalService } from "@/lib/services";
import { GOAL_TARGET_LABELS } from "@/lib/constants";
import { formatCurrency, cn, parseCurrency } from "@/lib/utils";
import type { Goal, GoalTargetType } from "@/types";
import type { GoalCurrents } from "./GoalsView";

export interface RegisterGoalModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (goal: Goal) => void;
  currents?: GoalCurrents;
  editGoal?: Goal | null;
}

const inputClasses =
  "w-full rounded-lg border border-border-strong bg-surface-1 px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20";

const GOAL_TYPE_OPTIONS: { value: GoalTargetType; label: string; hint: string }[] = [
  { value: "CLIENTES", label: "Clientes", hint: "quantidade" },
  { value: "FATURAMENTO", label: "Faturamento", hint: "em reais" },
  { value: "VENDAS", label: "Vendas", hint: "em reais" },
];

export function RegisterGoalModal({ open, onClose, onCreated, currents, editGoal }: RegisterGoalModalProps) {
  const { toast } = useToast();
  const isEditing = !!editGoal;
  const [targetType, setTargetType] = useState<GoalTargetType>("FATURAMENTO");
  const [targetValue, setTargetValue] = useState("");
  const [period, setPeriod] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editGoal && open) {
      setTargetType(editGoal.targetType);
      setTargetValue(editGoal.targetType === "CLIENTES" ? String(editGoal.targetValue) : formatCurrency(editGoal.targetValue));
      setPeriod(editGoal.period);
      setNotes(editGoal.notes ?? "");
    } else if (!open) {
      reset();
    }
  }, [editGoal, open]);

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
    const value = targetType === "CLIENTES" ? Number(targetValue) : parseCurrency(targetValue);
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

      if (isEditing) {
        const updated = await goalService.update(editGoal.id, {
          targetType,
          targetValue: value,
          period,
          currentValue: snapshot,
          notes: notes.trim() || undefined,
        });
        onCreated(updated);
        toast({
          title: "Meta atualizada",
          message: `${GOAL_TARGET_LABELS[targetType]} de ${formatCurrency(value)} para ${period}.`,
          variant: "success",
        });
      } else {
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
      }
      reset();
      onClose();
    } catch {
      setError(isEditing ? "Não foi possível atualizar a meta. Tente novamente." : "Não foi possível registrar a meta. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isEditing ? "Editar meta" : "Adicionar meta"}
      description={isEditing ? "Atualize os dados da meta" : "Meta de clientes, faturamento ou vendas para a empresa"}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={handleClose} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" form="goal-form" loading={saving}>
            <IconPlus className="h-4 w-4" />
            {isEditing ? "Salvar alterações" : targetValue ? `${targetType === "CLIENTES" ? formatCurrency(Number(targetValue) || 0) : formatCurrency(parseCurrency(targetValue))}` : "Salvar"}
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
            {targetType === "CLIENTES" ? (
              <input
                id="gl-value"
                type="number"
                min="0"
                step="1"
                value={targetValue}
                onChange={(event) => setTargetValue(event.target.value)}
                placeholder="Ex.: 24"
                className={inputClasses}
                required
              />
            ) : (
              <MaskedInput
                id="gl-value"
                mask="currency"
                value={targetValue}
                onChange={setTargetValue}
                placeholder="Ex.: 420.000,00"
                required
              />
            )}
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