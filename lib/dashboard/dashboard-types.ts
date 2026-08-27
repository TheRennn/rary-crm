import type {
  Activity,
  CalendarEvent,
  Client,
  Deal,
  FollowUp,
  Payment,
  Task,
} from "@/types";

export type DashboardMode =
  | "overview"
  | "sales"
  | "management"
  | "finance"
  | "support"
  | "operations";

export type DashboardPeriod = "today" | "7d" | "30d" | "90d" | "custom";

export type DashboardDensity = "compact" | "comfortable" | "spacious";

export type DashboardAppearance = "dark" | "light" | "system";

export type DashboardWidgetSize = "small" | "medium" | "large";

export type DashboardWidgetId =
  | "kpi"
  | "revenue"
  | "new-clients"
  | "pipeline"
  | "activities"
  | "attention"
  | "followups"
  | "calendar"
  | "pending"
  | "recent-clients"
  | "performance"
  | "goals"
  | "insights"
  | "quick-actions"
  | "sales";

export interface DashboardWidgetConfig {
  id: DashboardWidgetId;
  enabled: boolean;
  size: DashboardWidgetSize;
  order: number;
}

export interface DashboardOrganization {
  id: string;
  name: string;
  tagline: string;
}

export interface DashboardPreferences {
  mode: DashboardMode;
  period: DashboardPeriod;
  customRange: { from: string; to: string } | null;
  density: DashboardDensity;
  appearance: DashboardAppearance;
  organizationId: string;
  customized: boolean;
}

export interface KpiTrend {
  value: number;
  delta: number;
  direction: "up" | "down" | "neutral";
  goodWhen: "up" | "down";
  sparkline: number[];
  label: string;
}

export interface DashboardKpis {
  faturamento: KpiTrend;
  vendas: KpiTrend;
  clientes: KpiTrend;
  conversao: KpiTrend;
  pendencias: KpiTrend;
}

export interface SeriesPoint {
  label: string;
  value: number;
}

export interface PipelineStage {
  id: string;
  label: string;
  count: number;
  value: number;
}

export interface PipelineData {
  stages: PipelineStage[];
  totalValue: number;
  totalCount: number;
  conversion: number;
}

export interface AttentionItem {
  id: string;
  label: string;
  count: number;
  severity: "normal" | "warning" | "critical";
  href?: string;
}

export interface RecentClientItem {
  id: string;
  name: string;
  company: string;
  timeLabel: string;
  status: Client["status"];
  initials: string;
}

export interface PerformanceRow {
  id: string;
  responsible: string;
  sales: number;
  conversion: number;
  rank: number;
}

export interface GoalData {
  label: string;
  target: number;
  achieved: number;
  percentage: number;
  remaining: number;
}

export type InsightTone = "positive" | "warning" | "success" | "info" | "neutral";

export interface InsightItem {
  id: string;
  tone: InsightTone;
  message: string;
}

export interface ChartMetrics {
  revenue: SeriesPoint[];
  sales: SeriesPoint[];
  clients: SeriesPoint[];
  clientDistribution: { label: string; value: number; tone: "brand" | "success" | "neutral" }[];
}

export interface DashboardData {
  user: { name: string } | null;
  greeting: string;
  todayLabel: string;
  organizations: DashboardOrganization[];
  kpis: DashboardKpis;
  pipeline: PipelineData;
  metrics: ChartMetrics;
  activities: Activity[];
  attention: AttentionItem[];
  followUpsToday: FollowUp[];
  followUpsOverdueCount: number;
  followUpsNext: FollowUp[];
  calendarEvents: CalendarEvent[];
  pendingTasks: Task[];
  recentClients: RecentClientItem[];
  performance: PerformanceRow[];
  goals: GoalData;
  insights: InsightItem[];
  clients: Client[];
  deals: Deal[];
  payments: Payment[];
  tasks: Task[];
}