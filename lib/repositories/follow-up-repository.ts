import { mockDatabase } from "@/lib/db/mock-adapter";
import type { FollowUp } from "@/types";

/**
 * Repository de follow-ups.
 *
 * TODO: substituir por consultas reais ao banco (PostgreSQL/Supabase).
 */
export class FollowUpRepository {
  async findAll(): Promise<FollowUp[]> {
    return mockDatabase.read("followUps");
  }
}

export const followUpRepository = new FollowUpRepository();