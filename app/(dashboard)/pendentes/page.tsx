import { TaskBoard } from "@/components/pendentes/TaskBoard";
import { clientService, taskService, userService } from "@/lib/services";

export default async function PendentesPage() {
  const [groups, clients, users] = await Promise.all([
    taskService.getGroups(),
    clientService.getAll(),
    userService.getAllUsers(),
  ]);

  return (
    <TaskBoard
      groups={groups}
      clients={clients.map((client) => ({ value: client.id, label: client.companyName }))}
      users={users.map((user) => ({ value: user.id, label: user.name }))}
    />
  );
}