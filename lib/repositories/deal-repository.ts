import { createUniversalClient } from "@/lib/supabase/universal";
import { getClientIdsForCompany } from "@/lib/supabase/company-clients";
import type { Deal, Purchase } from "@/types";

export interface CreateDealInput {
  clientId: string;
  product: string;
  description?: string;
  value: number;
  status: Deal["status"];
  paymentStatus: Deal["paymentStatus"];
  responsibleId: string;
  deliveryDeadline?: string;
}

function rowToDeal(row: Record<string, unknown>): Deal {
  return {
    id: row.id as string,
    code: row.code as string,
    clientId: (row.client_id as string) ?? "",
    product: row.product as string,
    description: (row.description as string) ?? undefined,
    value: Number(row.value) || 0,
    createdAt: row.created_at as string,
    status: row.status as Deal["status"],
    paymentStatus: row.payment_status as Deal["paymentStatus"],
    responsibleId: (row.responsible_id as string) ?? "",
    deliveryDeadline: (row.delivery_deadline as string) ?? undefined,
  };
}

function rowToPurchase(row: Record<string, unknown>): Purchase {
  return {
    id: row.id as string,
    clientId: (row.client_id as string) ?? "",
    product: row.product as string,
    date: row.date as string,
    quantity: (row.quantity as number) ?? 1,
    value: Number(row.value) || 0,
    status: row.status as Purchase["status"],
    paymentStatus: row.payment_status as Purchase["paymentStatus"],
  };
}

export class DealRepository {
  async findAll(companyId?: string | null): Promise<Deal[]> {
    const supabase = await createUniversalClient();
    const clientIds = await getClientIdsForCompany(companyId);

    if (clientIds.length === 0) return [];

    const { data, error } = await supabase
      .from("deals")
      .select("*")
      .in("client_id", clientIds)
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data.map(rowToDeal);
  }

  async findByClient(clientId: string): Promise<Deal[]> {
    const supabase = await createUniversalClient();
    const { data, error } = await supabase
      .from("deals")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data.map(rowToDeal);
  }

  async findPurchasesByClient(clientId: string): Promise<Purchase[]> {
    const supabase = await createUniversalClient();
    const { data, error } = await supabase
      .from("purchases")
      .select("*")
      .eq("client_id", clientId)
      .order("date", { ascending: false });

    if (error || !data) return [];
    return data.map(rowToPurchase);
  }

  async create(input: CreateDealInput): Promise<Deal> {
    const supabase = await createUniversalClient();
    const id = `deal-${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;

    const { data: existing } = await supabase
      .from("deals")
      .select("code")
      .order("code", { ascending: false })
      .limit(1);

    let nextCode = "VND-0001";
    if (existing && existing.length > 0) {
      const last = existing[0].code as string;
      const num = parseInt(last.replace("VND-", ""), 10) + 1;
      nextCode = `VND-${String(num).padStart(4, "0")}`;
    }

    const row = {
      id,
      code: nextCode,
      client_id: input.clientId,
      product: input.product,
      description: input.description ?? null,
      value: input.value,
      status: input.status,
      payment_status: input.paymentStatus,
      responsible_id: input.responsibleId,
      delivery_deadline: input.deliveryDeadline ?? null,
      created_at: new Date().toISOString(),
    };

    const { error: insertError } = await supabase.from("deals").insert(row);
    if (insertError) throw insertError;

    return {
      id,
      code: nextCode,
      clientId: input.clientId,
      product: input.product,
      description: input.description,
      value: input.value,
      createdAt: row.created_at,
      status: input.status,
      paymentStatus: input.paymentStatus,
      responsibleId: input.responsibleId,
      deliveryDeadline: input.deliveryDeadline,
    };
  }

  async update(id: string, input: Partial<CreateDealInput>): Promise<Deal> {
    const supabase = await createUniversalClient();
    const row: Record<string, unknown> = {};
    if (input.clientId !== undefined) row.client_id = input.clientId;
    if (input.product !== undefined) row.product = input.product;
    if (input.description !== undefined) row.description = input.description ?? null;
    if (input.value !== undefined) row.value = input.value;
    if (input.status !== undefined) row.status = input.status;
    if (input.paymentStatus !== undefined) row.payment_status = input.paymentStatus;
    if (input.responsibleId !== undefined) row.responsible_id = input.responsibleId;
    if (input.deliveryDeadline !== undefined) row.delivery_deadline = input.deliveryDeadline ?? null;

    const { data, error } = await supabase.from("deals").update(row).eq("id", id).select().single();
    if (error) throw error;
    return rowToDeal(data);
  }

  async delete(id: string): Promise<void> {
    const supabase = await createUniversalClient();
    const { error } = await supabase.from("deals").delete().eq("id", id);
    if (error) throw error;
  }
}

export const dealRepository = new DealRepository();
