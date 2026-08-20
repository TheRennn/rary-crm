import { mockDatabase } from "@/lib/db/mock-adapter";
import type { Deal, Purchase } from "@/types";

/**
 * Repository de vendas (deals) e compras de clientes.
 *
 * TODO: substituir por consultas reais ao banco (PostgreSQL/Supabase).
 */
export class DealRepository {
  async findAll(): Promise<Deal[]> {
    return mockDatabase.read("deals");
  }

  async findByClient(clientId: string): Promise<Deal[]> {
    const deals = await mockDatabase.read("deals");
    return deals.filter((deal) => deal.clientId === clientId);
  }

  async findPurchasesByClient(clientId: string): Promise<Purchase[]> {
    const purchases = await mockDatabase.read("purchases");
    return purchases.filter((purchase) => purchase.clientId === clientId);
  }
}

export const dealRepository = new DealRepository();