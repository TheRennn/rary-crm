import ClientForm from "@/components/clientes/ClientForm";
import { userService } from "@/lib/services";

export default async function NovoClientePage() {
  const users = await userService.getAllUsers();

  return <ClientForm users={users.map((user) => ({ id: user.id, name: user.name }))} />;
}