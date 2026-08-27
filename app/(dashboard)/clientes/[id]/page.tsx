import { notFound } from "next/navigation";
import { ClientDetail } from "@/components/clientes/ClientDetail";
import {
  clientService,
  dealService,
  followUpService,
  paymentService,
  taskService,
} from "@/lib/services";
import { clientRepository } from "@/lib/repositories";

export const dynamic = "force-dynamic";

export default async function ClienteDetailPage({
  params,
}: PageProps<"/clientes/[id]">) {
  const { id } = await params;

  const client = await clientService.getById(id);

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

  return (
    <ClientDetail
      client={client}
      responsibleName="—"
      timeline={timeline}
      purchases={purchases}
      payments={payments}
      tasks={clientTasks}
      followUps={clientFollowUps}
    />
  );
}