import { createUniversalClient } from "@/lib/supabase/universal";
import { getUserIdFromUser } from "@/lib/supabase/auth";
import type { Product } from "@/types";

export type CreateProductInput = Omit<Product, "id" | "createdAt">;

function rowToProduct(row: Record<string, unknown>): Product {
  return {
    id: row.id as string,
    code: (row.code as string) ?? "",
    name: (row.name as string) ?? "",
    description: (row.description as string) ?? undefined,
    category: (row.category as Product["category"]) ?? "OUTRO",
    unit: (row.unit as Product["unit"]) ?? "UN",
    unitValue: Number(row.unit_value) || 0,
    costValue: Number(row.cost_value) || 0,
    discount: Number(row.discount) || 0,
    minStock: Number(row.min_stock) || 0,
    currentStock: Number(row.current_stock) || 0,
    companyId: (row.company_id as string) ?? undefined,
    companyName: (row.company_name as string) ?? undefined,
    active: row.active as boolean,
    createdAt: row.created_at as string,
  };
}

export class ProductRepository {
  async findAll(userId?: string | null): Promise<Product[]> {
    const supabase = await createUniversalClient();
    const uid = userId ?? await getUserIdFromUser();
    if (!uid) return [];

    const query = supabase.from("products").select("*").eq("user_id", uid);
    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) throw error;
    if (!data) throw new Error("O Supabase não retornou dados para esta consulta.");
    return data.map(rowToProduct);
  }

  async findAllCodes(userId?: string | null): Promise<string[]> {
    const supabase = await createUniversalClient();
    const uid = userId ?? await getUserIdFromUser();
    if (!uid) return [];

    const query = supabase.from("products").select("code").eq("user_id", uid);
    const { data, error } = await query;

    if (error) throw error;
    if (!data) throw new Error("O Supabase não retornou dados para esta consulta.");
    return data.map((row: Record<string, unknown>) => row.code as string);
  }

  async findById(id: string): Promise<Product | null> {
    const supabase = await createUniversalClient();
    const { data, error } = await supabase.from("products").select("*").eq("id", id).single();
    if (error || !data) return null;
    return rowToProduct(data);
  }

  async create(input: CreateProductInput, userId?: string | null): Promise<Product> {
    const supabase = await createUniversalClient();
    const uid = userId ?? await getUserIdFromUser();
    if (!uid) throw new Error("Não foi possível identificar o usuário desta conta.");
    const id = `prd-${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;

    const row = {
      id,
      user_id: uid,
      code: input.code,
      name: input.name,
      description: input.description ?? null,
      category: input.category,
      unit: input.unit,
      unit_value: input.unitValue,
      cost_value: input.costValue ?? 0,
      discount: input.discount ?? 0,
      min_stock: input.minStock ?? 0,
      current_stock: input.currentStock ?? 0,
      company_id: input.companyId ?? null,
      company_name: input.companyName ?? null,
      active: input.active,
    };

    const { error: insertError } = await supabase.from("products").insert(row);
    if (insertError) throw insertError;

    return {
      id,
      ...input,
      createdAt: new Date().toISOString(),
    };
  }

  async update(id: string, input: Partial<CreateProductInput>): Promise<Product> {
    const supabase = await createUniversalClient();
    const row: Record<string, unknown> = {};
    if (input.code !== undefined) row.code = input.code;
    if (input.name !== undefined) row.name = input.name;
    if (input.description !== undefined) row.description = input.description ?? null;
    if (input.category !== undefined) row.category = input.category;
    if (input.unit !== undefined) row.unit = input.unit;
    if (input.unitValue !== undefined) row.unit_value = input.unitValue;
    if (input.costValue !== undefined) row.cost_value = input.costValue;
    if (input.discount !== undefined) row.discount = input.discount;
    if (input.minStock !== undefined) row.min_stock = input.minStock;
    if (input.currentStock !== undefined) row.current_stock = input.currentStock;
    if (input.companyId !== undefined) row.company_id = input.companyId ?? null;
    if (input.companyName !== undefined) row.company_name = input.companyName ?? null;
    if (input.active !== undefined) row.active = input.active;

    const { data, error } = await supabase.from("products").update(row).eq("id", id).select().single();
    if (error) throw error;
    return rowToProduct(data);
  }

  async delete(id: string): Promise<void> {
    const supabase = await createUniversalClient();
    const { data, error } = await supabase.from("products").delete().eq("id", id).select("id");
    if (error) throw error;
    if (!data?.length) throw new Error("Registro não encontrado ou sem permissão para excluí-lo.");
  }
}

export const productRepository = new ProductRepository();
