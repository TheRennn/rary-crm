import ClientForm from "@/components/clientes/ClientForm";
import { userService } from "@/lib/services";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function NovoClientePage() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) redirect("/login");

  const currentUser = await userService.getCurrentUser(authUser, supabase);

  return (
    <ClientForm
      currentUserId={currentUser?.id ?? ""}
    />
  );
}