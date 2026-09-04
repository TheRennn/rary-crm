import { redirect } from "next/navigation";
import { FollowUpContentClient } from "@/components/followup/FollowUpContentClient";
import { followUpService } from "@/lib/services";
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

  const groups = await followUpService.getGroups();

  return (
    <FollowUpContentClient
      groups={groups}
    />
  );
}
