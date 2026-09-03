import { followUpRepository } from "@/lib/repositories";
import type { FollowUp } from "@/types";
import type { CreateFollowUpInput } from "@/lib/repositories/follow-up-repository";

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

  async create(input: CreateFollowUpInput): Promise<FollowUp> {
    return followUpRepository.create(input);
  }

  async update(id: string, input: Partial<CreateFollowUpInput>): Promise<FollowUp> {
    return followUpRepository.update(id, input);
  }

  async delete(id: string): Promise<void> {
    return followUpRepository.delete(id);
  }

  async getGroups(): Promise<FollowUpGroups> {
    const all = await this.getAll();
    const todayStr = new Date().toISOString().slice(0, 10);

    function computeGroup(f: FollowUp): keyof FollowUpGroups {
      if (f.status === "CONCLUIDO") return "concluidos";
      const dateStr = f.date.slice(0, 10);
      if (dateStr === todayStr) return "hoje";
      if (dateStr < todayStr) return "atrasados";
      return "proximos";
    }

    const groups: FollowUpGroups = { hoje: [], atrasados: [], proximos: [], concluidos: [] };
    for (const f of all) {
      groups[computeGroup(f)].push(f);
    }
    return groups;
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