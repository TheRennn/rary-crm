import { createUniversalClient } from "@/lib/supabase/universal";
import { getUserIdFromUser } from "@/lib/supabase/auth";
import type { Notification } from "@/types";

function rowToNotification(row: Record<string, unknown>): Notification {
  return {
    id: row.id as string,
    type: row.type as Notification["type"],
    title: row.title as string,
    message: row.message as string,
    createdAt: row.created_at as string,
    read: (row.read as boolean) ?? false,
  };
}

export class NotificationRepository {
  async findAll(userId?: string | null): Promise<Notification[]> {
    const supabase = await createUniversalClient();
    const uid = userId ?? await getUserIdFromUser();

    let query = supabase.from("notifications").select("*");
    if (uid) {
      query = query.eq("user_id", uid);
    }
    const { data, error } = await query.order("created_at", { ascending: false });

    if (error || !data) return [];
    return data.map(rowToNotification);
  }
}

export const notificationRepository = new NotificationRepository();
