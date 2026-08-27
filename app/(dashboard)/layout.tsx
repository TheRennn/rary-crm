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

  if (!user.email_confirmed_at) {
    redirect(`/verificar-email?email=${encodeURIComponent(user.email ?? "")}`);
  }

  const appUser = await userService.getCurrentUser(user, supabase);

  let companyName = "Minha empresa";
  if (appUser?.companyId) {
    const { data: company } = await supabase
      .from("companies")
      .select("name")
      .eq("id", appUser.companyId)
      .single();
    if (company?.name) companyName = company.name;
  }

  return (
    <DashboardShell user={appUser} companyName={companyName}>
      {children}
    </DashboardShell>
  );
}
