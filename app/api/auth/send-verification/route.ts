import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function verificationEmailHtml(code: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding:40px 32px 24px;text-align:center;">
              <h1 style="margin:0;font-size:20px;font-weight:600;color:#18181b;">RARY</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 32px;text-align:center;">
              <h2 style="margin:0 0 12px;font-size:18px;font-weight:600;color:#18181b;">Verifique seu e-mail</h2>
              <p style="margin:0 0 24px;font-size:14px;color:#71717a;line-height:1.5;">
                Use o código abaixo para confirmar seu cadastro. O código expira em <strong>15 minutos</strong>.
              </p>
              <div style="background-color:#f4f4f5;border-radius:8px;padding:16px 24px;margin-bottom:24px;">
                <span style="font-size:32px;font-weight:700;color:#18181b;letter-spacing:8px;font-family:monospace;">${code}</span>
              </div>
              <p style="margin:0;font-size:13px;color:#a1a1aa;line-height:1.5;">
                Se você não solicitou este código, pode ignorar este e-mail.
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

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "E-mail é obrigatório." }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Verificar se o usuário existe no Supabase Auth
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
      return NextResponse.json({ error: "Erro interno." }, { status: 500 });
    }

    const authUser = users.users.find((u) => u.email === email);
    if (!authUser) {
      // Por segurança, não revelar se o e-mail existe
      return NextResponse.json({ ok: true });
    }

    // Verificar se já está verificado
    const { data: appUser } = await supabase
      .from("users")
      .select("email_verified")
      .eq("auth_id", authUser.id)
      .single();

    if (appUser?.email_verified) {
      return NextResponse.json({ ok: true });
    }

    // Invalidar tokens anteriores deste e-mail
    await supabase
      .from("verification_tokens")
      .update({ used: true })
      .eq("email", email)
      .eq("used", false);

    // Gerar e salvar novo OTP
    const token = generateOtp();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    const { error: insertError } = await supabase.from("verification_tokens").insert({
      email,
      token,
      expires_at: expiresAt,
    });

    if (insertError) {
      return NextResponse.json({ error: "Erro ao gerar código." }, { status: 500 });
    }

    // Enviar e-mail via Resend
    const resend = new Resend(process.env.RESEND_API_KEY);
    const from = process.env.RESEND_FROM || "RARY <onboarding@resend.dev>";
    const { error: emailError } = await resend.emails.send({
      from,
      to: email,
      subject: "Seu código de verificação - RARY",
      html: verificationEmailHtml(token),
    });

    if (emailError) {
      return NextResponse.json({ error: "Erro ao enviar e-mail." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
