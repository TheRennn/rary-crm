import { StatCard } from "@/components/ui/StatCard";
import {
  IconUsers,
  IconTrendingUp,
  IconCheckSquare,
  IconCreditCard,
  IconRefresh,
} from "@/components/icons";
import { IconUserPlus } from "@/components/ui/icons-additional";

export interface DashboardStatsData {
  clients: number;
  newClients: number;
  concludedDeals: number;
  pendingDealsValue: number;
  overdueTasks: number;
  paymentsReceived: number;
  followUpsToday: number;
}

export function DashboardStats({ data }: { data: DashboardStatsData }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
      <StatCard
        label="Clientes"
        value={data.clients}
        icon={<IconUsers className="h-5 w-5" />}
        trend="neutral"
        trendLabel="total"
      />
      <StatCard
        label="Novos clientes"
        value={data.newClients}
        icon={<IconUserPlus className="h-5 w-5" />}
        trend="up"
        trendLabel="30 dias"
      />
      <StatCard
        label="Vendas concluídas"
        value={data.concludedDeals}
        icon={<IconTrendingUp className="h-5 w-5" />}
        trend="up"
        trendLabel="realizadas"
      />
      <StatCard
        label="Pendentes"
        value={data.overdueTasks}
        icon={<IconCheckSquare className="h-5 w-5" />}
        trend="down"
        trendLabel="atrasadas"
      />
      <StatCard
        label="Pagamentos recebidos"
        value={`R$ ${data.paymentsReceived.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`}
        icon={<IconCreditCard className="h-5 w-5" />}
        trend="neutral"
        trendLabel="acumulado"
      />
      <StatCard
        label="Follow-ups hoje"
        value={data.followUpsToday}
        icon={<IconRefresh className="h-5 w-5" />}
        trend="neutral"
        trendLabel="agendados"
      />
    </div>
  );
}