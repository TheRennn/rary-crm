import ClientForm from "@/components/clientes/ClientForm";
import { userService } from "@/lib/services";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function NovoClientePage() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) redirect("/login");

  const [currentUser, users] = await Promise.all([
    userService.getCurrentUser(authUser, supabase),
    userService.getAllUsers(),
  ]);

  return (
    <ClientForm
      users={users.map((u) => ({ id: u.id, name: u.name }))}
      currentUserId={currentUser?.id ?? ""}
    />
  );
}