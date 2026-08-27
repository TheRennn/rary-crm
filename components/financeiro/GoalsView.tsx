"use client";

import { useMemo } from "react";
import type { ReactNode } from "react";
import { useToast } from "@/components/ui/Toast";
import { StatCard } from "@/components/ui/StatCard";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { IconUsers, IconTrendingUp, IconCreditCard, IconEdit, IconTrash } from "@/components/icons";
import { GOAL_TARGET_LABELS } from "@/lib/constants";
import { cn, formatCurrency } from "@/lib/utils";
import type { BadgeTone } from "@/lib/constants";
import type { Goal, GoalTargetType } from "@/types";

export interface GoalCurrents {
  clientes: number;
  faturamento: number;
  vendas: number;
}

export interface GoalsViewProps {
  goals: Goal[];
  currents: GoalCurrents;
  onEdit?: (goal: Goal) => void;
  onDelete?: (goal: Goal) => void;
}

const GOAL_TYPES: GoalTargetType[] = ["CLIENTES", "FATURAMENTO", "VENDAS"];

const GOAL_META: Record<
  GoalTargetType,
  { icon: ReactNode; tone: BadgeTone; format: (value: number) => string }
> = {
  CLIENTES: {
    icon: <IconUsers className="h-4 w-4" />,
    tone: "info",
    format: (value) => `${Math.round(value)}`,
  },
  FATURAMENTO: {
    icon: <IconCreditCard className="h-4 w-4" />,
    tone: "brand",
    format: formatCurrency,
  },
  VENDAS: {
    icon: <IconTrendingUp className="h-4 w-4" />,
    tone: "success",
    format: formatCurrency,
  },
};

export function GoalsView({ goals, currents, onEdit, onDelete }: GoalsViewProps) {
  const { toast } = useToast();
  const sorted = useMemo(
    () =>
      [...goals].sort(
        (a, b) => b.period.localeCompare(a.period) || a.targetType.localeCompare(b.targetType)
      ),
    [goals]
  );

  const latestByType = useMemo(() => {
    const map = new Map<GoalTargetType, Goal>();
    for (const goal of sorted) {
      if (!map.has(goal.targetType)) map.set(goal.targetType, goal);
    }
    return map;
  }, [sorted]);

  const currentOf = (type: GoalTargetType) => currents[type.toLowerCase() as keyof GoalCurrents];

  const effectiveOf = (goal: Goal) =>
    goal.currentValue ?? currentOf(goal.targetType);

  const pctOf = (goal: Goal) => {
    const target = Number(goal.targetValue);
    if (!target) return 0;
    return Math.min(100, Math.round((effectiveOf(goal) / target) * 100));
  };

  const typeConfig = (type: GoalTargetType) => GOAL_META[type];

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-3 md:grid-cols-3">
        {GOAL_TYPES.map((type) => {
          const goal = latestByType.get(type);
          const current = currentOf(type);
          const pct = goal ? Math.min(100, Math.round((current / goal.targetValue) * 100)) : 0;
          return (
            <StatCard
              key={type}
              label={GOAL_TARGET_LABELS[type]}
              value={GOAL_META[type].format(current)}
              icon={GOAL_META[type].icon}
              trend={goal && pct >= 100 ? "up" : "neutral"}
              trendLabel={goal ? `${pct}% da meta` : "sem meta registrada"}
            />
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Metas por competência</h2>
          <p className="text-xs text-muted">Acompanhe o progresso de clientes, faturamento e vendas.</p>
        </div>
        <Badge tone="brand" dot>
          Meta da empresa
        </Badge>
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          title="Nenhuma meta registrada"
          description="Registre metas de clientes, faturamento e vendas para acompanhar o desempenho."
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {sorted.map((goal) => {
            const meta = typeConfig(goal.targetType);
            const effective = effectiveOf(goal);
            const pct = pctOf(goal);
            const achieved = pct >= 100;
            return (
              <div
                key={goal.id}
                className="flex flex-col gap-3 rounded-xl border border-border bg-surface-1 p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg border",
                        achieved
                          ? "border-success/25 bg-success/10 text-success"
                          : "border-border-strong bg-surface-2 text-muted"
                      )}
                    >
                      {meta.icon}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {GOAL_TARGET_LABELS[goal.targetType]}
                      </p>
                      <p className="text-xs text-muted">Competência {goal.period}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {achieved ? (
                      <Badge tone="success">Atingida</Badge>
                    ) : (
                      <Badge tone={meta.tone}>{pct}%</Badge>
                    )}
                    <button
                      type="button"
                      onClick={() => onEdit?.(goal)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-3 hover:text-foreground"
                      title="Editar meta"
                    >
                      <IconEdit className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete?.(goal)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-muted transition-colors hover:bg-danger/10 hover:text-danger"
                      title="Excluir meta"
                    >
                      <IconTrash className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-muted">Meta</p>
                    <p className="text-lg font-bold tabular-nums text-foreground">
                      {meta.format(goal.targetValue)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] uppercase tracking-wide text-muted">Atual</p>
                    <p className="text-sm font-medium tabular-nums text-muted">
                      {meta.format(effective)}
                    </p>
                  </div>
                </div>

                <div className="flex h-2 w-full overflow-hidden rounded-full bg-surface-2">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      achieved ? "bg-success" : "bg-brand-500"
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                {goal.notes && (
                  <p className="text-xs text-muted">Observação: {goal.notes}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
