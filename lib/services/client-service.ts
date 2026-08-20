import { clientRepository } from "@/lib/repositories";
import { generateClientCode } from "@/lib/utils";
import type { Client, ClientStatus } from "@/types";

/**
 * Service de clientes — regras de negócio e composição de dados.
 * Os componentes consomem apenas este serviço.
 */
export class ClientService {
  async getAll(): Promise<Client[]> {
    return clientRepository.findAll();
  }

  async getById(id: string): Promise<Client | null> {
    return clientRepository.findById(id);
  }

  async getByCode(code: string): Promise<Client | null> {
    return clientRepository.findByCode(code);
  }

  async getNextCode(): Promise<string> {
    const codes = await clientRepository.findAllCodes();
    return generateClientCode(codes);
  }

  async findByStatus(status: ClientStatus | "TODOS"): Promise<Client[]> {
    const clients = await this.getAll();
    return status === "TODOS" ? clients : clients.filter((c) => c.status === status);
  }

  async findByResponsible(responsibleId: string | "TODOS"): Promise<Client[]> {
    const clients = await this.getAll();
    return responsibleId === "TODOS"
      ? clients
      : clients.filter((c) => c.responsibleId === responsibleId);
  }

  async search(query: string): Promise<Client[]> {
    const clients = await this.getAll();
    const q = query.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.companyName.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.decisor?.name.toLowerCase().includes(q)
    );
  }

  async getClientsWithPurchases(): Promise<
    Array<Client & { totalSpent: number }>
  > {
    const clients = await this.getAll();
    return clients.map((client) => ({ ...client, totalSpent: 0 }));
  }

  async getRecent(count = 5): Promise<Client[]> {
    const clients = await this.getAll();
    return [...clients]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, count);
  }

  async getResponsibles(): Promise<string[]> {
    const clients = await this.getAll();
    return Array.from(new Set(clients.map((c) => c.responsibleId)));
  }
}

export const clientService = new ClientService();