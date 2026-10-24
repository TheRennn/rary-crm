import { createUniversalClient } from "@/lib/supabase/universal";
import { getUserIdFromUser } from "@/lib/supabase/auth";
import { getClientIdsForCompany } from "@/lib/supabase/company-clients";
import type { Order } from "@/types";

function rowToOrder(row: Record<string, unknown>): Order {
  return {
    id: row.id as string,
    code: row.code as string,
    clientId: (row.client_id as string) ?? undefined,
    clientName: (row.client_name as string) ?? "",
    companyName: (row.company_name as string) ?? "",
    period: (row.period as string) ?? "",
    date: row.date as string,
    source: row.source as Order["source"],
    type: row.type as Order["type"],
    items: (row.items as Order["items"]) ?? [],
    total: Number(row.total) || 0,
    status: row.status as Order["status"],
    entryValue: (row.entry_value as number) ?? undefined,
    entryType: (row.entry_type as Order["entryType"]) ?? undefined,
    shippingValue: (row.shipping_value as number) ?? undefined,
  };
}

export class OrderRepository {
  async findAll(companyId?: string | null): Promise<Order[]> {
    const supabase = await createUniversalClient();
    const [clientIds, ownerId] = await Promise.all([
      getClientIdsForCompany(companyId),
      getUserIdFromUser(),
    ]);
    if (!ownerId) return [];

    let query = supabase.from("orders").select("*");
    query = clientIds.length
      ? query.or(`client_id.in.(${clientIds.join(",")}),owner_user_id.eq.${ownerId}`)
      : query.eq("owner_user_id", ownerId);
    const { data, error } = await query.order("date", { ascending: false });

    if (error) throw error;
    if (!data) throw new Error("O Supabase não retornou dados para esta consulta.");
    return data.map(rowToOrder);
  }

  async create(input: Omit<Order, "id">): Promise<Order> {
    const supabase = await createUniversalClient();
    const ownerId = await getUserIdFromUser();
    if (!ownerId) throw new Error("Não foi possível identificar o usuário desta conta.");
    const id = `ord-${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;

    const row = {
      id,
      owner_user_id: ownerId,
      code: input.code,
      client_id: input.clientId ?? null,
      client_name: input.clientName,
      company_name: input.companyName,
      period: input.period,
      date: input.date,
      source: input.source,
      type: input.type,
      items: input.items,
      total: input.total,
      status: input.status,
      entry_value: input.entryValue ?? null,
      entry_type: input.entryType ?? null,
      shipping_value: input.shippingValue ?? null,
    };

    const { error: insertError } = await supabase.from("orders").insert(row);
    if (insertError) throw insertError;

    return { id, ...input };
  }

  async update(id: string, input: Partial<Omit<Order, "id">>): Promise<Order> {
    const supabase = await createUniversalClient();
    const row: Record<string, unknown> = {};
    if (input.clientId !== undefined) row.client_id = input.clientId ?? null;
    if (input.clientName !== undefined) row.client_name = input.clientName;
    if (input.companyName !== undefined) row.company_name = input.companyName;
    if (input.period !== undefined) row.period = input.period;
    if (input.date !== undefined) row.date = input.date;
    if (input.source !== undefined) row.source = input.source;
    if (input.type !== undefined) row.type = input.type;
    if (input.items !== undefined) row.items = input.items;
    if (input.total !== undefined) row.total = input.total;
    if (input.status !== undefined) row.status = input.status;
    if (input.entryValue !== undefined) row.entry_value = input.entryValue ?? null;
    if (input.entryType !== undefined) row.entry_type = input.entryType ?? null;
    if (input.shippingValue !== undefined) row.shipping_value = input.shippingValue ?? null;

    const { data, error } = await supabase.from("orders").update(row).eq("id", id).select().single();
    if (error) throw error;
    return rowToOrder(data);
  }

  async delete(id: string): Promise<void> {
    const supabase = await createUniversalClient();
    const { data, error } = await supabase.from("orders").delete().eq("id", id).select("id");
    if (error) throw error;
    if (!data?.length) throw new Error("Registro não encontrado ou sem permissão para excluí-lo.");
  }
}

export const orderRepository = new OrderRepository();
