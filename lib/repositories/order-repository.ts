import { createUniversalClient } from "@/lib/supabase/universal";
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
  };
}

export class OrderRepository {
  async findAll(): Promise<Order[]> {
    const supabase = await createUniversalClient();
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("date", { ascending: false });

    if (error || !data) return [];
    return data.map(rowToOrder);
  }

  async create(input: Omit<Order, "id">): Promise<Order> {
    const supabase = await createUniversalClient();
    const id = `ord-${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;

    const row = {
      id,
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

    const { data, error } = await supabase.from("orders").update(row).eq("id", id).select().single();
    if (error) throw error;
    return rowToOrder(data);
  }
}

export const orderRepository = new OrderRepository();
