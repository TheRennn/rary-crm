import type {
  CalendarEventType,
  ClientStatus,
  DealStatus,
  FollowUpStatus,
  FollowUpType,
  Notification,
  PaymentStatus,
  TaskStatus,
} from "@/types";

export const APP_NAME = "RARY CRM";

export const DEFAULT_THEME = {
  companyName: "RARY",
  brandPrimary: "#7c3aed",
  brandPrimaryDark: "#7c3aed",
  brandPrimaryLight: "#c4b5fd",
};

export const ROUTES = {
  dashboard: "/dashboard",
  clientes: "/clientes",
  clienteNovo: "/clientes/novo",
  vendas: "/vendas",
  followUp: "/follow-up",
  calendario: "/calendario",
  pendentes: "/pendentes",
  pagamentos: "/pagamentos",
  configuracoes: "/configuracoes",
  integracoes: "/configuracoes/integracoes",
  login: "/login",
  cadastro: "/cadastro",
} as const;

export const NAV_SECTIONS = [
  {
    label: null,
    items: [
      { label: "Dashboard", href: ROUTES.dashboard, icon: "dashboard" },
      { label: "Clientes", href: ROUTES.clientes, icon: "clientes" },
      { label: "Vendas", href: ROUTES.vendas, icon: "vendas" },
      { label: "Follow-up", href: ROUTES.followUp, icon: "followup" },
      { label: "Calendário", href: ROUTES.calendario, icon: "calendario" },
      { label: "Pendentes", href: ROUTES.pendentes, icon: "pendentes" },
      { label: "Pagamentos", href: ROUTES.pagamentos, icon: "pagamentos" },
    ],
  },
  {
    label: "Sistema",
    items: [{ label: "Configurações", href: ROUTES.configuracoes, icon: "config" }],
  },
];

export type BadgeTone =
  | "neutral"
  | "brand"
  | "success"
  | "warning"
  | "danger"
  | "info";

export const CLIENT_STATUS_LABELS: Record<ClientStatus, string> = {
  NOVO: "Novo",
  EM_NEGOCIACAO: "Em negociação",
  CLIENTE_ATIVO: "Cliente ativo",
  INATIVO: "Inativo",
  PERDIDO: "Perdido",
};

export const CLIENT_STATUS_TONES: Record<ClientStatus, BadgeTone> = {
  NOVO: "info",
  EM_NEGOCIACAO: "brand",
  CLIENTE_ATIVO: "success",
  INATIVO: "neutral",
  PERDIDO: "danger",
};

export const DEAL_STATUS_LABELS: Record<DealStatus, string> = {
  ORCAMENTO: "Orçamento",
  NEGOCIACAO: "Negociação",
  APROVADA: "Aprovada",
  CONCLUIDA: "Concluída",
  CANCELADA: "Cancelada",
};

export const DEAL_STATUS_TONES: Record<DealStatus, BadgeTone> = {
  ORCAMENTO: "neutral",
  NEGOCIACAO: "brand",
  APROVADA: "info",
  CONCLUIDA: "success",
  CANCELADA: "danger",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PAGO: "Pago",
  PENDENTE: "Pendente",
  ATRASADO: "Atrasado",
  CANCELADO: "Cancelado",
};

export const PAYMENT_STATUS_TONES: Record<PaymentStatus, BadgeTone> = {
  PAGO: "success",
  PENDENTE: "warning",
  ATRASADO: "danger",
  CANCELADO: "neutral",
};

export const FOLLOW_UP_TYPE_LABELS: Record<FollowUpType, string> = {
  LIGACAO: "Ligação",
  WHATSAPP: "WhatsApp",
  EMAIL: "E-mail",
  REUNIAO: "Reunião",
  PROPOSTA: "Proposta",
  OUTRO: "Outro",
};

export const FOLLOW_UP_STATUS_LABELS: Record<FollowUpStatus, string> = {
  HOJE: "Hoje",
  ATRASADO: "Atrasado",
  PROXIMO: "Próximo",
  CONCLUIDO: "Concluído",
};

export const FOLLOW_UP_STATUS_TONES: Record<FollowUpStatus, BadgeTone> = {
  HOJE: "brand",
  ATRASADO: "danger",
  PROXIMO: "neutral",
  CONCLUIDO: "success",
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  ATRASADA: "Atrasada",
  HOJE: "Hoje",
  PROXIMA: "Próxima",
  CONCLUIDA: "Concluída",
};

export const TASK_STATUS_TONES: Record<TaskStatus, BadgeTone> = {
  ATRASADA: "danger",
  HOJE: "brand",
  PROXIMA: "neutral",
  CONCLUIDA: "success",
};

export const CALENDAR_EVENT_TYPE_LABELS: Record<CalendarEventType, string> = {
  FOLLOW_UP: "Follow-up",
  REUNIAO: "Reunião",
  TAREFA: "Tarefa",
  VENCIMENTO: "Vencimento",
  COMPROMISSO: "Compromisso",
};

export const CALENDAR_EVENT_TYPE_TONES: Record<CalendarEventType, BadgeTone> = {
  FOLLOW_UP: "brand",
  REUNIAO: "info",
  TAREFA: "warning",
  VENCIMENTO: "danger",
  COMPROMISSO: "neutral",
};

export const NOTIFICATION_TYPE_LABELS: Record<Notification["type"], string> = {
  FOLLOW_UP: "Follow-up",
  PAGAMENTO: "Pagamento",
  TAREFA: "Tarefa",
  NOVO_CLIENTE: "Novo cliente",
  NOVA_VENDA: "Nova venda",
};

export const CLIENT_ORIGINS = [
  "Indicação",
  "Google",
  "Instagram",
  "WhatsApp",
  "Site",
  "Feira",
  "Outbound",
  "Outro",
] as const;

export const SEGMENTS = [
  "Tecnologia",
  "Varejo",
  "Indústria",
  "Serviços",
  "Saúde",
  "Educação",
  "Alimentação",
  "Logística",
] as const;

export const UF_LIST = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
  "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC",
  "SP", "SE", "TO",
] as const;

export const PAYMENT_METHODS = [
  "Pix",
  "Boleto",
  "Cartão de crédito",
  "Cartão de débito",
  "Transferência",
  "Dinheiro",
] as const;