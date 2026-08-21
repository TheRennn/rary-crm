import { mockDatabase } from "@/lib/db/mock-adapter";
import type { Commission } from "@/types";

export type CreateCommissionInput = Omit<Commission, "id">;

/**
 * Repository de comissões (representantes).
 *
 * TODO: substituir por consultas reais ao banco (PostgreSQL/Supabase).
 */
export class CommissionRepository {
  async findAll(): Promise<Commission[]> {
    return mockDatabase.read("commissions");
  }

  async create(input: CreateCommissionInput): Promise<Commission> {
    const commission: Commission = {
      ...input,
      id: `com-${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`,
    };
    await mockDatabase.insert("commissions", commission);
    return commission;
  }
}

export const commissionRepository = new CommissionRepository();