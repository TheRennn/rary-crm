import type { ReactNode } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { userService } from "@/lib/services";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await userService.getCurrentUser();
  const companyName = user?.companyId === "comp-rary" ? "RARY" : "Minha empresa";

  return (
    <DashboardShell user={user} companyName={companyName}>
      {children}
    </DashboardShell>
  );
}