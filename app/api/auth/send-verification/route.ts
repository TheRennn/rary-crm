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
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#fff;border-radius:12px;overflow:hidden;">
        <tr><td style="padding:40px 32px 24px;text-align:center;">
          <h1 style="margin:0;font-size:20px;font-weight:600;color:#18181b;">RARY</h1>
        </td></tr>
        <tr><td style="padding:0 32px 32px;text-align:center;">
          <h2 style="margin:0 0 12px;font-size:18px;font-weight:600;color:#18181b;">Verifique seu e-mail</h2>
          <p style="margin:0 0 24px;font-size:14px;color:#71717a;">Use o código abaixo. Expira em <strong>15 minutos</strong>.</p>
          <div style="background:#f4f4f5;border-radius:8px;padding:16px 24px;margin-bottom:24px;">
            <span style="font-size:32px;font-weight:700;color:#18181b;letter-spacing:8px;font-family:monospace;">${code}</span>
          </div>
          <p style="margin:0;font-size:13px;color:#a1a1aa;">Se não solicitou, ignore este e-mail.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "E-mail obrigatório." }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const resendKey = process.env.RESEND_API_KEY;

    if (!supabaseUrl || !serviceKey || !resendKey) {
      return NextResponse.json(
        {
          error: "Variáveis de ambiente não configuradas no servidor.",
          missing: {
            NEXT_PUBLIC_SUPABASE_URL: !supabaseUrl,
            SUPABASE_SERVICE_ROLE_KEY: !serviceKey,
            RESEND_API_KEY: !resendKey,
          },
        },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    // Buscar usuário por email (listUsers pagina em 50 por padrão)
    let authUser: { id: string } | null = null;
    let page = 1;
    const perPage = 1000;

    while (true) {
      const { data: pageData, error: listErr } = await supabase.auth.admin.listUsers({
        page,
        perPage,
      });
      if (listErr) {
        return NextResponse.json({ error: "Erro ao acessar Supabase Auth." }, { status: 500 });
      }

      const found = pageData.users.find((u) => u.email === email);
      if (found) {
        authUser = { id: found.id };
        break;
      }

      if (pageData.users.length < perPage) break;
      page++;
    }

    if (!authUser) {
      return NextResponse.json({ ok: true });
    }

    // Verificar se já verificou
    const { data: appUser } = await supabase
      .from("users")
      .select("email_verified")
      .eq("auth_id", authUser.id)
      .single();

    if (appUser?.email_verified) {
      return NextResponse.json({ ok: true });
    }

    // Invalidar tokens antigos
    await supabase
      .from("verification_tokens")
      .update({ used: true })
      .eq("email", email)
      .eq("used", false);

    // Gerar OTP
    const token = generateOtp();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    const { error: insertErr } = await supabase.from("verification_tokens").insert({
      email,
      token,
      expires_at: expiresAt,
    });

    if (insertErr) {
      return NextResponse.json(
        { error: "Erro ao salvar código.", detail: insertErr.message },
        { status: 500 }
      );
    }

    // Enviar e-mail
    const resend = new Resend(resendKey);
    const from = process.env.RESEND_FROM || "RARY <onboarding@resend.dev>";

    const { error: emailErr } = await resend.emails.send({
      from,
      to: email,
      subject: "Seu código de verificação - RARY",
      html: verificationEmailHtml(token),
    });

    if (emailErr) {
      return NextResponse.json(
        { error: "Erro ao enviar e-mail.", detail: emailErr.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: "Erro interno.", detail: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
