import { followUpRepository } from "@/lib/repositories";
import type { FollowUp } from "@/types";

export interface FollowUpGroups {
  hoje: FollowUp[];
  atrasados: FollowUp[];
  proximos: FollowUp[];
  concluidos: FollowUp[];
}

/**
 * Service de follow-ups — agrupamento da rotina comercial.
 */
export class FollowUpService {
  async getAll(): Promise<FollowUp[]> {
    return followUpRepository.findAll();
  }

  async getGroups(): Promise<FollowUpGroups> {
    const all = await this.getAll();
    return {
      hoje: all.filter((f) => f.status === "HOJE"),
      atrasados: all.filter((f) => f.status === "ATRASADO"),
      proximos: all.filter((f) => f.status === "PROXIMO"),
      concluidos: all.filter((f) => f.status === "CONCLUIDO"),
    };
  }

  async getTodayCount(): Promise<number> {
    const { hoje } = await this.getGroups();
    return hoje.length;
  }

  async getOverdueCount(): Promise<number> {
    const { atrasados } = await this.getGroups();
    return atrasados.length;
  }
}

export const followUpService = new FollowUpService();