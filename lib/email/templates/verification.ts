export interface VerificationEmailProps {
  code: string;
  name?: string;
}

/**
 * Template HTML responsivo para o e-mail com código de verificação (OTP).
 */
export function renderVerificationEmailHtml({ code, name }: VerificationEmailProps): string {
  const greeting = name ? `Olá, <strong>${escapeHtml(name)}</strong>!` : "Olá!";

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Código de Verificação - RARY CRM</title>
</head>
<body style="margin: 0; padding: 0; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #09090b; padding: 48px 16px;">
    <tr>
      <td align="center">
        <!-- Card Container -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 480px; background-color: #121217; border-radius: 16px; border: 1px solid #27272a; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
          <!-- Header -->
          <tr>
            <td style="padding: 36px 32px 20px; text-align: center; border-bottom: 1px solid #1f1f23;">
              <table role="presentation" align="center" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background: linear-gradient(135deg, #059669, #047857); border-radius: 10px; width: 36px; height: 36px; text-align: center; vertical-align: middle;">
                    <span style="color: #ffffff; font-size: 18px; font-weight: 800; letter-spacing: -0.5px;">R</span>
                  </td>
                  <td style="padding-left: 12px; text-align: left;">
                    <span style="font-size: 18px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">RARY</span>
                    <span style="font-size: 14px; font-weight: 600; color: #10b981; margin-left: 4px;">CRM</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px 32px 24px; text-align: center;">
              <h1 style="margin: 0 0 12px; font-size: 20px; font-weight: 700; color: #fafafa; letter-spacing: -0.3px;">
                Verificação de E-mail
              </h1>
              <p style="margin: 0 0 20px; font-size: 14px; line-height: 22px; color: #a1a1aa;">
                ${greeting} Use o código de 6 dígitos abaixo para confirmar seu endereço de e-mail e ativar o acesso ao painel do RARY CRM.
              </p>

              <!-- OTP Box -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 28px 0 24px;">
                <tr>
                  <td align="center">
                    <div style="background-color: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 18px 24px; display: inline-block;">
                      <span style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 32px; font-weight: 700; color: #34d399; letter-spacing: 10px; padding-left: 10px;">
                        ${escapeHtml(code)}
                      </span>
                    </div>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 16px; font-size: 13px; color: #71717a;">
                Este código expira em <strong style="color: #e4e4e7;">15 minutos</strong>.
              </p>
            </td>
          </tr>

          <!-- Footer / Security Info -->
          <tr>
            <td style="padding: 20px 32px 32px; text-align: center; border-top: 1px solid #1f1f23; background-color: #0d0d11;">
              <p style="margin: 0 0 8px; font-size: 12px; color: #71717a; line-height: 18px;">
                Se você não solicitou este código ou não criou uma conta no RARY CRM, ignore esta mensagem com segurança.
              </p>
              <p style="margin: 12px 0 0; font-size: 11px; color: #52525b;">
                &copy; ${new Date().getFullYear()} RARY CRM. Todos os direitos reservados.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Versão em texto puro para clientes de e-mail que não suportam HTML.
 */
export function renderVerificationEmailText({ code, name }: VerificationEmailProps): string {
  const greeting = name ? `Olá, ${name}!` : "Olá!";
  return `${greeting}

Seu código de verificação para o RARY CRM é:

${code}

Este código expira em 15 minutos.
Se você não solicitou este código, ignore este e-mail.

RARY CRM`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
