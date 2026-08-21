import { commissionRepository } from "@/lib/repositories";
import type { Commission, CommissionInstallment, CommissionPaymentMethod } from "@/types";

export interface CommissionStats {
  received: number;
  pending: number;
  overdue: number;
  totalForecast: number;
  receivedCount: number;
  pendingCount: number;
  overdueCount: number;
}

export type CreateCommissionInput = Omit<
  Commission,
  "id" | "value" | "dueDate" | "method" | "installments"
> & {
  dueDate?: string;
  method?: CommissionPaymentMethod;
  installmentsCount?: number;
};

function buildInstallments(
  value: number,
  count: number,
  startDate: string
): CommissionInstallment[] {
  const each = Math.round((value / count) * 100) / 100;
  return Array.from({ length: count }, (_, index) => {
    const due = new Date(startDate);
    due.setMonth(due.getMonth() + index);
    return {
      number: index + 1,
      dueDate: due.toISOString().slice(0, 10),
      value: index === count - 1 ? Math.round((value - each * (count - 1)) * 100) / 100 : each,
      status: "PENDENTE",
    };
  });
}

/**
 * Service de comissões — regras de negócio e métricas para o perfil Representante.
 *
 * Representantes recebem conforme a liquidação dos títulos, independentemente
 * da empresa representada.
 */
export class CommissionService {
  async getAll(): Promise<Commission[]> {
    return commissionRepository.findAll();
  }

  async create(input: CreateCommissionInput): Promise<Commission> {
    const rate = Number(input.rate);
    const baseValue = Number(input.baseValue);
    const value = Math.round((baseValue * rate) / 100);
    const method = input.method ?? "A_VISTA";
    const dueDate = input.dueDate ?? new Date().toISOString().slice(0, 10);
    const paymentMethod = method;
    const installmentsCount = method === "A_VISTA" ? 1 : Math.max(1, Math.floor(input.installmentsCount ?? 1));

    const commission: Omit<Commission, "id"> = {
      ...input,
      rate,
      baseValue,
      value,
      status: input.status ?? "PENDENTE",
      dueDate,
      method: paymentMethod,
      installments: installmentsCount > 1 ? buildInstallments(value, installmentsCount, dueDate) : undefined,
    };
    return commissionRepository.create(commission);
  }

  async getStats(): Promise<CommissionStats> {
    const commissions = await this.getAll();
    const received = commissions.filter((c) => c.status === "PAGO");
    const pending = commissions.filter((c) => c.status === "PENDENTE");
    const overdue = commissions.filter((c) => c.status === "ATRASADO");

    const sum = (list: Commission[]) => list.reduce((acc, c) => acc + c.value, 0);

    return {
      received: sum(received),
      pending: sum(pending),
      overdue: sum(overdue),
      totalForecast: sum(pending) + sum(overdue),
      receivedCount: received.length,
      pendingCount: pending.length,
      overdueCount: overdue.length,
    };
  }
}

export const commissionService = new CommissionService();