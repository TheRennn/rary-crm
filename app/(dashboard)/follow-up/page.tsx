import { FollowUpContentClient } from "@/components/followup/FollowUpContentClient";
import { followUpService } from "@/lib/services";

export const dynamic = "force-dynamic";

export default async function FollowUpPage() {
  const groups = await followUpService.getGroups();

  return (
    <FollowUpContentClient
      groups={groups}
    />
  );
}