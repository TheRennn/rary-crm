import { createUniversalClient } from "@/lib/supabase/universal";
import type { Commission } from "@/types";

export type CreateCommissionInput = Omit<Commission, "id">;

function rowToCommission(row: Record<string, unknown>): Commission {
  return {
    id: row.id as string,
    companyName: (row.company_name as string) ?? "",
    period: (row.period as string) ?? "",
    rate: Number(row.rate) || 0,
    baseValue: Number(row.base_value) || 0,
    value: Number(row.value) || 0,
    dueDate: row.due_date as string,
    status: row.status as Commission["status"],
    method: row.method as Commission["method"],
    installments: (row.installments as Commission["installments"]) ?? undefined,
    notes: (row.notes as string) ?? undefined,
  };
}

export class CommissionRepository {
  async findAll(): Promise<Commission[]> {
    const supabase = await createUniversalClient();
    const { data, error } = await supabase
      .from("commissions")
      .select("*")
      .order("due_date", { ascending: false });

    if (error || !data) return [];
    return data.map(rowToCommission);
  }

  async create(input: CreateCommissionInput): Promise<Commission> {
    const supabase = await createUniversalClient();
    const id = `com-${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;

    const row = {
      id,
      company_name: input.companyName,
      period: input.period,
      rate: input.rate,
      base_value: input.baseValue,
      value: input.value,
      due_date: input.dueDate,
      status: input.status,
      method: input.method,
      installments: input.installments ?? null,
      notes: input.notes ?? null,
    };

    const { error: insertError } = await supabase.from("commissions").insert(row);
    if (insertError) throw insertError;

    return { id, ...input };
  }

  async update(id: string, input: Partial<CreateCommissionInput>): Promise<Commission> {
    const supabase = await createUniversalClient();
    const row: Record<string, unknown> = {};
    if (input.companyName !== undefined) row.company_name = input.companyName;
    if (input.period !== undefined) row.period = input.period;
    if (input.rate !== undefined) row.rate = input.rate;
    if (input.baseValue !== undefined) row.base_value = input.baseValue;
    if (input.value !== undefined) row.value = input.value;
    if (input.dueDate !== undefined) row.due_date = input.dueDate;
    if (input.status !== undefined) row.status = input.status;
    if (input.method !== undefined) row.method = input.method;
    if (input.installments !== undefined) row.installments = input.installments ?? null;
    if (input.notes !== undefined) row.notes = input.notes ?? null;

    const { data, error } = await supabase.from("commissions").update(row).eq("id", id).select().single();
    if (error) throw error;
    return rowToCommission(data);
  }
}

export const commissionRepository = new CommissionRepository();
