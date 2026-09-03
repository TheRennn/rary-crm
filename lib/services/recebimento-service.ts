import { recebimentoRepository } from "@/lib/repositories";
import type { Recebimento } from "@/types";
import type { CreateRecebimentoInput } from "@/lib/repositories/recebimento-repository";

export type { CreateRecebimentoInput };

export interface RecebimentoStats {
  total: number;
  totalCount: number;
  pendingValue: number;
  pendingCount: number;
  paidValue: number;
  paidCount: number;
  overdueValue: number;
  overdueCount: number;
}

export class RecebimentoService {
  async getAll(): Promise<Recebimento[]> {
    return recebimentoRepository.findAll();
  }

  async create(input: CreateRecebimentoInput): Promise<Recebimento> {
    return recebimentoRepository.create(input);
  }

  async update(id: string, input: Partial<CreateRecebimentoInput>): Promise<Recebimento> {
    return recebimentoRepository.update(id, input);
  }

  async delete(id: string): Promise<void> {
    return recebimentoRepository.delete(id);
  }

  async getStats(): Promise<RecebimentoStats> {
    const all = await this.getAll();
    const pending = all.filter((r) => r.status === "PENDENTE");
    const paid = all.filter((r) => r.status === "PAGO");
    const overdue = all.filter((r) => r.status === "ATRASADO");

    return {
      total: all.reduce((sum, r) => sum + r.finalValue, 0),
      totalCount: all.length,
      pendingValue: pending.reduce((sum, r) => sum + r.finalValue, 0),
      pendingCount: pending.length,
      paidValue: paid.reduce((sum, r) => sum + r.finalValue, 0),
      paidCount: paid.length,
      overdueValue: overdue.reduce((sum, r) => sum + r.finalValue, 0),
      overdueCount: overdue.length,
    };
  }
}

export const recebimentoService = new RecebimentoService();
