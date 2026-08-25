import { FollowUpContent } from "@/components/followup/FollowUpContent";
import { followUpService, userService } from "@/lib/services";

export const dynamic = "force-dynamic";

export default async function FollowUpPage() {
  const [groups, users] = await Promise.all([
    followUpService.getGroups(),
    userService.getAllUsers(),
  ]);

  const userMap = new Map(users.map((user) => [user.id, user.name]));

  return (
    <FollowUpContent
      groups={groups}
      responsibleNames={Object.fromEntries(userMap)}
    />
  );
}