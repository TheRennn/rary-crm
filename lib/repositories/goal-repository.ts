import { createUniversalClient } from "@/lib/supabase/universal";
import { getUserIdFromUser } from "@/lib/supabase/auth";
import type { Goal } from "@/types";

function rowToGoal(row: Record<string, unknown>): Goal {
  return {
    id: row.id as string,
    targetType: row.target_type as Goal["targetType"],
    targetValue: Number(row.target_value) || 0,
    period: (row.period as string) ?? "",
    currentValue: row.current_value != null ? Number(row.current_value) : undefined,
    notes: (row.notes as string) ?? undefined,
    createdAt: row.created_at as string,
  };
}

export class GoalRepository {
  async findAll(userId?: string | null): Promise<Goal[]> {
    const supabase = await createUniversalClient();
    const uid = userId ?? await getUserIdFromUser();
    if (!uid) return [];

    const query = supabase.from("goals").select("*").eq("user_id", uid);
    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) throw error;
    if (!data) throw new Error("O Supabase não retornou dados para esta consulta.");
    return data.map(rowToGoal);
  }

  async create(input: Omit<Goal, "id">, userId?: string | null): Promise<Goal> {
    const supabase = await createUniversalClient();
    const uid = userId ?? await getUserIdFromUser();
    if (!uid) throw new Error("Não foi possível identificar o usuário desta conta.");
    const id = `goal-${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;

    const row = {
      id,
      user_id: uid,
      target_type: input.targetType,
      target_value: input.targetValue,
      period: input.period,
      current_value: input.currentValue ?? null,
      notes: input.notes ?? null,
      created_at: input.createdAt,
    };

    const { error: insertError } = await supabase.from("goals").insert(row);
    if (insertError) throw insertError;

    return { id, ...input };
  }

  async update(id: string, input: Partial<Omit<Goal, "id">>): Promise<Goal> {
    const supabase = await createUniversalClient();
    const row: Record<string, unknown> = {};
    if (input.targetType !== undefined) row.target_type = input.targetType;
    if (input.targetValue !== undefined) row.target_value = input.targetValue;
    if (input.period !== undefined) row.period = input.period;
    if (input.currentValue !== undefined) row.current_value = input.currentValue ?? null;
    if (input.notes !== undefined) row.notes = input.notes ?? null;

    const { data, error } = await supabase.from("goals").update(row).eq("id", id).select().single();
    if (error) throw error;
    return rowToGoal(data);
  }

  async delete(id: string): Promise<void> {
    const supabase = await createUniversalClient();
    const { data, error } = await supabase.from("goals").delete().eq("id", id).select("id");
    if (error) throw error;
    if (!data?.length) throw new Error("Registro não encontrado ou sem permissão para excluí-lo.");
  }
}

export const goalRepository = new GoalRepository();
