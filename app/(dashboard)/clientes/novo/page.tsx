import ClientForm from "@/components/clientes/ClientForm";
import { userService } from "@/lib/services";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function NovoClientePage({
  searchParams,
}: PageProps<"/clientes/novo">) {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) redirect("/login");

  const currentUser = await userService.getCurrentUser(authUser, supabase);
  const params = await searchParams;
  const kind = params.kind === "FORNECEDOR" ? "FORNECEDOR" : "CLIENTE";

  return (
    <ClientForm
      key={kind}
      currentUserId={currentUser?.id ?? ""}
      initialKind={kind}
    />
  );
}