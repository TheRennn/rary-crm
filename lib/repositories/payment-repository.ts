import { createUniversalClient } from "@/lib/supabase/universal";
import { getClientIdsForCompany } from "@/lib/supabase/company-clients";
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
    direction: (row.direction as Payment["direction"]) ?? "ENTRADA",
    supplierName: (row.supplier_name as string) ?? undefined,
    attachmentUrl: (row.attachment_url as string) ?? undefined,
    attachmentName: (row.attachment_name as string) ?? undefined,
  };
}

export type CreatePaymentInput = Omit<Payment, "id">;

export class PaymentRepository {
  async findAll(companyId?: string | null): Promise<Payment[]> {
    const supabase = await createUniversalClient();
    const clientIds = await getClientIdsForCompany(companyId);

    if (clientIds.length === 0) return [];

    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .in("client_id", clientIds)
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

  async findByDeal(dealId: string): Promise<Payment[]> {
    const supabase = await createUniversalClient();
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .eq("deal_id", dealId)
      .order("due_date", { ascending: false });

    if (error || !data) return [];
    return data.map(rowToPayment);
  }

  async create(input: CreatePaymentInput): Promise<Payment> {
    const supabase = await createUniversalClient();
    const id = `pay-${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;

    const row = {
      id,
      client_id: input.clientId,
      deal_id: input.dealId ?? null,
      purchase_id: input.purchaseId ?? null,
      client_name: input.clientName,
      description: input.description,
      value: input.value,
      due_date: input.dueDate,
      status: input.status,
      method: input.method,
      direction: input.direction ?? "ENTRADA",
      supplier_name: input.supplierName ?? "",
      attachment_url: input.attachmentUrl ?? null,
      attachment_name: input.attachmentName ?? null,
    };

    const { error: insertError } = await supabase.from("payments").insert(row);
    if (insertError) throw insertError;
    return { id, ...input };
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
    if (input.direction !== undefined) row.direction = input.direction;
    if (input.supplierName !== undefined) row.supplier_name = input.supplierName;
    if (input.attachmentUrl !== undefined) row.attachment_url = input.attachmentUrl ?? null;
    if (input.attachmentName !== undefined) row.attachment_name = input.attachmentName ?? null;

    const { data, error } = await supabase.from("payments").update(row).eq("id", id).select().single();
    if (error) throw error;
    return rowToPayment(data);
  }

  async delete(id: string): Promise<void> {
    const supabase = await createUniversalClient();
    const { error } = await supabase.from("payments").delete().eq("id", id);
    if (error) throw error;
  }
}

export const paymentRepository = new PaymentRepository();
