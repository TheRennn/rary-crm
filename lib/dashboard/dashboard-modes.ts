import { WIDGET_META } from "./dashboard-config";
import type { DashboardMode, DashboardWidgetId } from "./dashboard-types";

export interface DashboardModeMeta {
  key: DashboardMode;
  label: string;
  description: string;
  emoji: string;
}

export const DASHBOARD_MODES: DashboardModeMeta[] = [
  { key: "overview", label: "Visão geral", description: "Tudo que importa em um só lugar", emoji: "◈" },
  { key: "sales", label: "Vendas", description: "Funil, conversão e metas comerciais", emoji: "📈" },
  { key: "management", label: "Gestão", description: "Desempenho, equipe e produtividade", emoji: "🗂" },
  { key: "finance", label: "Financeiro", description: "Faturamento, recebimentos e pagamentos", emoji: "R$" },
  { key: "support", label: "Atendimento", description: "Clientes, tratativas e contatos", emoji: "✉" },
  { key: "operations", label: "Operação", description: "Tarefas, processos e calendário", emoji: "⚙" },
];

export const DASHBOARD_MODE_LABELS: Record<DashboardMode, string> = Object.fromEntries(
  DASHBOARD_MODES.map((mode) => [mode.key, mode.label])
) as Record<DashboardMode, string>;

/**
 * Prioridade de widgets por modo de trabalho.
 * Determina a ordem padrão e quais widgets ficam ativos ao entrar no modo.
 */
export const MODE_PRIORITY: Record<DashboardMode, DashboardWidgetId[]> = {
  overview: [
    "kpi",
    "revenue",
    "quick-actions",
    "pipeline",
    "attention",
    "new-clients",
    "activities",
    "pending",
    "followups",
    "calendar",
    "recent-clients",
    "sales",
    "performance",
    "goals",
    "insights",
  ],
  sales: [
    "kpi",
    "revenue",
    "pipeline",
    "quick-actions",
    "sales",
    "followups",
    "recent-clients",
    "performance",
    "goals",
    "insights",
    "attention",
    "new-clients",
    "activities",
    "pending",
    "calendar",
  ],
  management: [
    "kpi",
    "performance",
    "goals",
    "quick-actions",
    "attention",
    "insights",
    "revenue",
    "pipeline",
    "calendar",
    "activities",
    "pending",
    "recent-clients",
    "new-clients",
    "sales",
    "followups",
  ],
  finance: [
    "kpi",
    "revenue",
    "sales",
    "goals",
    "quick-actions",
    "attention",
    "insights",
    "pipeline",
    "followups",
    "calendar",
    "recent-clients",
    "pending",
    "performance",
    "new-clients",
    "activities",
  ],
  support: [
    "kpi",
    "activities",
    "pending",
    "recent-clients",
    "followups",
    "quick-actions",
    "attention",
    "calendar",
    "insights",
    "new-clients",
    "revenue",
    "pipeline",
    "performance",
    "goals",
    "sales",
  ],
  operations: [
    "kpi",
    "pending",
    "calendar",
    "attention",
    "activities",
    "followups",
    "quick-actions",
    "insights",
    "performance",
    "revenue",
    "pipeline",
    "goals",
    "recent-clients",
    "sales",
    "new-clients",
  ],
};

export const WIDGET_INCLUDES: Record<DashboardMode, DashboardWidgetId[]> = MODE_PRIORITY;

export function getWidgetTitle(id: DashboardWidgetId): string {
  return WIDGET_META[id]?.title ?? id;
}

export function getWidgetShortTitle(id: DashboardWidgetId): string {
  return WIDGET_META[id]?.shortTitle ?? id;
}