import { mockDatabase } from "@/lib/db/mock-adapter";
import type { Payment } from "@/types";

/**
 * Repository de pagamentos.
 *
 * TODO: substituir por consultas reais ao banco (PostgreSQL/Supabase).
 */
export class PaymentRepository {
  async findAll(): Promise<Payment[]> {
    return mockDatabase.read("payments");
  }

  async findByClient(clientId: string): Promise<Payment[]> {
    const payments = await mockDatabase.read("payments");
    return payments.filter((payment) => payment.clientId === clientId);
  }
}

export const paymentRepository = new PaymentRepository();