export type AssistantRole = "user" | "assistant";

export type AssistantActionStatus = "pending" | "confirmed" | "cancelled";

/**
 * Cartão de ação: a IA propõe uma operação no CRM (criar cliente, registrar
 * pagamento...) e o usuário confirma ou cancela antes de salvar.
 */
export interface AssistantAction {
  title: string;
  rows: { label: string; value: string }[];
  status: AssistantActionStatus;
}

export interface AssistantMessageData {
  id: string;
  role: AssistantRole;
  content: string;
  createdAt: string;
  /** URL local (blob:) da imagem enviada pelo usuário, ex.: comprovante. */
  imageUrl?: string;
  action?: AssistantAction;
}

export interface AssistantReply {
  content: string;
  action?: AssistantAction;
}
