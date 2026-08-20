export type ClientStatus =
  | "NOVO"
  | "EM_NEGOCIACAO"
  | "CLIENTE_ATIVO"
  | "INATIVO"
  | "PERDIDO";

export type DealStatus =
  | "ORCAMENTO"
  | "NEGOCIACAO"
  | "APROVADA"
  | "CONCLUIDA"
  | "CANCELADA";

export type PaymentStatus = "PAGO" | "PENDENTE" | "ATRASADO" | "CANCELADO";

export type FollowUpType =
  | "LIGACAO"
  | "WHATSAPP"
  | "EMAIL"
  | "REUNIAO"
  | "PROPOSTA"
  | "OUTRO";

export type FollowUpStatus = "HOJE" | "ATRASADO" | "PROXIMO" | "CONCLUIDO";

export type TaskStatus = "ATRASADA" | "HOJE" | "PROXIMA" | "CONCLUIDA";

export type Segment =
  | "Tecnologia"
  | "Varejo"
  | "Indústria"
  | "Serviços"
  | "Saúde"
  | "Educação"
  | "Alimentação"
  | "Logística";

export type UserRole = "ADMIN" | "GERENTE" | "VENDEDOR";

export type CalendarEventType =
  | "FOLLOW_UP"
  | "REUNIAO"
  | "TAREFA"
  | "VENCIMENTO"
  | "COMPROMISSO";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyId: string;
  phone?: string;
}

export interface Company {
  id: string;
  name: string;
  cnpj: string;
  segment: string;
  city: string;
  state: string;
  logoUrl?: string;
}

export interface Contact {
  type: "WHATSAPP" | "EMAIL" | "TELEFONE";
  value: string;
  primary?: boolean;
}

export interface Decisor {
  name: string;
  role: string;
  phone: string;
  email: string;
}

export interface Client {
  id: string;
  code: string;
  name: string;
  cpfCnpj: string;
  type: "PESSOA_FISICA" | "PESSOA_JURIDICA";
  companyId: string;
  companyName: string;
  companyCnpj: string;
  segment: Segment;
  city: string;
  state: string;
  decisor: Decisor;
  contacts: Contact[];
  responsibleId: string;
  status: ClientStatus;
  origin: string;
  notes?: string;
  createdAt: string;
  lastContactAt: string;
  nextInteractionAt?: string;
}

export interface Deal {
  id: string;
  code: string;
  clientId: string;
  product: string;
  description?: string;
  value: number;
  createdAt: string;
  status: DealStatus;
  paymentStatus: PaymentStatus;
  responsibleId: string;
}

export interface Purchase {
  id: string;
  clientId: string;
  product: string;
  date: string;
  quantity: number;
  value: number;
  status: DealStatus;
  paymentStatus: PaymentStatus;
}

export interface Payment {
  id: string;
  clientId: string;
  dealId?: string;
  purchaseId?: string;
  clientName: string;
  description: string;
  value: number;
  dueDate: string;
  status: PaymentStatus;
  method: string;
}

export interface FollowUp {
  id: string;
  clientId: string;
  clientName: string;
  responsibleId: string;
  type: FollowUpType;
  date: string;
  time: string;
  status: FollowUpStatus;
  subject?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  clientId?: string;
  clientName?: string;
  responsibleId: string;
  dueDate: string;
  dueTime: string;
  status: TaskStatus;
  completed: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  type: CalendarEventType;
  date: string;
  time: string;
  duration: string;
  clientId?: string;
  clientName?: string;
  description?: string;
}

export interface Notification {
  id: string;
  type: "FOLLOW_UP" | "PAGAMENTO" | "TAREFA" | "NOVO_CLIENTE" | "NOVA_VENDA";
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface Activity {
  id: string;
  type: "CLIENTE" | "VENDA" | "FOLLOW_UP" | "PAGAMENTO" | "TAREFA";
  title: string;
  detail: string;
  createdAt: string;
  actor: string;
}

export interface TimelineEntry {
  id: string;
  date: string;
  title: string;
  description?: string;
  type: "LIGACAO" | "WHATSAPP" | "EMAIL" | "REUNIAO" | "PROPOSTA" | "NOTA";
}

export interface ThemeSettings {
  companyName: string;
  brandPrimary: string;
  brandPrimaryDark: string;
  brandPrimaryLight: string;
}