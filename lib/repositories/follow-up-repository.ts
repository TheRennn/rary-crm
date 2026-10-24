import { createUniversalClient } from "@/lib/supabase/universal";
import { getUserIdFromUser } from "@/lib/supabase/auth";
import type { FollowUp } from "@/types";

function rowToFollowUp(row: Record<string, unknown>): FollowUp {
  const rawDate = row.date as string;
  let normalizedDate = rawDate;
  if (rawDate) {
    normalizedDate = rawDate.replace(/([+-]\d{2}:\d{2}|Z)$/, "");
    if (!normalizedDate.includes("T")) {
      normalizedDate = normalizedDate.replace(" ", "T");
    }
  }

  return {
    id: row.id as string,
    clientId: (row.client_id as string) ?? "",
    clientName: (row.client_name as string) ?? "",
    responsibleId: (row.responsible_id as string) ?? "",
    type: row.type as FollowUp["type"],
    date: normalizedDate,
    time: (row.time as string) ?? "09:00",
    status: row.status as FollowUp["status"],
    subject: (row.subject as string) ?? undefined,
  };
}

export type CreateFollowUpInput = Omit<FollowUp, "id">;

export class FollowUpRepository {
  async findAll(): Promise<FollowUp[]> {
    const supabase = await createUniversalClient();
    const userId = await getUserIdFromUser();
    if (!userId) return [];

    const query = supabase.from("follow_ups").select("*")
      .or(`responsible_id.eq.${userId},owner_user_id.eq.${userId}`);

    const { data, error } = await query.order("date", { ascending: false });

    if (error) throw error;
    if (!data) throw new Error("O Supabase não retornou dados para esta consulta.");
    return data.map(rowToFollowUp);
  }

  async create(input: CreateFollowUpInput): Promise<FollowUp> {
    const supabase = await createUniversalClient();
    const id = `fu-${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;

    const responsibleId = input.responsibleId || (await getUserIdFromUser());
    if (!responsibleId) {
      throw new Error("Não foi possível identificar o usuário responsável.");
    }
    const ownerId = await getUserIdFromUser();
    if (!ownerId) throw new Error("Não foi possível identificar o usuário desta conta.");

    const dateTime = input.date.includes("T")
      ? input.date
      : `${input.date}T${input.time || "09:00"}:00`;

    const row = {
      id,
      owner_user_id: ownerId,
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
    return { id, ...input, responsibleId };
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
    const { data, error } = await supabase.from("follow_ups").delete().eq("id", id).select("id");
    if (error) throw error;
    if (!data?.length) throw new Error("Registro não encontrado ou sem permissão para excluí-lo.");
  }
}

export const followUpRepository = new FollowUpRepository();
