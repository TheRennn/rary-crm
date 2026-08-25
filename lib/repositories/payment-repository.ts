import { createUniversalClient } from "@/lib/supabase/universal";
import type { Payment } from "@/types";

function rowToPayment(row: Record<string, unknown>): Payment {
  return {
    id: row.id as string,
    clientId: (row.client_id as string) ?? "",
    dealId: (row.deal_id as string) ?? undefined,
    purchaseId: (row.purchase_id as string) ?? undefined,
    clientName: (row.client_name as string) ?? "",
    description: (row.description as string) ?? "",
    value: Number(row.value) || 0,
    dueDate: row.due_date as string,
    status: row.status as Payment["status"],
    method: (row.method as string) ?? "",
  };
}

export class PaymentRepository {
  async findAll(): Promise<Payment[]> {
    const supabase = await createUniversalClient();
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .order("due_date", { ascending: false });

    if (error || !data) return [];
    return data.map(rowToPayment);
  }

  async findByClient(clientId: string): Promise<Payment[]> {
    const supabase = await createUniversalClient();
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .eq("client_id", clientId)
      .order("due_date", { ascending: false });

    if (error || !data) return [];
    return data.map(rowToPayment);
  }

  async update(id: string, input: Partial<Omit<Payment, "id">>): Promise<Payment> {
    const supabase = await createUniversalClient();
    const row: Record<string, unknown> = {};
    if (input.clientId !== undefined) row.client_id = input.clientId;
    if (input.clientName !== undefined) row.client_name = input.clientName;
    if (input.description !== undefined) row.description = input.description;
    if (input.value !== undefined) row.value = input.value;
    if (input.dueDate !== undefined) row.due_date = input.dueDate;
    if (input.status !== undefined) row.status = input.status;
    if (input.method !== undefined) row.method = input.method;

    const { data, error } = await supabase.from("payments").update(row).eq("id", id).select().single();
    if (error) throw error;
    return rowToPayment(data);
  }
}

export const paymentRepository = new PaymentRepository();
