import { goalRepository } from "@/lib/repositories";
import type { Goal } from "@/types";

export type CreateGoalInput = Omit<Goal, "id" | "createdAt">;

/**
 * Service de metas — metas de clientes, faturamento e vendas por competência.
 */
export class GoalService {
  async getAll(): Promise<Goal[]> {
    return goalRepository.findAll();
  }

  async create(input: CreateGoalInput): Promise<Goal> {
    const goal: Omit<Goal, "id"> = {
      ...input,
      createdAt: new Date().toISOString(),
    };
    return goalRepository.create(goal);
  }
}

export const goalService = new GoalService();