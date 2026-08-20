import { mockDatabase } from "@/lib/db/mock-adapter";
import { sleep } from "@/lib/utils";
import type { Client, TimelineEntry } from "@/types";

export interface CreateClientInput {
  name: string;
  cpfCnpj: string;
  type: Client["type"];
  companyName: string;
  companyCnpj: string;
  segment: Client["segment"];
  city: string;
  state: string;
  decisorName: string;
  decisorRole: string;
  decisorPhone: string;
  decisorEmail: string;
  whatsapp?: string;
  email?: string;
  phone?: string;
  responsibleId: string;
  status: Client["status"];
  origin: string;
  notes?: string;
}

/**
 * Repository de clientes.
 *
 * TODO: substituir por consultas reais ao banco (PostgreSQL/Supabase).
 */
export class ClientRepository {
  async findAll(): Promise<Client[]> {
    await sleep(100);
    return mockDatabase.read("clients");
  }

  async findById(id: string): Promise<Client | null> {
    await sleep(60);
    const clients = await mockDatabase.read("clients");
    return clients.find((client) => client.id === id) ?? null;
  }

  async findByCode(code: string): Promise<Client | null> {
    const clients = await mockDatabase.read("clients");
    return clients.find((client) => client.code === code) ?? null;
  }

  async findAllCodes(): Promise<string[]> {
    const clients = await mockDatabase.read("clients");
    return clients.map((client) => client.code);
  }

  async findTimeline(clientId: string): Promise<TimelineEntry[]> {
    await sleep(60);
    const timelines = await mockDatabase.read("timelines");
    return timelines[clientId] ?? [];
  }
}

export const clientRepository = new ClientRepository();