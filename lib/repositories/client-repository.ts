import { createUniversalClient } from "@/lib/supabase/universal";
import { formatDocument, maskPhone, stripMask } from "@/lib/utils";
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

function formatDecisor(decisor: Record<string, unknown>): Client["decisor"] {
  return {
    name: (decisor.name as string) ?? "",
    role: (decisor.role as string) ?? "",
    phone: maskPhone((decisor.phone as string) ?? ""),
    email: (decisor.email as string) ?? "",
  };
}

function formatContacts(contacts: Client["contacts"]): Client["contacts"] {
  return contacts.map((c) => ({
    ...c,
    value: c.type === "EMAIL" ? c.value : maskPhone(c.value),
  }));
}

function rowToClient(row: Record<string, unknown>): Client {
  return {
    id: row.id as string,
    code: row.code as string,
    name: row.name as string,
    cpfCnpj: formatDocument((row.cpf_cnpj as string) ?? ""),
    type: row.type as Client["type"],
    companyId: (row.company_id as string) ?? "",
    companyName: (row.company_name as string) ?? "",
    companyCnpj: formatDocument((row.company_cnpj as string) ?? ""),
    segment: (row.segment as Client["segment"]) ?? "Tecnologia",
    city: (row.city as string) ?? "",
    state: (row.state as string) ?? "",
    decisor: formatDecisor((row.decisor as Record<string, unknown>) ?? {}),
    contacts: formatContacts((row.contacts as Client["contacts"]) ?? []),
    responsibleId: (row.responsible_id as string) ?? "",
    status: row.status as Client["status"],
    origin: (row.origin as string) ?? "",
    notes: (row.notes as string) ?? undefined,
    createdAt: row.created_at as string,
    lastContactAt: (row.last_contact_at as string) ?? "",
    nextInteractionAt: (row.next_interaction_at as string) ?? undefined,
  };
}

export class ClientRepository {
  async findAll(): Promise<Client[]> {
    const supabase = await createUniversalClient();
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data.map(rowToClient);
  }

  async findById(id: string): Promise<Client | null> {
    const supabase = await createUniversalClient();
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return null;
    return rowToClient(data);
  }

  async findByCode(code: string): Promise<Client | null> {
    const supabase = await createUniversalClient();
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("code", code)
      .single();

    if (error || !data) return null;
    return rowToClient(data);
  }

  async findAllCodes(): Promise<string[]> {
    const supabase = await createUniversalClient();
    const { data, error } = await supabase
      .from("clients")
      .select("code");

    if (error || !data) return [];
    return data.map((row: Record<string, unknown>) => row.code as string);
  }

  async findTimeline(clientId: string): Promise<TimelineEntry[]> {
    const supabase = await createUniversalClient();
    const { data, error } = await supabase
      .from("timelines")
      .select("*")
      .eq("client_id", clientId)
      .order("date", { ascending: false });

    if (error || !data) return [];
    return data.map((row: Record<string, unknown>) => ({
      id: row.id as string,
      date: row.date as string,
      title: row.title as string,
      description: (row.description as string) ?? undefined,
      type: row.type as TimelineEntry["type"],
    }));
  }

  async create(input: CreateClientInput): Promise<Client> {
    const supabase = await createUniversalClient();
    const id = `clt-${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;

    const { data: existing } = await supabase
      .from("clients")
      .select("code")
      .order("code", { ascending: false })
      .limit(1);

    let nextCode = "CLT-000001";
    if (existing && existing.length > 0) {
      const last = existing[0].code as string;
      const num = parseInt(last.replace("CLT-", ""), 10) + 1;
      nextCode = `CLT-${String(num).padStart(6, "0")}`;
    }

    const row = {
      id,
      code: nextCode,
      name: input.name,
      cpf_cnpj: stripMask(input.cpfCnpj),
      type: input.type,
      company_id: null,
      company_name: input.companyName,
      company_cnpj: stripMask(input.companyCnpj),
      segment: input.segment,
      city: input.city,
      state: input.state,
      decisor: {
        name: input.decisorName,
        role: input.decisorRole,
        phone: stripMask(input.decisorPhone),
        email: input.decisorEmail,
      },
      contacts: [
        input.whatsapp ? { type: "WHATSAPP", value: stripMask(input.whatsapp), primary: true } : null,
        input.email ? { type: "EMAIL", value: input.email } : null,
        input.phone ? { type: "TELEFONE", value: stripMask(input.phone) } : null,
      ].filter(Boolean),
      responsible_id: input.responsibleId,
      status: input.status,
      origin: input.origin,
      notes: input.notes ?? null,
      created_at: new Date().toISOString(),
      last_contact_at: new Date().toISOString(),
      next_interaction_at: null,
    };

    const { error: insertError } = await supabase.from("clients").insert(row);
    if (insertError) throw insertError;

    return {
      id,
      code: nextCode,
      name: input.name,
      cpfCnpj: input.cpfCnpj,
      type: input.type,
      companyId: "",
      companyName: input.companyName,
      companyCnpj: input.companyCnpj,
      segment: input.segment,
      city: input.city,
      state: input.state,
      decisor: { name: input.decisorName, role: input.decisorRole, phone: input.decisorPhone, email: input.decisorEmail },
      contacts: row.contacts as Client["contacts"],
      responsibleId: input.responsibleId,
      status: input.status,
      origin: input.origin,
      notes: input.notes,
      createdAt: row.created_at,
      lastContactAt: row.last_contact_at,
    };
  }

  async update(id: string, input: Partial<CreateClientInput>): Promise<Client> {
    const supabase = await createUniversalClient();
    const row: Record<string, unknown> = {};
    if (input.name !== undefined) row.name = input.name;
    if (input.cpfCnpj !== undefined) row.cpf_cnpj = stripMask(input.cpfCnpj);
    if (input.type !== undefined) row.type = input.type;
    if (input.companyName !== undefined) row.company_name = input.companyName;
    if (input.companyCnpj !== undefined) row.company_cnpj = stripMask(input.companyCnpj);
    if (input.segment !== undefined) row.segment = input.segment;
    if (input.city !== undefined) row.city = input.city;
    if (input.state !== undefined) row.state = input.state;
    if (input.decisorName !== undefined || input.decisorRole !== undefined || input.decisorPhone !== undefined || input.decisorEmail !== undefined) {
      row.decisor = {
        name: input.decisorName ?? "",
        role: input.decisorRole ?? "",
        phone: stripMask(input.decisorPhone ?? ""),
        email: input.decisorEmail ?? "",
      };
    }
    if (input.responsibleId !== undefined) row.responsible_id = input.responsibleId;
    if (input.status !== undefined) row.status = input.status;
    if (input.origin !== undefined) row.origin = input.origin;
    if (input.notes !== undefined) row.notes = input.notes ?? null;

    const { data, error } = await supabase.from("clients").update(row).eq("id", id).select().single();
    if (error) throw error;
    return rowToClient(data);
  }
}

export const clientRepository = new ClientRepository();
