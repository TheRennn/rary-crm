import { redirect } from "next/navigation";
import { FollowUpContentClient } from "@/components/followup/FollowUpContentClient";
import { followUpService, clientService } from "@/lib/services";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function FollowUpPage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect("/login");
  }

  const [groups, clients] = await Promise.all([
    followUpService.getGroups(),
    clientService.getAll(),
  ]);

  return (
    <FollowUpContentClient
      groups={groups}
      clients={clients.map((c) => ({ id: c.id, name: c.companyName || c.name || "Sem nome", code: c.code }))}
    />
  );
}
