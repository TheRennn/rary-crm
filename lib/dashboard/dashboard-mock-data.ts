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

function getPeriodRange(period: DashboardPeriod): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();
  switch (period) {
    case "today":
      start.setHours(0, 0, 0, 0);
      break;
    case "7d":
      start.setDate(start.getDate() - 7);
      break;
    case "30d":
      start.setDate(start.getDate() - 30);
      break;
    case "90d":
      start.setDate(start.getDate() - 90);
      break;
    default:
      start.setDate(start.getDate() - 30);
      break;
  }
  return { start, end };
}

function filterDealsByPeriod(deals: Deal[], period: DashboardPeriod): Deal[] {
  const { start } = getPeriodRange(period);
  return deals.filter((d) => new Date(d.createdAt) >= start);
}

function filterPaymentsByPeriod(payments: Payment[], period: DashboardPeriod): Payment[] {
  const { start } = getPeriodRange(period);
  return payments.filter((p) => new Date(p.dueDate) >= start);
}

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

function buildRevenueSeries(
  deals: Deal[],
  period: DashboardPeriod,
  payments?: Payment[]
): SeriesPoint[] {
  const labels = periodLabels(period);
  const count = periodPointCount(period);
  const { start, end } = getPeriodRange(period);
  const totalMs = end.getTime() - start.getTime();
  const bucketMs = totalMs / count;

  const paid = deals.filter((d) => d.status === "CONCLUIDA" || d.paymentStatus === "PAGO");
  const buckets = new Array(count).fill(0);

  for (const deal of paid) {
    const dealTime = new Date(deal.createdAt).getTime();
    const idx = Math.min(
      Math.floor((dealTime - start.getTime()) / bucketMs),
      count - 1
    );
    if (idx >= 0 && idx < count) {
      buckets[idx] += deal.value;
    }
  }

  if (payments) {
    const standalonePaid = payments.filter(
      (p) => p.status === "PAGO" && !p.dealId
    );
    for (const payment of standalonePaid) {
      const paymentTime = new Date(payment.dueDate).getTime();
      const idx = Math.min(
        Math.floor((paymentTime - start.getTime()) / bucketMs),
        count - 1
      );
      if (idx >= 0 && idx < count) {
        buckets[idx] += payment.value;
      }
    }
  }

  return labels.map((label, i) => ({
    label,
    value: Math.round(buckets[i] ?? 0),
  }));
}

function buildSalesSeries(
  deals: Deal[],
  period: DashboardPeriod
): SeriesPoint[] {
  const labels = periodLabels(period);
  const count = periodPointCount(period);
  const { start } = getPeriodRange(period);
  const totalMs = new Date().getTime() - start.getTime();
  const bucketMs = totalMs / count;

  const buckets = new Array(count).fill(0);

  for (const deal of deals) {
    const dealTime = new Date(deal.createdAt).getTime();
    const idx = Math.min(
      Math.floor((dealTime - start.getTime()) / bucketMs),
      count - 1
    );
    if (idx >= 0 && idx < count) {
      buckets[idx] += 1;
    }
  }

  return labels.map((label, i) => ({
    label,
    value: buckets[i] ?? 0,
  }));
}

function buildClientSeries(
  clients: Client[],
  period: DashboardPeriod
): SeriesPoint[] {
  const labels = periodLabels(period);
  const count = periodPointCount(period);
  const { start } = getPeriodRange(period);
  const totalMs = new Date().getTime() - start.getTime();
  const bucketMs = totalMs / count;

  const buckets = new Array(count).fill(0);

  for (const client of clients) {
    const clientTime = new Date(client.createdAt).getTime();
    const idx = Math.min(
      Math.floor((clientTime - start.getTime()) / bucketMs),
      count - 1
    );
    if (idx >= 0 && idx < count) {
      buckets[idx] += 1;
    }
  }

  let cumulative = 0;
  return labels.map((label, i) => {
    cumulative += buckets[i] ?? 0;
    return { label, value: cumulative };
  });
}

function computeDelta(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function getPreviousPeriodRange(period: DashboardPeriod): { start: Date; end: Date } {
  const { start: currentStart, end: currentEnd } = getPeriodRange(period);
  const duration = currentEnd.getTime() - currentStart.getTime();
  return {
    start: new Date(currentStart.getTime() - duration),
    end: new Date(currentEnd.getTime() - duration),
  };
}

function sumDealValues(deals: Deal[], start: Date, end: Date, payments?: Payment[]): number {
  let total = deals
    .filter((d) => {
      if (d.status !== "CONCLUIDA" && d.paymentStatus !== "PAGO") return false;
      const t = new Date(d.createdAt).getTime();
      return t >= start.getTime() && t <= end.getTime();
    })
    .reduce((sum, d) => sum + d.value, 0);

  if (payments) {
    const standalonePaid = payments.filter(
      (p) => p.status === "PAGO" && !p.dealId
    );
    total += standalonePaid
      .filter((p) => {
        const t = new Date(p.dueDate).getTime();
        return t >= start.getTime() && t <= end.getTime();
      })
      .reduce((sum, p) => sum + p.value, 0);
  }

  return total;
}

function countDeals(deals: Deal[], start: Date, end: Date): number {
  return deals.filter((d) => {
    const t = new Date(d.createdAt).getTime();
    return t >= start.getTime() && t <= end.getTime();
  }).length;
}

function countConcludedDeals(deals: Deal[], start: Date, end: Date): number {
  return deals.filter((d) => {
    if (d.status !== "CONCLUIDA" && d.paymentStatus !== "PAGO") return false;
    const t = new Date(d.createdAt).getTime();
    return t >= start.getTime() && t <= end.getTime();
  }).length;
}

export function buildKpisForPeriod(
  period: DashboardPeriod,
  data: DashboardMetricInput
): DashboardKpis {
  const { start, end } = getPeriodRange(period);
  const { start: prevStart, end: prevEnd } = getPreviousPeriodRange(period);

  const revenue = sumDealValues(data.deals, start, end, data.payments);
  const prevRevenue = sumDealValues(data.deals, prevStart, prevEnd, data.payments);
  const revenueDelta = computeDelta(revenue, prevRevenue);

  const totalDeals = countDeals(data.deals, start, end);
  const prevDeals = countDeals(data.deals, prevStart, prevEnd);
  const salesDelta = computeDelta(totalDeals, prevDeals);

  const concludedDeals = countConcludedDeals(data.deals, start, end);
  const conversionRate = totalDeals > 0 ? Math.round((concludedDeals / totalDeals) * 1000) / 10 : 0;
  const prevConcluded = countConcludedDeals(data.deals, prevStart, prevEnd);
  const prevTotal = countDeals(data.deals, prevStart, prevEnd);
  const prevConversion = prevTotal > 0 ? Math.round((prevConcluded / prevTotal) * 1000) / 10 : 0;
  const conversionDelta = computeDelta(conversionRate, prevConversion);

  const pendingTasks = data.tasks.filter(
    (t) => t.status !== "CONCLUIDA"
  ).length;
  const { start: prevTaskStart, end: prevTaskEnd } = getPreviousPeriodRange(period);
  const prevPending = data.tasks.filter((t) => {
    const tDate = new Date(t.dueDate);
    return tDate >= prevTaskStart && tDate <= prevTaskEnd && t.status !== "CONCLUIDA";
  }).length;
  const pendingDelta = computeDelta(pendingTasks, prevPending);

  const sparklineFromSeries = (series: SeriesPoint[]): number[] =>
    series.map((p) => p.value);

  const revenueSeries = buildRevenueSeries(data.deals, period, data.payments);
  const salesSeries = buildSalesSeries(data.deals, period);

  return {
    faturamento: {
      label: "Faturamento",
      value: revenue,
      delta: revenueDelta,
      direction: revenueDelta >= 0 ? "up" : "down",
      goodWhen: "up",
      sparkline: sparklineFromSeries(revenueSeries),
    },
    vendas: {
      label: "Vendas",
      value: totalDeals,
      delta: salesDelta,
      direction: salesDelta >= 0 ? "up" : "down",
      goodWhen: "up",
      sparkline: sparklineFromSeries(salesSeries),
    },
    clientes: {
      label: "Clientes",
      value: data.clients.length,
      delta: 0,
      direction: "neutral",
      goodWhen: "up",
      sparkline: sparklineFromSeries(
        buildClientSeries(data.clients, period)
      ),
    },
    conversao: {
      label: "Conversão",
      value: conversionRate,
      delta: conversionDelta,
      direction: conversionDelta >= 0 ? "up" : "down",
      goodWhen: "up",
      sparkline: sparklineFromSeries(revenueSeries).map((v) =>
        totalDeals > 0 ? Math.round((v / (revenue || 1)) * 100 * 10) / 10 : 0
      ),
    },
    pendencias: {
      label: "Pendências",
      value: pendingTasks,
      delta: pendingDelta,
      direction: pendingDelta <= 0 ? "up" : "down",
      goodWhen: "down",
      sparkline: sparklineFromSeries(salesSeries).map((v, i) =>
        Math.max(0, pendingTasks + ((i % 3) - 1))
      ),
    },
  };
}

export function buildMetricsForPeriod(
  period: DashboardPeriod,
  data: DashboardMetricInput
): ChartMetrics {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const newClients = data.clients.filter(
    (c) => new Date(c.createdAt) >= thirtyDaysAgo
  ).length;
  const activeClients = data.clients.filter(
    (c) => c.status === "CLIENTE_ATIVO" || c.status === "EM_NEGOCIACAO"
  ).length;
  const inactiveClients = data.clients.filter(
    (c) => c.status === "INATIVO" || c.status === "PERDIDO"
  ).length;

  return {
    revenue: buildRevenueSeries(data.deals, period, data.payments),
    sales: buildSalesSeries(data.deals, period),
    clients: buildClientSeries(data.clients, period),
    clientDistribution: [
      { label: "Novos", value: newClients, tone: "brand" },
      { label: "Ativos", value: activeClients, tone: "success" },
      { label: "Inativos", value: inactiveClients, tone: "neutral" },
    ],
  };
}

function buildPipeline(deals: Deal[]): PipelineData {
  const statusMap: Record<string, { label: string; order: number }> = {
    ORCAMENTO: { label: "Orçamento", order: 0 },
    NEGOCIACAO: { label: "Negociação", order: 1 },
    APROVADA: { label: "Aprovada", order: 2 },
    CONCLUIDA: { label: "Fechamento", order: 3 },
    CANCELADA: { label: "Cancelada", order: 4 },
  };

  const grouped: Record<string, { count: number; value: number }> = {};
  for (const deal of deals) {
    if (deal.status === "CANCELADA") continue;
    if (!grouped[deal.status]) {
      grouped[deal.status] = { count: 0, value: 0 };
    }
    grouped[deal.status].count += 1;
    grouped[deal.status].value += deal.value;
  }

  const stages = Object.entries(grouped)
    .map(([status, data]) => ({
      id: status.toLowerCase(),
      label: statusMap[status]?.label ?? status,
      order: statusMap[status]?.order ?? 99,
      count: data.count,
      value: data.value,
    }))
    .sort((a, b) => a.order - b.order);

  if (stages.length === 0) {
    stages.push(
      { id: "sem-dados", label: "Sem dados", order: 0, count: 0, value: 0 }
    );
  }

  const totalValue = stages.reduce((sum, s) => sum + s.value, 0);
  const totalCount = stages.reduce((sum, s) => sum + s.count, 0);
  const concludedCount = deals.filter((d) => d.status === "CONCLUIDA" || d.paymentStatus === "PAGO").length;
  const totalCountAll = deals.length;
  const conversion =
    totalCountAll > 0
      ? Math.round((concludedCount / totalCountAll) * 1000) / 10
      : 0;

  return { stages, totalValue, totalCount, conversion };
}

function buildPerformance(deals: Deal[]): PerformanceRow[] {
  const grouped: Record<string, { count: number; concluded: number }> = {};

  for (const deal of deals) {
    const rid = deal.responsibleId || "unknown";
    if (!grouped[rid]) {
      grouped[rid] = { count: 0, concluded: 0 };
    }
    grouped[rid].count += 1;
    if (deal.status === "CONCLUIDA" || deal.paymentStatus === "PAGO") {
      grouped[rid].concluded += 1;
    }
  }

  const rows: PerformanceRow[] = Object.entries(grouped).map(
    ([id, data], index) => ({
      id: `perf-${id}`,
      responsible: id,
      sales: data.count,
      conversion:
        data.count > 0
          ? Math.round((data.concluded / data.count) * 1000) / 10
          : 0,
      rank: 0,
    })
  );

  rows.sort((a, b) => b.sales - a.sales);
  rows.forEach((row, i) => {
    row.rank = i + 1;
  });

  return rows.slice(0, 10);
}

function buildGoals(
  revenueTotal: number,
  period: DashboardPeriod,
  goals?: { targetValue: number; currentValue?: number }[]
): GoalData {
  let target = 0;
  let achieved = 0;

  if (goals && goals.length > 0) {
    const goal = goals[0];
    target = goal.targetValue;
    achieved = goal.currentValue ?? revenueTotal;
  } else {
    target = revenueTotal > 0 ? Math.ceil(revenueTotal * 1.3) : 10000;
    achieved = revenueTotal;
  }

  const percentage =
    target > 0 ? Math.round((achieved / target) * 1000) / 10 : 0;

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

function buildInsights(
  data: DashboardMetricInput,
  revenue: number,
  conversion: number
): InsightItem[] {
  const staleClients = data.clients.filter(
    (client) => Date.now() - new Date(client.lastContactAt).getTime() > 15 * 86400000
  ).length;
  const upcomingPayments = data.payments.filter((payment) => {
    if (payment.status !== "PENDENTE") return false;
    const days = (new Date(payment.dueDate).getTime() - Date.now()) / 86400000;
    return days >= 0 && days <= 7;
  }).length;

  const items: InsightItem[] = [];

  if (revenue > 0) {
    items.push({
      id: "ins-revenue",
      tone: "positive",
      message: `Faturamento no período: ${compactNumber(revenue)}.`,
    });
  } else {
    items.push({
      id: "ins-revenue",
      tone: "info",
      message: "Nenhuma venda concluída no período ainda.",
    });
  }

  if (staleClients > 0)
    items.push({
      id: "ins-stale",
      tone: "warning",
      message: `${staleClients} clientes estão há mais de 15 dias sem contato.`,
    });

  if (conversion > 0) {
    items.push({
      id: "ins-conversion",
      tone: conversion >= 20 ? "success" : "neutral",
      message: `Taxa de conversão: ${conversion.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%.`,
    });
  }

  if (upcomingPayments > 0)
    items.push({
      id: "ins-payments",
      tone: "info",
      message: `${upcomingPayments} pagamentos estão próximos do vencimento.`,
    });

  if (items.length === 0) {
    items.push({
      id: "ins-empty",
      tone: "info",
      message: "Adicione clientes e vendas para ver insights.",
    });
  }

  return items;
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
      label: "tudo em dia",
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
  const kpis = buildKpisForPeriod("30d", data);
  const metrics = buildMetricsForPeriod("30d", data);
  const pipeline = buildPipeline(data.deals);
  const performance = buildPerformance(data.deals);
  const conversion = pipeline.conversion;
  const revenue = kpis.faturamento.value;
  const goals = buildGoals(revenue, "30d");

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
    performance,
    goals,
    insights: buildInsights(data, revenue, conversion),
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

export interface DashboardPeriodData {
  clients: Client[];
  deals: Deal[];
  payments: Payment[];
  tasks: Task[];
}

export function dashboardSummaryForPeriod(
  period: DashboardPeriod,
  data: DashboardPeriodData
): { kpis: DashboardKpis; metrics: ChartMetrics; goals: GoalData } {
  const metricInput: DashboardMetricInput = {
    clients: data.clients,
    deals: data.deals,
    payments: data.payments,
    followUps: [],
    tasks: data.tasks,
    events: [],
    notifications: [],
    activities: [],
  };
  const kpis = buildKpisForPeriod(period, metricInput);
  const metrics = buildMetricsForPeriod(period, metricInput);
  const goals = buildGoals(kpis.faturamento.value, period);
  return { kpis, metrics, goals };
}
