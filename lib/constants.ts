import type {
  CalendarEventType,
  ClientStatus,
  CommissionPaymentMethod,
  DealStatus,
  FollowUpStatus,
  FollowUpType,
  GoalTargetType,
  Notification,
  OrderSource,
  OrderType,
  PaymentStatus,
  ProductCategory,
  ProductUnit,
  TaskStatus,
} from "@/types";

export const APP_NAME = "RARY CRM";
export const CADASTRO_VALOR_CENTAVOS = 4990;

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
  financeiro: "/financeiro",
  configuracoes: "/configuracoes",
  integracoes: "/configuracoes/integracoes",
  login: "/login",
  cadastro: "/cadastro",
  verificarEmail: "/verificar-email",
} as const;

export const NAV_SECTIONS = [
  {
    label: null,
    items: [
      { label: "Dashboard", href: ROUTES.dashboard, icon: "dashboard" },
      { label: "Cadastros", href: ROUTES.clientes, icon: "clientes" },
      { label: "Vendas", href: ROUTES.vendas, icon: "vendas" },
      { label: "Follow-up", href: ROUTES.followUp, icon: "followup" },
      { label: "Calendário", href: ROUTES.calendario, icon: "calendario" },
      { label: "Pendentes", href: ROUTES.pendentes, icon: "pendentes" },
      { label: "Financeiro", href: ROUTES.financeiro, icon: "financeiro" },
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

export const COMMISSION_METHOD_LABELS: Record<CommissionPaymentMethod, string> = {
  A_VISTA: "À vista",
  BOLETO: "Boleto",
  CARTAO: "Cartão",
};

export const COMMISSION_METHOD_OPTIONS = [
  { value: "A_VISTA", label: "À vista" },
  { value: "BOLETO", label: "Boleto" },
  { value: "CARTAO", label: "Cartão" },
] as const;

export const ORDER_SOURCE_LABELS: Record<OrderSource, string> = {
  REPRESENTANTE: "Representante",
  EMPRESA: "Empresa",
};

export const ORDER_TYPE_LABELS: Record<OrderType, string> = {
  VENDA: "Venda",
  AMOSTRA: "Amostra",
  BONIFICACAO: "Bonificação",
};

export const GOAL_TARGET_LABELS: Record<GoalTargetType, string> = {
  CLIENTES: "Clientes",
  FATURAMENTO: "Faturamento",
  VENDAS: "Vendas",
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
  PRAZO_ENTREGA: "Prazo de entrega",
};

export const CALENDAR_EVENT_TYPE_TONES: Record<CalendarEventType, BadgeTone> = {
  FOLLOW_UP: "brand",
  REUNIAO: "info",
  TAREFA: "warning",
  VENCIMENTO: "danger",
  COMPROMISSO: "neutral",
  PRAZO_ENTREGA: "success",
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
  "Facebook",
  "LinkedIn",
  "WhatsApp",
  "Site",
  "Feira",
  "Evento",
  "Outbound",
  "Prospecção",
  "Parceria",
  "Mídia",
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
  "Construção Civil",
  "Agronegócio",
  "Automotivo",
  "Beleza e Estética",
  "Comunicação e Marketing",
  "Consultoria",
  "E-commerce",
  "Energia",
  "Engenharia",
  "Farmacêutico",
  "Financeiro",
  "Imobiliário",
  "Jurídico",
  "Manutenção",
  "Metalurgia",
  "Mobiliário",
  "Pet",
  "Restaurante e Lanchonete",
  "Segurança",
  "Telecomunicações",
  "Transporte",
  "Turismo",
] as const;

export const COUNTRY_OPTIONS = [
  { value: "BR", label: "Brasil (+55)" },
  { value: "US", label: "Estados Unidos (+1)" },
  { value: "AR", label: "Argentina (+54)" },
  { value: "CL", label: "Chile (+56)" },
  { value: "CO", label: "Colômbia (+57)" },
  { value: "MX", label: "México (+52)" },
  { value: "PT", label: "Portugal (+351)" },
  { value: "ES", label: "Espanha (+34)" },
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
  "Link de pagamento",
  "Parcelado",
] as const;

export const PAYMENT_DIRECTION_LABELS: Record<"ENTRADA" | "SAIDA", string> = {
  ENTRADA: "Entrada",
  SAIDA: "Saída",
};

export const PAYMENT_DIRECTION_TONES: Record<"ENTRADA" | "SAIDA", BadgeTone> = {
  ENTRADA: "success",
  SAIDA: "danger",
};

export const CLIENT_KIND_LABELS: Record<"CLIENTE" | "FORNECEDOR", string> = {
  CLIENTE: "Cliente",
  FORNECEDOR: "Fornecedor",
};

export const PRODUCT_CATEGORY_LABELS: Record<ProductCategory, string> = {
  ELETRONICO: "Eletrônico",
  MOVEIS: "Móveis",
  VESTUARIO: "Vestuário",
  ALIMENTICIO: "Alimentício",
  FARMACEUTICO: "Farmacêutico",
  AUTOMOTIVO: "Automotivo",
  CONSTRUCAO: "Construção",
  ESCOLAR: "Escolar",
  ESPORTIVO: "Esportivo",
  CASA: "Casa",
  SERVICO: "Serviço",
  OUTRO: "Outro",
};

export const PRODUCT_CATEGORY_OPTIONS = Object.entries(PRODUCT_CATEGORY_LABELS).map(
  ([value, label]) => ({ value: value as ProductCategory, label })
);

export const PRODUCT_UNIT_LABELS: Record<ProductUnit, string> = {
  UN: "Unidade",
  KG: "Quilograma",
  LT: "Litro",
  MT: "Metro",
  M2: "Metro²",
  M3: "Metro³",
  CX: "Caixa",
  PAR: "Par",
  DZ: "Dúzia",
  PC: "Peça",
};

export const PRODUCT_UNIT_OPTIONS = Object.entries(PRODUCT_UNIT_LABELS).map(
  ([value, label]) => ({ value: value as ProductUnit, label })
);