import { NextResponse } from "next/server";
import { Resend } from "resend";
import { randomInt } from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

function generateOtp(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
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
  let authId: string | null = null;
  let companyId: string | null = null;
  let tokenId: string | null = null;
  let emailDeliveryError: {
    name: string;
    message: string;
    statusCode: number | null;
  } | null = null;
  let supabase: ReturnType<typeof getSupabaseAdmin> | null = null;

  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const company = typeof body.company === "string" ? body.company.trim() : "";
    const segment = typeof body.segment === "string" ? body.segment.trim() : "";

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !name || !company) {
      return NextResponse.json({ error: "Informe nome, empresa e um e-mail válido." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "A senha deve ter pelo menos 8 caracteres." }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: "O envio de verificação está indisponível. Tente novamente mais tarde." }, { status: 503 });
    }

    supabase = getSupabaseAdmin();
    const recentTokenCutoff = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count: recentTokenCount, error: rateLimitErr } = await supabase
      .from("verification_tokens")
      .select("id", { count: "exact", head: true })
      .eq("email", email)
      .gte("created_at", recentTokenCutoff);
    if (rateLimitErr) throw rateLimitErr;
    if ((recentTokenCount ?? 0) >= 10) {
      return NextResponse.json(
        { error: "Limite de cadastros para este e-mail atingido. Tente novamente mais tarde." },
        { status: 429 }
      );
    }

    const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: { name, company, segment },
    });

    if (createErr) {
      if (
        createErr.code === "email_exists" ||
        createErr.message.toLowerCase().includes("already")
      ) {
        return NextResponse.json(
          {
            error:
              "Este e-mail já está registrado no Supabase Auth. Se não aparece em public.users, existe um cadastro incompleto em Authentication > Users.",
          },
          { status: 409 }
        );
      }
      console.error("Erro ao criar usuário no Supabase Auth:", createErr);
      return NextResponse.json({ error: "Não foi possível criar a conta." }, { status: 500 });
    }
    authId = newUser.user.id;

    companyId = `comp-${authId}`;
    const userId = `usr-${authId}`;

    const { error: companyErr } = await supabase.from("companies").insert({
      id: companyId,
      name: company,
      cnpj: "",
      segment: segment || "Tecnologia",
      city: "",
      state: "",
    });
    if (companyErr) throw companyErr;

    const { error: userErr } = await supabase.from("users").insert({
      id: userId,
      auth_id: authId,
      name,
      email,
      role: "ADMIN",
      company_id: companyId,
      phone: "",
      access_requirements_enforced: true,
    });
    if (userErr) throw userErr;

    const token = generateOtp();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    const { error: invalidateErr } = await supabase
      .from("verification_tokens")
      .update({ used: true })
      .eq("email", email)
      .eq("used", false);
    if (invalidateErr) throw invalidateErr;

    const { data: tokenRow, error: tokenErr } = await supabase
      .from("verification_tokens")
      .insert({ email, token, expires_at: expiresAt })
      .select("id")
      .single();
    if (tokenErr) throw tokenErr;
    tokenId = tokenRow.id;

    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error: emailErr } = await resend.emails.send({
      from: process.env.RESEND_FROM || "RARY <onboarding@resend.dev>",
      to: email,
      subject: "Seu código de verificação - RARY",
      html: verificationEmailHtml(token),
    });
    if (emailErr) {
      emailDeliveryError = {
        name: emailErr.name,
        message: emailErr.message,
        statusCode: emailErr.statusCode,
      };
      throw new Error("verification_email_delivery_failed");
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (supabase) {
      if (tokenId) {
        try {
          const { error: cleanupError } = await supabase
            .from("verification_tokens")
            .delete()
            .eq("id", tokenId);
          if (cleanupError) console.error("Erro ao remover código de verificação após falha:", cleanupError);
        } catch (cleanupError) {
          console.error("Erro ao remover código de verificação após falha:", cleanupError);
        }
      }
      if (authId) {
        try {
          const { error: cleanupError } = await supabase.auth.admin.deleteUser(authId);
          if (cleanupError) console.error("Erro ao remover usuário após falha no cadastro:", cleanupError);
        } catch (cleanupError) {
          console.error("Erro ao remover usuário após falha no cadastro:", cleanupError);
        }
      }
      if (companyId) {
        try {
          const { error: cleanupError } = await supabase
            .from("companies")
            .delete()
            .eq("id", companyId);
          if (cleanupError) console.error("Erro ao remover empresa após falha no cadastro:", cleanupError);
        } catch (cleanupError) {
          console.error("Erro ao remover empresa após falha no cadastro:", cleanupError);
        }
      }
    }
    if (emailDeliveryError) {
      console.error("Resend recusou o envio do código:", emailDeliveryError);
      return NextResponse.json(
        {
          error: `O cadastro não foi concluído porque o Resend recusou o e-mail (${emailDeliveryError.name}, HTTP ${emailDeliveryError.statusCode ?? "desconhecido"}): ${emailDeliveryError.message}. Verifique se o domínio remetente está validado e se o destinatário é permitido pela conta.`,
        },
        { status: 502 }
      );
    }

    console.error(
      "Erro ao concluir cadastro:",
      error instanceof Error
        ? { name: error.name, message: error.message }
        : error
    );
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
