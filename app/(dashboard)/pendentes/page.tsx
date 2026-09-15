import { TaskBoardClient } from "@/components/pendentes/TaskBoardClient";
import { clientService, taskService } from "@/lib/services";

export const dynamic = "force-dynamic";

export default async function PendentesPage() {
  const [groups, clients] = await Promise.all([
    taskService.getGroups(),
    clientService.getAll(),
  ]);

  return (
    <TaskBoardClient
      groups={groups}
      clients={clients.map((client) => ({
        value: client.id,
        label: `[${client.kind === "FORNECEDOR" ? "FOR" : "CLT"}] ${client.companyName || client.name || "Sem nome"}`,
      }))}
    />
  );
}