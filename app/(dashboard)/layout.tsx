import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { getAccessRequirementStatus } from "@/lib/auth/subscription-access";
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

  const { data: access, error: accessError } = await supabase
    .from("users")
    .select("email, email_verified, payment_verified, access_requirements_enforced, access_expires_at")
    .eq("auth_id", user.id)
    .maybeSingle();

  if (accessError) {
    console.error("Erro ao validar permissões de acesso ao dashboard:", accessError);
    throw new Error("Não foi possível validar as permissões da conta.");
  }

  if (!access) {
    redirect("/login");
  }

  const accessStatus = getAccessRequirementStatus({
    requirementsEnforced: access.access_requirements_enforced,
    emailVerified: access.email_verified,
    paymentVerified: access.payment_verified,
    accessExpiresAt: access.access_expires_at,
  });

  if (accessStatus === "email-unverified") {
    redirect(`/verificar-email?email=${encodeURIComponent(access.email || user.email || "")}`);
  }

  if (accessStatus === "payment-required") {
    redirect(`/pagamento?email=${encodeURIComponent(access.email || user.email || "")}`);
  }

  const appUser = await userService.getCurrentUser(user, supabase);
  if (!appUser) {
    redirect("/login");
  }

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
