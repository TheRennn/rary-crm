import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { userService } from "@/lib/services";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const appUser = await userService.getCurrentUser(user, supabase);

  // TODO: reativar quando dominio Resend estiver configurado
  // if (!appUser?.emailVerified) {
  //   redirect(`/verificar-email?email=${encodeURIComponent(user.email ?? "")}`);
  // }

  let companyName = "Minha empresa";
  let companyLogoUrl = "";
  if (appUser?.companyId) {
    const { data: company } = await supabase
      .from("companies")
      .select("name, logo_url")
      .eq("id", appUser.companyId)
      .single();
    if (company?.name) companyName = company.name;
    if (company?.logo_url) companyLogoUrl = company.logo_url;
  }

  return (
    <DashboardShell user={appUser} companyName={companyName} companyLogoUrl={companyLogoUrl}>
      {children}
    </DashboardShell>
  );
}
