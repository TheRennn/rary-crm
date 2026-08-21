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
  dealService,
  followUpService,
  notificationService,
  paymentService,
  taskService,
  userService,
} from "@/lib/services";
import { createClient } from "@/lib/supabase/server";

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrador",
  GERENTE: "Gerente",
  VENDEDOR: "Vendedor",
};

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
  ] = await Promise.all([
    userService.getCurrentUser(authUser.email ?? undefined),
    clientService.getAll(),
    dealService.getAll(),
    paymentService.getAll(),
    followUpService.getGroups(),
    taskService.getGroups(),
    calendarService.getAll(),
    notificationService.getAll(),
    userService.getActivities(),
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
  };

  const data: DashboardData = {
    ...buildDashboardData(input),
    user: user
      ? { name: user.name.split(" ")[0], role: ROLE_LABELS[user.role] ?? user.role }
      : null,
  };

  return <DashboardClient data={data} />;
}
