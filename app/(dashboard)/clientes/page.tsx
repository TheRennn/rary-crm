import { ClientListClient } from "@/components/clientes/ClientListClient";
import { clientService } from "@/lib/services";

export const dynamic = "force-dynamic";

export default async function ClientesPage({
  searchParams,
}: PageProps<"/clientes">) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q : "";

  const clients = await clientService.getAll();

  return (
    <ClientListClient
      clients={clients}
      initialQuery={query}
    />
  );
}