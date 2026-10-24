import { createUniversalClient } from "@/lib/supabase/universal";
import { getCompanyIdFromUser } from "@/lib/supabase/auth";

/**
 * Retorna todos os IDs de clientes que pertencem à empresa do usuário logado.
 * Usado nos repositories que filtram via join com a tabela clients.
 */
export async function getClientIdsForCompany(
  companyId?: string | null
): Promise<string[]> {
  const supabase = await createUniversalClient();
  const cid = companyId ?? (await getCompanyIdFromUser());

  if (!cid) return [];

  const { data, error } = await supabase
    .from("clients")
    .select("id")
    .eq("company_id", cid);

  if (error) throw error;
  if (!data) throw new Error("Não foi possível carregar os clientes da empresa.");
  return data.map((row: { id: string }) => row.id);
}
