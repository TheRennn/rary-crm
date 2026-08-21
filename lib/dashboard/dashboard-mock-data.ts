import type {
  Activity,
  CalendarEvent,
  Client,
  Deal,
  FollowUp,
  Notification,
  Payment,
  Task,
} from "@/types";
import type {
  AttentionItem,
  ChartMetrics,
  DashboardData,
  DashboardKpis,
  DashboardOrganization,
  DashboardPeriod,
  GoalData,
  InsightItem,
  PerformanceRow,
  PipelineData,
  RecentClientItem,
  SeriesPoint,
} from "./dashboard-types";

export const ORGANIZATIONS: DashboardOrganization[] = [
  { id: "org-rary", name: "RARY Labs", tagline: "Workspace principal" },
  { id: "org-abc", name: "Empresa ABC", tagline: "Operação secundária" },
  { id: "org-xyz", name: "Empresa XYZ", tagline: "Operação terciária" },
];

export interface DashboardMetricInput {
  clients: Client[];
  deals: Deal[];
  payments: Payment[];
  followUps: FollowUp[];
  tasks: Task[];
  events: CalendarEvent[];
  notifications: Notification[];
  activities: Activity[];
}

/** PRNG determinístico — garante números estáveis entre SSR e cliente. */
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const revenueByPeriod: Record<DashboardPeriod, number> = {
  today: 12480,
  "7d": 38640,
  "30d": 84320,
  "90d": 226400,
  custom: 84320,
};

const deltaByPeriod: Record<DashboardPeriod, number> = {
  today: 8.2,
  "7d": 12.4,
  "30d": 18.4,
  "90d": 21.7,
  custom: 18.4,
};

function periodPointCount(period: DashboardPeriod): number {
  switch (period) {
    case "today":
      return 10;
    case "7d":
      return 7;
    case "90d":
      return 12;
    default:
      return 30;
  }
}

function periodLabels(period: DashboardPeriod): string[] {
  const now = new Date();
  const fmt = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" });
  if (period === "today") {
    return Array.from({ length: 10 }, (_, i) => `${String(9 + i).padStart(2, "0")}h`);
  }
  if (period === "90d") {
    return Array.from({ length: 12 }, (_, i) => `S${i + 1}`);
  }
  const count = periodPointCount(period);
  const labels: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const day = new Date(now);
    day.setDate(now.getDate() - i);
    labels.push(fmt.format(day).replace(/\./, ""));
  }
  return labels;
}

function buildSeries(period: DashboardPeriod, seed: number, scale = 1): SeriesPoint[] {
  const points = periodPointCount(period);
  const labels = periodLabels(period);
  const random = mulberry32(seed);
  const weights = Array.from({ length: points }, () => 0.55 + random() * 1.15);
  const denominator = weights.reduce((acc, weight) => acc + weight, 0);
  const total = revenueByPeriod[period] * scale;
  return weights.map((weight, index) => ({
    label: labels[index] ?? String(index),
    value: Math.round((total * weight) / (denominator * 1)) / 1,
  }));
}

export function buildKpisForPeriod(
  period: DashboardPeriod,
  counters: { clients: number; pendingCount: number }
): DashboardKpis {
  const totalRevenue = revenueByPeriod[period];
  const delta = deltaByPeriod[period];
  const salesTotal = Math.round(totalRevenue / 660);
  const clientsTotal = Math.max(counters.clients, 8);
  const pending = Math.max(counters.pendingCount, 4);

  const sparklineFor = (seed: number, divisor = 1): number[] =>
    buildSeries(period, seed, 1 / divisor).map((point) => point.value);

  return {
    faturamento: {
      label: "Faturamento",
      value: totalRevenue,
      delta,
      direction: "up",
      goodWhen: "up",
      sparkline: sparklineFor(1001),
    },
    vendas: {
      label: "Vendas",
      value: salesTotal,
      delta: 12.7,
      direction: "up",
      goodWhen: "up",
      sparkline: sparklineFor(2002, 660),
    },
    clientes: {
      label: "Clientes",
      value: clientsTotal,
      delta: 8.2,
      direction: "up",
      goodWhen: "up",
      sparkline: sparklineFor(3003, 660),
    },
    conversao: {
      label: "Conversão",
      value: 24.8,
      delta: 4.1,
      direction: "up",
      goodWhen: "up",
      sparkline: sparklineFor(4004, 4000),
    },
    pendencias: {
      label: "Pendências",
      value: pending,
      delta: 12.3,
      direction: "down",
      goodWhen: "down",
      sparkline: sparklineFor(5005, 140),
    },
  };
}

export function buildMetricsForPeriod(
  period: DashboardPeriod,
  counters: { clients: number }
): ChartMetrics {
  const clientsTotal = Math.max(counters.clients, 8);
  return {
    revenue: buildSeries(period, 7007),
    sales: buildSeries(period, 8008, 1 / 660),
    clients: buildSeries(period, 9009, 1 / 660).map((point) => ({
      ...point,
      value: Math.round(point.value) + clientsTotal,
    })),
    clientDistribution: [
      { label: "Novos", value: 128, tone: "brand" },
      { label: "Ativos", value: 742, tone: "success" },
      { label: "Inativos", value: 92, tone: "neutral" },
    ],
  };
}

function buildPipeline(_deals: Deal[]): PipelineData {
  const stages: PipelineData["stages"] = [
    {
      id: "leads",
      label: "Leads",
      count: 42,
      value: 48000,
    },
    {
      id: "contato",
      label: "Contato",
      count: 28,
      value: 36600,
    },
    {
      id: "proposta",
      label: "Proposta",
      count: 14,
      value: 28400,
    },
    {
      id: "negociacao",
      label: "Negociação",
      count: 7,
      value: 15400,
    },
  ];
  stages.push({ id: "fechamento", label: "Fechamento", count: 3, value: 0 });
  const totalValue = stages.reduce((sum, stage) => sum + stage.value, 0);
  const totalCount = stages.reduce((sum, stage) => sum + stage.count, 0);
  return { stages, totalValue: totalValue || 0, totalCount, conversion: 24.8 };
}

function buildAttention(data: DashboardMetricInput): AttentionItem[] {
  const overdueFollowUps = data.followUps.filter(
    (followUp) => followUp.status === "ATRASADO"
  ).length;
  const overduePayments = data.payments.filter(
    (payment) => payment.status === "ATRASADO"
  ).length;
  const todayDuePayments = data.payments.filter((payment) => {
    if (payment.status !== "PENDENTE") return false;
    return (new Date(payment.dueDate).getTime() - Date.now()) / 86400000 < 1;
  }).length;
  const todaysTasks = data.tasks.filter((task) => task.status === "HOJE").length;
  const staleClients = data.clients.filter(
    (client) => Date.now() - new Date(client.lastContactAt).getTime() > 15 * 86400000
  ).length;
  const upcomingPayments = data.payments.filter((payment) => {
    if (payment.status !== "PENDENTE") return false;
    const days = (new Date(payment.dueDate).getTime() - Date.now()) / 86400000;
    return days >= 0 && days <= 7;
  }).length;

  const items: AttentionItem[] = [];
  if (overdueFollowUps > 0)
    items.push({
      id: "att-followups",
      label: "follow-ups atrasados",
      count: overdueFollowUps,
      severity: "warning",
      href: "/follow-up",
    });
  if (overduePayments > 0)
    items.push({
      id: "att-payments",
      label: "pagamentos em atraso",
      count: overduePayments,
      severity: "critical",
      href: "/financeiro",
    });
  if (todayDuePayments > 0)
    items.push({
      id: "att-today-payments",
      label: "pagamentos vencendo hoje",
      count: todayDuePayments,
      severity: "warning",
      href: "/financeiro",
    });
  if (todaysTasks > 0)
    items.push({
      id: "att-tasks",
      label: "tarefas para hoje",
      count: todaysTasks,
      severity: "normal",
      href: "/pendentes",
    });
  if (staleClients > 0)
    items.push({
      id: "att-clients",
      label: "clientes sem contato há 15 dias",
      count: staleClients,
      severity: staleClients >= 4 ? "critical" : "warning",
      href: "/clientes",
    });
  if (upcomingPayments > 0)
    items.push({
      id: "att-upcoming",
      label: "pagamentos a vencer na semana",
      count: upcomingPayments,
      severity: "normal",
      href: "/financeiro",
    });

  if (items.length === 0)
    items.push({
      id: "att-clear",
      label: "itens urgentes agora",
      count: 0,
      severity: "normal",
    });

  return items;
}

function buildRecentClients(clients: Client[]): RecentClientItem[] {
  const sorted = [...clients]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  return sorted.map((client) => {
    const diffDays = Math.round(
      (Date.now() - new Date(client.createdAt).getTime()) / 86400000
    );
    const timeLabel =
      diffDays === 0 ? "Hoje" : diffDays === 1 ? "Ontem" : `há ${diffDays} dias`;
    return {
      id: client.id,
      name: client.decisor.name,
      company: client.companyName,
      timeLabel,
      status: client.status,
      initials: client.decisor.name
        .split(" ")
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join(""),
    };
  });
}

function buildPerformance(): PerformanceRow[] {
  return [
    { id: "perf-ana", responsible: "Ana Gabriela", sales: 32, conversion: 28.4, rank: 1 },
    { id: "perf-carlos", responsible: "Carlos Mendes", sales: 27, conversion: 24.1, rank: 2 },
    { id: "perf-julia", responsible: "Júlia Martins", sales: 21, conversion: 21.7, rank: 3 },
    { id: "perf-rafael", responsible: "Rafael Souza", sales: 14, conversion: 18.2, rank: 4 },
  ];
}

function buildGoals(revenueTotal: number, period: DashboardPeriod): GoalData {
  const targetByPeriod: Record<DashboardPeriod, number> = {
    today: 4200,
    "7d": 24500,
    "30d": 100000,
    "90d": 270000,
    custom: 100000,
  };
  const target = targetByPeriod[period] ?? 100000;
  const achieved = Math.min(revenueTotal, target);
  const percentage = Math.round((achieved / target) * 1000) / 10;
  return {
    label: "Meta de vendas",
    target,
    achieved,
    percentage,
    remaining: Math.max(target - achieved, 0),
  };
}

function compactNumber(value: number): string {
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(value);
}

function buildInsights(data: DashboardMetricInput): InsightItem[] {
  const revenue = revenueByPeriod["30d"];
  const staleClients = data.clients.filter(
    (client) => Date.now() - new Date(client.lastContactAt).getTime() > 15 * 86400000
  ).length;
  const upcomingPayments = data.payments.filter((payment) => {
    if (payment.status !== "PENDENTE") return false;
    const days = (new Date(payment.dueDate).getTime() - Date.now()) / 86400000;
    return days >= 0 && days <= 7;
  }).length;
  const percentage = Math.round((revenue / 100000) * 100);

  const items: InsightItem[] = [
    {
      id: "ins-revenue",
      tone: "positive",
      message: `Seu faturamento aumentou 18,4% no mês — ${compactNumber(revenue)} no período.`,
    },
  ];

  if (staleClients > 0)
    items.push({
      id: "ins-stale",
      tone: "warning",
      message: `${staleClients} clientes estão há mais de 15 dias sem contato.`,
    });

  items.push({
    id: "ins-goal",
    tone: "success",
    message: `Você atingiu ${percentage}% da meta mensal de vendas.`,
  });

  if (upcomingPayments > 0)
    items.push({
      id: "ins-payments",
      tone: "info",
      message: `${upcomingPayments} pagamentos estão próximos do vencimento.`,
    });

  items.push({
    id: "ins-conversion",
    tone: "neutral",
    message: "Sua taxa de conversão está em 24,8%, acima da média do segmento.",
  });

  return items;
}

function buildActivities(data: DashboardMetricInput): Activity[] {
  const fromNotifications: Activity[] = data.notifications.slice(0, 3).map((n, index) => ({
    id: `act-ntf-${index}`,
    type: "VENDA",
    title: n.title,
    detail: n.message,
    createdAt: n.createdAt,
    actor: "Sistema",
  }));
  return [...fromNotifications, ...data.activities].slice(0, 8);
}

export function buildDashboardData(data: DashboardMetricInput): DashboardData {
  const kpis = buildKpisForPeriod("30d", {
    clients: data.clients.length,
    pendingCount: data.tasks.filter((task) => task.status !== "CONCLUIDA").length,
  });
  const metrics = buildMetricsForPeriod("30d", { clients: data.clients.length });
  const pipeline = buildPipeline(data.deals);
  const goals = buildGoals(kpis.faturamento.value, "30d");

  const hour = new Date().getHours();
  const greeting =
    hour >= 5 && hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  const todayLabel = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  })
    .format(new Date())
    .replace(/^\w/, (c) => c.toUpperCase());

  const overdueTaskList = data.tasks.filter((task) => task.status === "ATRASADA");
  const todayTaskList = data.tasks.filter((task) => task.status === "HOJE");

  const followUpsToday = data.followUps.filter((followUp) => followUp.status === "HOJE");
  const followUpsOverdue = data.followUps.filter(
    (followUp) => followUp.status === "ATRASADO"
  );
  const followUpsNext = data.followUps
    .filter((followUp) => followUp.status === "PROXIMO")
    .slice(0, 2);

  return {
    user: null,
    greeting,
    todayLabel,
    organizations: ORGANIZATIONS,
    kpis,
    pipeline,
    metrics,
    activities: buildActivities(data),
    attention: buildAttention(data),
    followUpsToday,
    followUpsOverdueCount: followUpsOverdue.length,
    followUpsNext,
    calendarEvents: data.events,
    pendingTasks: [...overdueTaskList, ...todayTaskList].slice(0, 6),
    recentClients: buildRecentClients(data.clients),
    performance: buildPerformance(),
    goals,
    insights: buildInsights(data),
    clients: data.clients,
    deals: data.deals,
    payments: data.payments,
    tasks: data.tasks,
  };
}

export function formatDashboardCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDashboardPercent(value: number): string {
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(value) + "%";
}

export interface DashboardPeriodCounters {
  clients: number;
  pendingCount: number;
}

export function dashboardSummaryForPeriod(
  period: DashboardPeriod,
  counters: DashboardPeriodCounters
): { kpis: DashboardKpis; metrics: ChartMetrics } {
  return {
    kpis: buildKpisForPeriod(period, counters),
    metrics: buildMetricsForPeriod(period, counters),
  };
}