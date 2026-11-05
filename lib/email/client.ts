import { Resend } from "resend";

let resendInstance: Resend | null = null;

/**
 * Obtém a instância do client Resend se a API key estiver configurada.
 */
export function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return null;
  }

  if (!resendInstance) {
    resendInstance = new Resend(apiKey);
  }

  return resendInstance;
}

/**
 * Verifica se as credenciais do Resend estão configuradas no ambiente.
 */
export function isEmailServiceConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

/**
 * Retorna o remetente padrão configurado ou o fallback de onboarding.
 */
export function getDefaultSender(): string {
  return process.env.RESEND_FROM || "RARY CRM <onboarding@resend.dev>";
}
