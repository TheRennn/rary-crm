import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { UpcomingCommitments } from "@/components/dashboard/UpcomingCommitments";
import { PendingTasks } from "@/components/dashboard/PendingTasks";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  calendarService,
  clientService,
  dealService,
  followUpService,
  paymentService,
  taskService,
  userService,
} from "@/lib/services";

function greeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Bom dia";
  if (hour >= 12 && hour < 18) return "Boa tarde";
  return "Boa noite";
}

export default async function DashboardPage() {
  const [user, clients, dealStats, paymentStats, followUpGroups, taskGroups, events, activities] =
    await Promise.all([
      userService.getCurrentUser(),
      clientService.getAll(),
      dealService.getStats(),
      paymentService.getStats(),
      followUpService.getGroups(),
      taskService.getGroups(),
      calendarService.getAll(),
      userService.getActivities(),
    ]);

  // eslint-disable-next-line react-hooks/purity -- janela de recência calculada no servidor (mock)
  const thirtyDaysAgo = Date.now() - 30 * 86400000;
  const newClients = clients.filter(
    (client) => new Date(client.createdAt).getTime() >= thirtyDaysAgo
  ).length;

  const todayISO = new Date().toISOString().slice(0, 10);
  const upcomingEvents = events
    .filter((event) => event.date.slice(0, 10) >= todayISO)
    .sort((a, b) =>
      (a.date + a.time).localeCompare(b.date + b.time)
    )
    .slice(0, 6);

  const pendingTasks = [...taskGroups.atrasadas, ...taskGroups.hoje].slice(0, 6);

  const stats = {
    clients: clients.length,
    newClients,
    concludedDeals: dealStats.concludedCount,
    pendingDealsValue: dealStats.pendingValue,
    overdueTasks: taskGroups.atrasadas.length,
    paymentsReceived: paymentStats.received,
    followUpsToday: followUpGroups.hoje.length,
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={`${greeting()}, ${user?.name?.split(" ")[0] ?? "equipe"}`}
        description="Visão geral da operação"
      />

      <DashboardStats data={stats} />

      <div className="grid gap-6 xl:grid-cols-2">
        <UpcomingCommitments events={upcomingEvents} />
        <PendingTasks tasks={pendingTasks} />
      </div>

      <RecentActivity activities={activities} />
    </div>
  );
}