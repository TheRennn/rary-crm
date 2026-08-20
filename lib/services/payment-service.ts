import { paymentRepository } from "@/lib/repositories";
import type { Payment } from "@/types";

export interface PaymentStats {
  received: number;
  pending: number;
  overdue: number;
  totalForecast: number;
  receivedCount: number;
  pendingCount: number;
  overdueCount: number;
}

/**
 * Service de pagamentos — regras de negócio e métricas.
 */
export class PaymentService {
  async getAll(): Promise<Payment[]> {
    return paymentRepository.findAll();
  }

  async getByClient(clientId: string): Promise<Payment[]> {
    return paymentRepository.findByClient(clientId);
  }

  async getStats(): Promise<PaymentStats> {
    const payments = await this.getAll();
    const received = payments.filter((p) => p.status === "PAGO");
    const pending = payments.filter((p) => p.status === "PENDENTE");
    const overdue = payments.filter((p) => p.status === "ATRASADO");

    const sum = (list: Payment[]) => list.reduce((acc, p) => acc + p.value, 0);

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

export const paymentService = new PaymentService();