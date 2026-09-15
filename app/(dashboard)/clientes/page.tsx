import { ClientListClient } from "@/components/clientes/ClientListClient";
import { clientService, productService } from "@/lib/services";

export const dynamic = "force-dynamic";

export default async function ClientesPage({
  searchParams,
}: PageProps<"/clientes">) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q : "";
  const tab = typeof params.tab === "string" ? params.tab : "clientes";

  const [clients, products] = await Promise.all([
    clientService.getAll(),
    tab === "produtos" ? productService.getAll().catch(() => []) : Promise.resolve([]),
  ]);

  return (
    <ClientListClient
      clients={clients}
      products={products}
      initialQuery={query}
      initialTab={tab}
    />
  );
}