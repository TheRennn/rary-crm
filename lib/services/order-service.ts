import { orderRepository } from "@/lib/repositories";
import type { Order, OrderItem, OrderSource, OrderType } from "@/types";

export interface OrderStats {
  total: number;
  open: number;
  settled: number;
  totalCount: number;
}

export type CreateOrderInput = Omit<Order, "id" | "total" | "code" | "items"> & {
  items: Omit<OrderItem, "id">[];
  code?: string;
  source?: OrderSource;
  type?: OrderType;
};

let itemCounter = 0;

let orderCounter = 0;

function nextOrderCode(existing: Order[]): string {
  const max = existing.reduce((acc, order) => {
    const match = order.code?.match(/(\d+)$/);
    return match ? Math.max(acc, parseInt(match[1], 10)) : acc;
  }, 0);
  const next = Math.max(max + 1, ++orderCounter);
  return `PED-${String(next).padStart(4, "0")}`;
}

/**
 * Service de pedidos — regras de negócio para o perfil Representante/Empresa.
 */
export class OrderService {
  async getAll(): Promise<Order[]> {
    return orderRepository.findAll();
  }

  async create(input: CreateOrderInput): Promise<Order> {
    const existing = await this.getAll();
    const items: OrderItem[] = input.items.map((item, index) => ({
      ...item,
      id: `oi-${Date.now().toString(36)}-${itemCounter++}-${index}`,
      quantity: Math.max(1, Number(item.quantity) || 0),
      unitValue: Math.max(0, Number(item.unitValue) || 0),
    }));
    const total = items.reduce((acc, item) => acc + item.quantity * item.unitValue, 0);
    const order: Omit<Order, "id"> = {
      ...input,
      code: input.code ?? nextOrderCode(existing),
      items,
      total,
      type: input.type ?? "VENDA",
      status: input.status ?? "PENDENTE",
      source: input.source ?? "REPRESENTANTE",
    };
    const created = await orderRepository.create(order);

    if (input.source === "REPRESENTANTE" && input.companyName) {
      try {
        const { commissionService } = await import("@/lib/services");
        await commissionService.create({
          companyName: input.companyName,
          period: input.period,
          rate: 0,
          baseValue: total,
          dueDate: input.date || new Date().toISOString().slice(0, 10),
          status: input.status ?? "PENDENTE",
          method: "A_VISTA",
          notes: `Pedido ${created.code} — gerado automaticamente`,
        });
      } catch {
        // Comissão auxiliar falha silenciosamente — pedido já foi criado
      }
    }

    return created;
  }

  async update(id: string, input: Partial<Omit<Order, "id" | "total" | "items"> & { items: Omit<OrderItem, "id">[] }>): Promise<Order> {
    const payload: Record<string, unknown> = { ...input };
    if (input.items) {
      const items: OrderItem[] = input.items.map((item, index) => ({
        ...item,
        id: `oi-${Date.now().toString(36)}-${itemCounter++}-${index}`,
        quantity: Math.max(1, Number(item.quantity) || 0),
        unitValue: Math.max(0, Number(item.unitValue) || 0),
      }));
      payload.items = items;
      payload.total = items.reduce((acc, item) => acc + item.quantity * item.unitValue, 0);
    }
    return orderRepository.update(id, payload as Partial<Omit<Order, "id">>);
  }

  async delete(id: string): Promise<void> {
    return orderRepository.delete(id);
  }
}

export const orderService = new OrderService();