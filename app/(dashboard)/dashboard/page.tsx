import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import {
  buildDashboardData,
  type DashboardMetricInput,
} from "@/lib/dashboard/dashboard-mock-data";
import type { DashboardData } from "@/lib/dashboard/dashboard-types";
import {
  calendarService,
  clientService,
  commissionService,
  dealService,
  followUpService,
  notificationService,
  orderService,
  paymentService,
  taskService,
  userService,
} from "@/lib/services";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect("/login");
  }

  const [
    user,
    clients,
    deals,
    payments,
    followUpGroups,
    taskGroups,
    events,
    notifications,
    activities,
    commissions,
    orders,
  ] = await Promise.all([
    userService.getCurrentUser(authUser, supabase).catch(() => null),
    clientService.getAll().catch(() => []),
    dealService.getAll().catch(() => []),
    paymentService.getAll().catch(() => []),
    followUpService.getGroups().catch(() => ({ hoje: [], atrasados: [], proximos: [], concluidos: [] })),
    taskService.getGroups().catch(() => ({ atrasadas: [], hoje: [], proximas: [], concluidas: [] })),
    calendarService.getAll().catch(() => []),
    notificationService.getAll().catch(() => []),
    userService.getActivities().catch(() => []),
    commissionService.getAll().catch(() => []),
    orderService.getAll().catch(() => []),
  ]);

  const input: DashboardMetricInput = {
    clients,
    deals,
    payments,
    followUps: [
      ...followUpGroups.hoje,
      ...followUpGroups.atrasados,
      ...followUpGroups.proximos,
      ...followUpGroups.concluidos,
    ],
    tasks: [
      ...taskGroups.atrasadas,
      ...taskGroups.hoje,
      ...taskGroups.proximas,
      ...taskGroups.concluidas,
    ],
    events,
    notifications,
    activities,
    commissions,
    orders,
  };

  const data: DashboardData = {
    ...buildDashboardData(input),
    user: user ? { name: user.name.split(" ")[0] } : null,
  };

  return <DashboardClient data={data} />;
}
