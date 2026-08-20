import type { FollowUp } from "@/types";

/**
 * Integração Follow-App
 *
 * ============================================================================
 * TODO: implementar integração oficial com Follow-App
 * ============================================================================
 *
 * Estágio atual (Sprint 0): apenas a estrutura de integração.
 * NENHUMA chamada externa é realizada. Não inventar endpoints ou APIs
 * inexistentes neste momento.
 *
 * Próximo sprint: preencher as funções abaixo com a API oficial do
 * Follow-App (autenticação OAuth, webhooks, sincronização de tratativas).
 */

export interface FollowAppConnection {
  connected: boolean;
  accountEmail?: string;
  syncedAt?: string;
}

export interface FollowAppSyncResult {
  ok: boolean;
  imported: number;
  message: string;
}

export type FollowAppEventType =
  | "TREATMENT_CREATED"
  | "TREATMENT_UPDATED"
  | "MESSAGE_SENT";

export interface FollowAppWebhookPayload {
  event: FollowAppEventType;
  treatmentId: string;
  occurredAt: string;
  data: Record<string, unknown>;
}

export interface FollowAppAdapter {
  connect(credentials: unknown): Promise<FollowAppConnection>;
  syncTreatments(clientId?: string): Promise<FollowAppSyncResult>;
  exportFollowUps(followUps: FollowUp[]): Promise<FollowAppSyncResult>;
  handleWebhook(payload: FollowAppWebhookPayload): Promise<void>;
}

/** Estado local da conexão (mock). */
let localConnection: FollowAppConnection = { connected: false };

/**
 * Conecta a conta do Follow-App.
 *
 * TODO: implementar fluxo OAuth oficial do Follow-App.
 */
export async function connectFollowApp(
  _credentials?: unknown
): Promise<FollowAppConnection> {
  localConnection = { connected: true, syncedAt: new Date().toISOString() };
  return localConnection;
}

/** Status atual da conexão. */
export async function getFollowAppStatus(): Promise<FollowAppConnection> {
  return { ...localConnection };
}

/**
 * Sincroniza tratativas do Follow-App para o CRM.
 *
 * TODO: implementar integração oficial com Follow-App.
 */
export async function syncFollowAppTreatments(
  _clientId?: string
): Promise<FollowAppSyncResult> {
  if (!localConnection.connected) {
    return { ok: false, imported: 0, message: "Follow-App não conectado." };
  }
  return { ok: true, imported: 0, message: "Nada a sincronizar (mock)." };
}

/**
 * Exporta follow-ups do CRM para o Follow-App.
 *
 * TODO: implementar integração oficial com Follow-App.
 */
export async function exportFollowUpsToFollowApp(
  _followUps: FollowUp[]
): Promise<FollowAppSyncResult> {
  return { ok: false, imported: 0, message: "Exportação não implementada." };
}

/**
 * Processa webhooks recebidos do Follow-App.
 *
 * TODO: implementar endpoint /api/integrations/follow-app/webhook
 * e validação de assinatura oficial.
 */
export async function handleFollowAppWebhook(
  _payload: FollowAppWebhookPayload
): Promise<void> {
  // Sem implementação neste sprint.
}