import { createUniversalClient } from "@/lib/supabase/universal";
import { getUserIdFromUser } from "@/lib/supabase/auth";
import { getClientIdsForCompany } from "@/lib/supabase/company-clients";
import type { Recebimento } from "@/types";

export type CreateRecebimentoInput = Omit<Recebimento, "id" | "createdAt">;

function rowToRecebimento(row: Record<string, unknown>): Recebimento {
  return {
    id: row.id as string,
    clientId: (row.client_id as string) ?? undefined,
    clientName: (row.client_name as string) ?? "",
    responsibleId: (row.responsible_id as string) ?? undefined,
    companyName: (row.company_name as string) ?? "",
    product: (row.product as string) ?? "",
    description: (row.description as string) ?? undefined,
    value: Number(row.value) || 0,
    entryEnabled: (row.entry_enabled as boolean) ?? false,
    entryType: (row.entry_type as Recebimento["entryType"]) ?? undefined,
    entryValue: (row.entry_value as number) ?? undefined,
    shippingEnabled: (row.shipping_enabled as boolean) ?? false,
    shippingValue: (row.shipping_value as number) ?? undefined,
    installments: (row.installments as number) ?? 1,
    installmentValue: (row.installment_value as number) ?? 0,
    finalValue: (row.final_value as number) ?? 0,
    status: row.status as Recebimento["status"],
    date: (row.date as string) ?? undefined,
    createdAt: row.created_at as string,
  };
}

export class RecebimentoRepository {
  async findAll(companyId?: string | null): Promise<Recebimento[]> {
    const supabase = await createUniversalClient();
    const [clientIds, userId] = await Promise.all([
      getClientIdsForCompany(companyId),
      getUserIdFromUser(),
    ]);

    let query = supabase.from("recebimentos").select("*");

    if (clientIds.length > 0 && userId) {
      query = query.or(`client_id.in.(${clientIds.join(",")}),owner_user_id.eq.${userId}`);
    } else if (userId) {
      query = query.eq("owner_user_id", userId);
    } else {
      return [];
    }

    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) throw error;
    if (!data) throw new Error("O Supabase não retornou dados para esta consulta.");
    return data.map(rowToRecebimento);
  }

  async create(input: CreateRecebimentoInput): Promise<Recebimento> {
    const supabase = await createUniversalClient();
    const ownerId = await getUserIdFromUser();
    if (!ownerId) throw new Error("Não foi possível identificar o usuário desta conta.");
    const id = `rec-${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;

    const row = {
      id,
      owner_user_id: ownerId,
      client_id: input.clientId ?? null,
      client_name: input.clientName,
      responsible_id: input.responsibleId ?? null,
      company_name: input.companyName,
      product: input.product,
      description: input.description ?? null,
      value: input.value,
      entry_enabled: input.entryEnabled,
      entry_type: input.entryType ?? null,
      entry_value: input.entryValue ?? null,
      shipping_enabled: input.shippingEnabled,
      shipping_value: input.shippingValue ?? null,
      installments: input.installments,
      installment_value: input.installmentValue,
      final_value: input.finalValue,
      status: input.status,
      date: input.date ?? null,
      created_at: new Date().toISOString(),
    };

    const { error: insertError } = await supabase.from("recebimentos").insert(row);
    if (insertError) throw insertError;

    return { id, createdAt: row.created_at, ...input };
  }

  async update(id: string, input: Partial<CreateRecebimentoInput>): Promise<Recebimento> {
    const supabase = await createUniversalClient();
    const row: Record<string, unknown> = {};
    if (input.clientId !== undefined) row.client_id = input.clientId ?? null;
    if (input.clientName !== undefined) row.client_name = input.clientName;
    if (input.responsibleId !== undefined) row.responsible_id = input.responsibleId ?? null;
    if (input.companyName !== undefined) row.company_name = input.companyName;
    if (input.product !== undefined) row.product = input.product;
    if (input.description !== undefined) row.description = input.description ?? null;
    if (input.value !== undefined) row.value = input.value;
    if (input.entryEnabled !== undefined) row.entry_enabled = input.entryEnabled;
    if (input.entryType !== undefined) row.entry_type = input.entryType ?? null;
    if (input.entryValue !== undefined) row.entry_value = input.entryValue ?? null;
    if (input.shippingEnabled !== undefined) row.shipping_enabled = input.shippingEnabled;
    if (input.shippingValue !== undefined) row.shipping_value = input.shippingValue ?? null;
    if (input.installments !== undefined) row.installments = input.installments;
    if (input.installmentValue !== undefined) row.installment_value = input.installmentValue;
    if (input.finalValue !== undefined) row.final_value = input.finalValue;
    if (input.status !== undefined) row.status = input.status;
    if (input.date !== undefined) row.date = input.date ?? null;

    const { data, error } = await supabase.from("recebimentos").update(row).eq("id", id).select().single();
    if (error) throw error;
    return rowToRecebimento(data);
  }

  async delete(id: string): Promise<void> {
    const supabase = await createUniversalClient();
    const { data, error } = await supabase.from("recebimentos").delete().eq("id", id).select("id");
    if (error) throw error;
    if (!data?.length) throw new Error("Registro não encontrado ou sem permissão para excluí-lo.");
  }
}

export const recebimentoRepository = new RecebimentoRepository();
