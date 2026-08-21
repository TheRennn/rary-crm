import { mockDatabase } from "@/lib/db/mock-adapter";
import type { Goal } from "@/types";

/**
 * Repository de metas (clientes, faturamento e vendas).
 *
 * TODO: substituir por consultas reais ao banco (PostgreSQL/Supabase).
 */
export class GoalRepository {
  async findAll(): Promise<Goal[]> {
    return mockDatabase.read("goals");
  }

  async create(input: Omit<Goal, "id">): Promise<Goal> {
    const goal: Goal = {
      ...input,
      id: `goal-${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`,
    };
    await mockDatabase.insert("goals", goal);
    return goal;
  }
}

export const goalRepository = new GoalRepository();