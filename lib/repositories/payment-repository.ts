import { createUniversalClient } from "@/lib/supabase/universal";
import { getUserIdFromUser } from "@/lib/supabase/auth";
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
    recurrent: (row.recurrent as boolean) ?? false,
  };
}

export type CreatePaymentInput = Omit<Payment, "id">;

export class PaymentRepository {
  async findAll(companyId?: string | null): Promise<Payment[]> {
    const supabase = await createUniversalClient();
    const [clientIds, ownerId] = await Promise.all([
      getClientIdsForCompany(companyId),
      getUserIdFromUser(),
    ]);
    if (!ownerId) return [];

    let query = supabase.from("payments").select("*");
    query = clientIds.length
      ? query.or(`client_id.in.(${clientIds.join(",")}),owner_user_id.eq.${ownerId}`)
      : query.eq("owner_user_id", ownerId);
    const { data, error } = await query.order("due_date", { ascending: false });

    if (error) throw error;
    if (!data) throw new Error("O Supabase não retornou dados para esta consulta.");
    return data.map(rowToPayment);
  }

  async findByClient(clientId: string): Promise<Payment[]> {
    const supabase = await createUniversalClient();
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .eq("client_id", clientId)
      .order("due_date", { ascending: false });

    if (error) throw error;
    if (!data) throw new Error("O Supabase não retornou dados para esta consulta.");
    return data.map(rowToPayment);
  }

  async findByDeal(dealId: string): Promise<Payment[]> {
    const supabase = await createUniversalClient();
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .eq("deal_id", dealId)
      .order("due_date", { ascending: false });

    if (error) throw error;
    if (!data) throw new Error("O Supabase não retornou dados para esta consulta.");
    return data.map(rowToPayment);
  }

  async create(input: CreatePaymentInput): Promise<Payment> {
    const supabase = await createUniversalClient();
    const ownerId = await getUserIdFromUser();
    if (!ownerId) throw new Error("Não foi possível identificar o usuário desta conta.");
    const id = `pay-${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;

    const dueDateValue = input.dueDate
      ? (input.dueDate.includes("T") ? input.dueDate : `${input.dueDate}T00:00:00.000Z`)
      : new Date().toISOString();

    const row = {
      id,
      owner_user_id: ownerId,
      client_id: input.clientId,
      deal_id: input.dealId ?? null,
      purchase_id: input.purchaseId ?? null,
      client_name: input.clientName,
      description: input.description,
      value: input.value,
      due_date: dueDateValue,
      status: input.status,
      method: input.method,
      direction: input.direction ?? "ENTRADA",
      supplier_name: input.supplierName ?? "",
      attachment_url: input.attachmentUrl ?? null,
      attachment_name: input.attachmentName ?? null,
      recurrent: input.recurrent ?? false,
    };

    const { data, error: insertError } = await supabase.from("payments").insert(row).select().single();
    if (insertError) {
      throw new Error(`Erro ao salvar pagamento: ${insertError.message} (code: ${insertError.code})`);
    }
    return rowToPayment(data);
  }

  async update(id: string, input: Partial<Omit<Payment, "id">>): Promise<Payment> {
    const supabase = await createUniversalClient();
    const row: Record<string, unknown> = {};
    if (input.clientId !== undefined) row.client_id = input.clientId;
    if (input.clientName !== undefined) row.client_name = input.clientName;
    if (input.description !== undefined) row.description = input.description;
    if (input.value !== undefined) row.value = input.value;
    if (input.dueDate !== undefined) {
      row.due_date = input.dueDate.includes("T") ? input.dueDate : `${input.dueDate}T00:00:00.000Z`;
    }
    if (input.status !== undefined) row.status = input.status;
    if (input.method !== undefined) row.method = input.method;
    if (input.direction !== undefined) row.direction = input.direction;
    if (input.supplierName !== undefined) row.supplier_name = input.supplierName;
    if (input.attachmentUrl !== undefined) row.attachment_url = input.attachmentUrl ?? null;
    if (input.attachmentName !== undefined) row.attachment_name = input.attachmentName ?? null;
    if (input.recurrent !== undefined) row.recurrent = input.recurrent;

    const { data, error } = await supabase.from("payments").update(row).eq("id", id).select().single();
    if (error) throw new Error(`Erro ao atualizar pagamento: ${error.message} (code: ${error.code})`);
    return rowToPayment(data);
  }

  async delete(id: string): Promise<void> {
    const supabase = await createUniversalClient();
    const { data, error } = await supabase.from("payments").delete().eq("id", id).select("id");
    if (error) throw error;
    if (!data?.length) throw new Error("Registro não encontrado ou sem permissão para excluí-lo.");
  }
}

export const paymentRepository = new PaymentRepository();
