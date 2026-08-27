import { redirect } from "next/navigation";
import { SettingsContent } from "@/components/configuracoes/SettingsContent";
import { userService } from "@/lib/services";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ConfiguracoesPage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect("/login");
  }

  const user = await userService.getCurrentUser(authUser, supabase);

  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("id", user?.companyId ?? "")
    .single();

  return (
    <SettingsContent
      user={
        user
          ? { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone }
          : null
      }
      company={
        company
          ? { id: company.id, name: company.name, cnpj: company.cnpj, segment: company.segment, city: company.city, state: company.state }
          : { id: "", name: "", cnpj: "", segment: "", city: "", state: "" }
      }
    />
  );
}
