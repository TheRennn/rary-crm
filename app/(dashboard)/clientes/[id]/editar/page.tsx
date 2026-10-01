import { notFound, redirect } from "next/navigation";
import ClientForm from "@/components/clientes/ClientForm";
import { clientService, userService } from "@/lib/services";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function EditarClientePage({
  params,
}: PageProps<"/clientes/[id]/editar">) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) redirect("/login");

  const [client, currentUser] = await Promise.all([
    clientService.getById(id),
    userService.getCurrentUser(authUser, supabase),
  ]);

  if (!client) {
    notFound();
  }

  return (
    <ClientForm
      key={client.id}
      currentUserId={currentUser?.id ?? ""}
      editClient={client}
    />
  );
}
