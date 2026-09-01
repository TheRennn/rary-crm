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

function getAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("missing_env");
  return createClient(url, key);
}

export async function POST(request: Request) {
  try {
    const { email, password, name, company, segment } = await request.json();

    if (!email || !password || !name || !company) {
      return NextResponse.json({ error: "Campos obrigatórios faltando." }, { status: 400 });
    }

    let supabase;
    try {
      supabase = getAdmin();
    } catch {
      return NextResponse.json({ error: "Configuração incompleta." }, { status: 500 });
    }

    const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, company, segment },
    });

    if (createErr) {
      if (createErr.message.includes("already")) {
        return NextResponse.json({ error: "Este e-mail já está cadastrado." }, { status: 409 });
      }
      return NextResponse.json({ error: createErr.message }, { status: 500 });
    }

    const companyId = `comp-${Date.now().toString(36)}`;

    await supabase.from("companies").insert({
      id: companyId,
      name: company,
      cnpj: "",
      segment: segment || "Tecnologia",
      city: "",
      state: "",
    });

    await supabase.from("users").insert({
      id: `usr-${newUser.user.id.slice(0, 8)}`,
      auth_id: newUser.user.id,
      name,
      email,
      role: "ADMIN",
      company_id: companyId,
      phone: "",
    });

    const token = generateOtp();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    await supabase.from("verification_tokens").insert({
      email,
      token,
      expires_at: expiresAt,
    });

    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      const resend = new Resend(resendKey);
      const from = process.env.RESEND_FROM || "RARY <onboarding@resend.dev>";
      await resend.emails.send({
        from,
        to: email,
        subject: "Seu código de verificação - RARY",
        html: verificationEmailHtml(token),
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
