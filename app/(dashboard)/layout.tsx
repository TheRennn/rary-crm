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

  const appUser = await userService.getCurrentUser(user.email ?? undefined);
  const companyName = appUser?.companyId === "comp-rary" ? "RARY" : "Minha empresa";

  return (
    <DashboardShell user={appUser} companyName={companyName}>
      {children}
    </DashboardShell>
  );
}
