import type {
  DashboardPeriod,
  DashboardWidgetConfig,
  DashboardWidgetId,
  DashboardWidgetSize,
} from "./dashboard-types";

export interface DashboardWidgetMeta {
  id: DashboardWidgetId;
  title: string;
  shortTitle: string;
  description: string;
  size: DashboardWidgetSize;
}

export const WIDGET_CATALOG: DashboardWidgetMeta[] = [
  {
    id: "kpi",
    title: "Indicadores principais",
    shortTitle: "KPIs",
    description: "Faturamento, vendas, clientes, conversão e pendências.",
    size: "large",
  },
  {
    id: "revenue",
    title: "Visão financeira",
    shortTitle: "Financeiro",
    description: "Evolução de faturamento, vendas e clientes no tempo.",
    size: "large",
  },
  {
    id: "quick-actions",
    title: "Ações rápidas",
    shortTitle: "Ações",
    description: "Atalhos para as tarefas mais comuns do dia.",
    size: "small",
  },
  {
    id: "pipeline",
    title: "Funil de vendas",
    shortTitle: "Funil",
    description: "Oportunidades em cada etapa do funil comercial.",
    size: "medium",
  },
  {
    id: "attention",
    title: "Precisa de atenção",
    shortTitle: "Atenção",
    description: "Itens que merecem ação imediata.",
    size: "medium",
  },
  {
    id: "activities",
    title: "Atividade recente",
    shortTitle: "Atividade",
    description: "O que aconteceu na operação.",
    size: "medium",
  },
  {
    id: "pending",
    title: "Pendências",
    shortTitle: "Pendências",
    description: "Tarefas para concluir hoje.",
    size: "small",
  },
  {
    id: "followups",
    title: "Follow-ups de hoje",
    shortTitle: "Follow-ups",
    description: "Contatos agendados para o dia.",
    size: "small",
  },
  {
    id: "calendar",
    title: "Calendário",
    shortTitle: "Agenda",
    description: "Compromissos do mês em uma visão compacta.",
    size: "small",
  },
  {
    id: "recent-clients",
    title: "Clientes recentes",
    shortTitle: "Clientes",
    description: "Últimos clientes cadastrados e atualizados.",
    size: "small",
  },
  {
    id: "new-clients",
    title: "Novos clientes",
    shortTitle: "Aquisição",
    description: "Distribuição de novos, ativos e inativos.",
    size: "medium",
  },
  {
    id: "performance",
    title: "Performance comercial",
    shortTitle: "Performance",
    description: "Ranking de vendas e conversão do time.",
    size: "medium",
  },
  {
    id: "sales",
    title: "Evolução de vendas",
    shortTitle: "Vendas",
    description: "Vendas concluídas ao longo do período.",
    size: "large",
  },
  {
    id: "goals",
    title: "Metas",
    shortTitle: "Metas",
    description: "Acompanhamento da meta do período.",
    size: "medium",
  },
  {
    id: "insights",
    title: "Insights",
    shortTitle: "Insights",
    description: "Alertas inteligentes gerados pela operação.",
    size: "large",
  },
];

export const WIDGET_META: Record<DashboardWidgetId, DashboardWidgetMeta> =
  Object.fromEntries(WIDGET_CATALOG.map((widget) => [widget.id, widget])) as Record<
    DashboardWidgetId,
    DashboardWidgetMeta
  >;

export const DEFAULT_WIDGET_ORDER: DashboardWidgetId[] = [
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
  "sales",
  "recent-clients",
  "performance",
  "goals",
  "insights",
];

export const PERIOD_OPTIONS: { key: DashboardPeriod; label: string }[] = [
  { key: "today", label: "Hoje" },
  { key: "7d", label: "7 dias" },
  { key: "30d", label: "30 dias" },
  { key: "90d", label: "90 dias" },
  { key: "custom", label: "Personalizado" },
];

export function buildDefaultWidgets(modeOrder: DashboardWidgetId[]): DashboardWidgetConfig[] {
  return modeOrder.map((id, index) => ({
    id,
    enabled: true,
    size: WIDGET_META[id]?.size ?? "medium",
    order: index,
  }));
}