import { ClientList } from "@/components/clientes/ClientList";
import { clientService, userService } from "@/lib/services";

export default async function ClientesPage({
  searchParams,
}: PageProps<"/clientes">) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q : "";

  const [clients, users] = await Promise.all([
    clientService.getAll(),
    userService.getAllUsers(),
  ]);

  return (
    <ClientList
      clients={clients}
      users={users.map((user) => ({ id: user.id, name: user.name }))}
      initialQuery={query}
    />
  );
}