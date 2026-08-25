import { createUniversalClient } from "@/lib/supabase/universal";
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
  async findAll(): Promise<Notification[]> {
    const supabase = await createUniversalClient();
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data.map(rowToNotification);
  }
}

export const notificationRepository = new NotificationRepository();
