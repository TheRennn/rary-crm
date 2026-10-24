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

  const { data: { user: sessionUser }, error: authError } = authUser
    ? { data: { user: authUser }, error: null }
    : await supabase.auth.getUser();
  if (authError) throw authError;
  const user = sessionUser;
  if (!user) return null;

  const { data, error } = await supabase
    .from("users")
    .select("company_id")
    .eq("auth_id", user.id)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  if (!data?.company_id) throw new Error("A conta autenticada não possui uma empresa vinculada.");
  return data.company_id;
}

/**
 * Obtém o user_id interno (tabela users) do usuário logado.
 */
export async function getUserIdFromUser(
  authUser?: AuthUser | null
): Promise<string | null> {
  const supabase = await createUniversalClient();

  const { data: { user: sessionUser }, error: authError } = authUser
    ? { data: { user: authUser }, error: null }
    : await supabase.auth.getUser();
  if (authError) throw authError;
  const user = sessionUser;
  if (!user) return null;

  const { data, error } = await supabase
    .from("users")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  if (!data?.id) throw new Error("A conta autenticada não possui um usuário CRM vinculado.");
  return data.id;
}
