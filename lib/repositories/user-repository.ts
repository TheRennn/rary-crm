import { createUniversalClient } from "@/lib/supabase/universal";
import type { Activity, User } from "@/types";
import type { SupabaseClient } from "@supabase/supabase-js";

type AuthUser = { id: string; email?: string; user_metadata?: Record<string, unknown> };

export class UserRepository {
  async findCurrent(authUser?: AuthUser | null, serverClient?: SupabaseClient): Promise<User | null> {
    if (!authUser?.id) return null;

    const supabase = serverClient ?? await createUniversalClient();

    const { data: existing } = await supabase
      .from("users")
      .select("*")
      .eq("auth_id", authUser.id)
      .single();

    if (existing) {
      return {
        id: existing.id,
        name: existing.name,
        email: existing.email,
        role: existing.role,
        companyId: existing.company_id ?? "",
        phone: existing.phone ?? "",
      };
    }

    const meta = authUser.user_metadata ?? {};
    const name = (meta.name as string) ?? authUser.email?.split("@")[0] ?? "Usuário";
    const company = (meta.company as string) ?? "";
    const segment = (meta.segment as string) ?? "Tecnologia";

    const companyId = `comp-${Date.now().toString(36)}`;

    await supabase.from("companies").insert({
      id: companyId,
      name: company || "Minha Empresa",
      cnpj: "",
      segment,
      city: "",
      state: "",
    });

    const userId = `usr-${authUser.id.slice(0, 8)}`;

    await supabase.from("users").insert({
      id: userId,
      auth_id: authUser.id,
      name,
      email: authUser.email ?? "",
      role: "ADMIN",
      company_id: companyId,
      phone: "",
    });

    return {
      id: userId,
      name,
      email: authUser.email ?? "",
      role: "ADMIN",
      companyId,
      phone: "",
    };
  }

  async findActivities(): Promise<Activity[]> {
    const supabase = await createUniversalClient();
    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) return [];

    return data.map((row: Record<string, unknown>) => ({
      id: row.id as string,
      type: row.type as string,
      title: row.title as string,
      detail: row.detail as string,
      createdAt: row.created_at as string,
      actor: row.actor as string,
    }));
  }
}

export const userRepository = new UserRepository();
