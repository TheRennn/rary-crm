import { mockDatabase } from "@/lib/db/mock-adapter";
import type { Order } from "@/types";

/**
 * Repository de pedidos (representantes e empresas).
 *
 * TODO: substituir por consultas reais ao banco (PostgreSQL/Supabase).
 */
export class OrderRepository {
  async findAll(): Promise<Order[]> {
    return mockDatabase.read("orders");
  }

  async create(input: Omit<Order, "id">): Promise<Order> {
    const order: Order = {
      ...input,
      id: `ord-${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`,
    };
    await mockDatabase.insert("orders", order);
    return order;
  }
}

export const orderRepository = new OrderRepository();