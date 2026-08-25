import { createUniversalClient } from "@/lib/supabase/universal";
import type { FollowUp } from "@/types";

function rowToFollowUp(row: Record<string, unknown>): FollowUp {
  return {
    id: row.id as string,
    clientId: (row.client_id as string) ?? "",
    clientName: (row.client_name as string) ?? "",
    responsibleId: (row.responsible_id as string) ?? "",
    type: row.type as FollowUp["type"],
    date: row.date as string,
    time: (row.time as string) ?? "09:00",
    status: row.status as FollowUp["status"],
    subject: (row.subject as string) ?? undefined,
  };
}

export class FollowUpRepository {
  async findAll(): Promise<FollowUp[]> {
    const supabase = await createUniversalClient();
    const { data, error } = await supabase
      .from("follow_ups")
      .select("*")
      .order("date", { ascending: false });

    if (error || !data) return [];
    return data.map(rowToFollowUp);
  }
}

export const followUpRepository = new FollowUpRepository();
