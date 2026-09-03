import { createUniversalClient } from "@/lib/supabase/universal";
import { getUserIdFromUser } from "@/lib/supabase/auth";
import { getClientIdsForCompany } from "@/lib/supabase/company-clients";
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

export type CreateFollowUpInput = Omit<FollowUp, "id">;

export class FollowUpRepository {
  async findAll(companyId?: string | null): Promise<FollowUp[]> {
    const supabase = await createUniversalClient();
    const [clientIds, userId] = await Promise.all([
      getClientIdsForCompany(companyId),
      getUserIdFromUser(),
    ]);

    let query = supabase.from("follow_ups").select("*");

    const conditions: string[] = [];

    if (clientIds.length > 0) {
      conditions.push(`client_id.in.(${clientIds.join(",")})`);
    }
    if (userId) {
      conditions.push(`responsible_id.eq.${userId}`);
    }

    if (conditions.length === 0) return [];

    query = query.or(conditions.join(","));

    const { data, error } = await query.order("date", { ascending: false });

    if (error || !data) return [];
    return data.map(rowToFollowUp);
  }

  async create(input: CreateFollowUpInput): Promise<FollowUp> {
    const supabase = await createUniversalClient();
    const id = `fu-${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;

    const responsibleId = input.responsibleId || (await getUserIdFromUser()) || null;

    const dateTime = input.date.includes("T")
      ? input.date
      : `${input.date}T${input.time || "09:00"}:00`;

    const row = {
      id,
      client_id: input.clientId || null,
      client_name: input.clientName,
      responsible_id: responsibleId,
      type: input.type,
      date: dateTime,
      time: input.time,
      status: input.status,
      subject: input.subject ?? null,
    };

    const { error: insertError } = await supabase.from("follow_ups").insert(row);
    if (insertError) throw insertError;
    return { id, ...input };
  }

  async update(id: string, input: Partial<CreateFollowUpInput>): Promise<FollowUp> {
    const supabase = await createUniversalClient();
    const row: Record<string, unknown> = {};
    if (input.clientId !== undefined) row.client_id = input.clientId;
    if (input.clientName !== undefined) row.client_name = input.clientName;
    if (input.responsibleId !== undefined) row.responsible_id = input.responsibleId;
    if (input.type !== undefined) row.type = input.type;
    if (input.date !== undefined) row.date = input.date;
    if (input.time !== undefined) row.time = input.time;
    if (input.status !== undefined) row.status = input.status;
    if (input.subject !== undefined) row.subject = input.subject ?? null;

    const { data, error } = await supabase.from("follow_ups").update(row).eq("id", id).select().single();
    if (error) throw error;
    return rowToFollowUp(data);
  }

  async delete(id: string): Promise<void> {
    const supabase = await createUniversalClient();
    const { error } = await supabase.from("follow_ups").delete().eq("id", id);
    if (error) throw error;
  }
}

export const followUpRepository = new FollowUpRepository();
