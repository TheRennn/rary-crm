import { dealRepository } from "@/lib/repositories";
import { paymentRepository } from "@/lib/repositories";
import type { Deal, Purchase } from "@/types";
import type { CreateDealInput } from "@/lib/repositories/deal-repository";

export type { CreateDealInput };

export interface DealStats {
  total: number;
  concludedCount: number;
  totalValue: number;
  averageTicket: number;
  concludedValue: number;
  pendingValue: number;
  canceledValue: number;
  byStatus: Record<string, number>;
  byMonth: Record<string, number>;
}

function monthKey(iso: string): string {
  const date = new Date(iso);
  return `${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
}

/**
 * Service de vendas — regras de negócio e métricas.
 */
export class DealService {
  async getAll(): Promise<Deal[]> {
    return dealRepository.findAll();
  }

  async getByClient(clientId: string): Promise<Deal[]> {
    return dealRepository.findByClient(clientId);
  }

  async getPurchasesByClient(clientId: string): Promise<Purchase[]> {
    return dealRepository.findPurchasesByClient(clientId);
  }

  async create(input: CreateDealInput): Promise<Deal> {
    return dealRepository.create(input);
  }

  async update(id: string, input: Partial<CreateDealInput>): Promise<Deal> {
    const deal = await dealRepository.update(id, input);

    if (input.status === "APROVADA") {
      const existingPayments = await paymentRepository.findByDeal(id);
      if (existingPayments.length === 0) {
        const client = await dealRepository.findClientById(deal.clientId);
        await paymentRepository.create({
          clientId: deal.clientId,
          dealId: deal.id,
          clientName: client?.name ?? "",
          description: `Recebimento: ${deal.product}`,
          value: deal.value,
          dueDate: new Date().toISOString(),
          status: "PENDENTE",
          method: deal.paymentMethod ?? "",
          direction: "ENTRADA",
        });
      }
    }

    return deal;
  }

  async delete(id: string): Promise<void> {
    return dealRepository.delete(id);
  }

  async getStats(): Promise<DealStats> {
    const deals = await this.getAll();
    const active = deals.filter((d) => d.status !== "CANCELADA");
    const concluded = deals.filter((d) => d.status === "CONCLUIDA" || d.paymentStatus === "PAGO");
    const pending = deals.filter((d) =>
      ["ORCAMENTO", "NEGOCIACAO", "APROVADA"].includes(d.status)
    );

    const totalValue = active.reduce((sum, d) => sum + d.value, 0);
    const concludedValue = concluded.reduce((sum, d) => sum + d.value, 0);
    const pendingValue = pending.reduce((sum, d) => sum + d.value, 0);

    const byStatus: Record<string, number> = {};
    for (const d of deals) {
      byStatus[d.status] = (byStatus[d.status] ?? 0) + d.value;
    }

    const byMonth: Record<string, number> = {};
    for (const d of concluded) {
      const key = monthKey(d.createdAt);
      byMonth[key] = (byMonth[key] ?? 0) + d.value;
    }

    return {
      total: deals.length,
      concludedCount: concluded.length,
      totalValue,
      averageTicket: totalValue / Math.max(active.length, 1),
      concludedValue,
      pendingValue,
      canceledValue: deals
        .filter((d) => d.status === "CANCELADA")
        .reduce((sum, d) => sum + d.value, 0),
      byStatus,
      byMonth,
    };
  }
}

export const dealService = new DealService();