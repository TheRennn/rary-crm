import { createUniversalClient } from "@/lib/supabase/universal";
import { getUserIdFromUser } from "@/lib/supabase/auth";
import type { Activity, User } from "@/types";
import type { SupabaseClient } from "@supabase/supabase-js";

type AuthUser = { id: string; email?: string; user_metadata?: Record<string, unknown> };

export class UserRepository {
  async findCurrent(authUser?: AuthUser | null, serverClient?: SupabaseClient): Promise<User | null> {
    if (!authUser?.id) return null;

    const supabase = serverClient ?? await createUniversalClient();

    const { data: existing, error: lookupError } = await supabase
      .from("users")
      .select("*")
      .eq("auth_id", authUser.id)
      .single();

    if (lookupError && lookupError.code !== "PGRST116") throw lookupError;
    if (existing) {
      return {
        id: existing.id,
        name: existing.name,
        email: existing.email,
        role: existing.role,
        companyId: existing.company_id ?? "",
        phone: existing.phone ?? "",
        emailVerified: existing.email_verified ?? false,
      };
    }

    const meta = authUser.user_metadata ?? {};
    const name = (meta.name as string) ?? authUser.email?.split("@")[0] ?? "Usuário";
    const company = (meta.company as string) ?? "";
    const segment = (meta.segment as string) ?? "Tecnologia";

    const companyId = `comp-${Date.now().toString(36)}`;

    const { error: companyError } = await supabase.from("companies").insert({
      id: companyId,
      name: company || "Minha Empresa",
      cnpj: "",
      segment,
      city: "",
      state: "",
    });
    if (companyError) throw companyError;

    const userId = `usr-${authUser.id.slice(0, 8)}`;

    const { error: userError } = await supabase.from("users").insert({
      id: userId,
      auth_id: authUser.id,
      name,
      email: authUser.email ?? "",
      role: "ADMIN",
      company_id: companyId,
      phone: "",
    });
    if (userError) {
      await supabase.from("companies").delete().eq("id", companyId);
      throw userError;
    }

    return {
      id: userId,
      name,
      email: authUser.email ?? "",
      role: "ADMIN",
      companyId,
      phone: "",
      emailVerified: false,
    };
  }

  async findActivities(userId?: string | null): Promise<Activity[]> {
    const supabase = await createUniversalClient();
    const uid = userId ?? await getUserIdFromUser();
    if (!uid) return [];

    const query = supabase.from("activities").select("*").eq("user_id", uid);
    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) throw error;
    if (!data) throw new Error("O Supabase não retornou dados para esta consulta.");

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
