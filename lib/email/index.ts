import { getResendClient, getDefaultSender, isEmailServiceConfigured } from "./client";
import {
  renderVerificationEmailHtml,
  renderVerificationEmailText,
} from "./templates/verification";

export * from "./client";
export * from "./templates/verification";

export interface SendVerificationEmailParams {
  to: string;
  code: string;
  name?: string;
}

export interface SendEmailResult {
  success: boolean;
  id?: string;
  simulated?: boolean;
  error?: string;
}

/**
 * Envia o código de verificação OTP para o e-mail do usuário via Resend.
 * Em ambiente de desenvolvimento, caso RESEND_API_KEY não esteja configurada,
 * o código é exibido no console do servidor para não travar testes locais.
 */
export async function sendVerificationEmail({
  to,
  code,
  name,
}: SendVerificationEmailParams): Promise<SendEmailResult> {
  const resend = getResendClient();

  if (!resend) {
    if (process.env.NODE_ENV === "development") {
      console.warn("---------------------------------------------------------");
      console.warn("[Resend Dev] RESEND_API_KEY não configurada no .env.local.");
      console.warn(`Simulando envio de verificação para: ${to}`);
      console.warn(`Código OTP: [ ${code} ]`);
      console.warn("Configure RESEND_API_KEY no seu .env.local para disparo real.");
      console.warn("---------------------------------------------------------");
      return { success: true, simulated: true };
    }

    return {
      success: false,
      error: "Serviço de e-mail não configurado (RESEND_API_KEY ausente).",
    };
  }

  try {
    const from = getDefaultSender();
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject: "Seu código de verificação - RARY CRM",
      html: renderVerificationEmailHtml({ code, name }),
      text: renderVerificationEmailText({ code, name }),
    });

    if (error) {
      console.error("[Resend Error]", error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[Resend Exception]", message);
    return { success: false, error: message };
  }
}
