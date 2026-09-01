import { createUniversalClient } from "@/lib/supabase/universal";

type AuthUser = { id: string; email?: string; user_metadata?: Record<string, unknown> };

/**
 * Obtém o company_id do usuário logado.
 * Usado em todos os repositories para isolar dados por empresa.
 */
export async function getCompanyIdFromUser(
  authUser?: AuthUser | null
): Promise<string | null> {
  const supabase = await createUniversalClient();

  const user = authUser ?? (await supabase.auth.getUser()).data.user;
  if (!user) return null;

  const { data } = await supabase
    .from("users")
    .select("company_id")
    .eq("auth_id", user.id)
    .single();

  return data?.company_id ?? null;
}

/**
 * Obtém o user_id interno (tabela users) do usuário logado.
 */
export async function getUserIdFromUser(
  authUser?: AuthUser | null
): Promise<string | null> {
  const supabase = await createUniversalClient();

  const user = authUser ?? (await supabase.auth.getUser()).data.user;
  if (!user) return null;

  const { data } = await supabase
    .from("users")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  return data?.id ?? null;
}
