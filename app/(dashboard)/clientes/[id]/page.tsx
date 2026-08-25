import { notFound } from "next/navigation";
import { ClientDetail } from "@/components/clientes/ClientDetail";
import {
  clientService,
  dealService,
  followUpService,
  paymentService,
  taskService,
  userService,
} from "@/lib/services";
import { clientRepository } from "@/lib/repositories";

export const dynamic = "force-dynamic";

export default async function ClienteDetailPage({
  params,
}: PageProps<"/clientes/[id]">) {
  const { id } = await params;

  const [client, users] = await Promise.all([
    clientService.getById(id),
    userService.getAllUsers(),
  ]);

  if (!client) {
    notFound();
  }

  const [timeline, purchases, payments, tasks, followUps] = await Promise.all([
    clientRepository.findTimeline(id),
    dealService.getPurchasesByClient(id),
    paymentService.getByClient(id),
    taskService.getAll(),
    followUpService.getAll(),
  ]);

  const clientTasks = tasks.filter((task) => task.clientId === id);
  const clientFollowUps = followUps.filter((followUp) => followUp.clientId === id);
  const responsibleName = users.find((user) => user.id === client.responsibleId)?.name ?? "—";

  return (
    <ClientDetail
      client={client}
      responsibleName={responsibleName}
      timeline={timeline}
      purchases={purchases}
      payments={payments}
      tasks={clientTasks}
      followUps={clientFollowUps}
    />
  );
}