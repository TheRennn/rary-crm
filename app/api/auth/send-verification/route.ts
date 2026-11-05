import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendVerificationEmail } from "@/lib/email";

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function getAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("missing_env");
  return createClient(url, key);
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "E-mail obrigatório." }, { status: 400 });
    }

    let supabase;
    try {
      supabase = getAdmin();
    } catch {
      return NextResponse.json(
        { error: "Configuração do servidor incompleta (Supabase)." },
        { status: 500 }
      );
    }

    // Buscar usuário pelo e-mail
    const { data: appUser, error: userErr } = await supabase
      .from("users")
      .select("id, name, email_verified")
      .eq("email", email)
      .maybeSingle();

    if (userErr) {
      console.error("[SendVerification] Erro ao buscar usuário:", userErr);
      return NextResponse.json({ error: "Erro ao buscar usuário." }, { status: 500 });
    }

    // Se o usuário não existir, retornamos sucesso genérico por segurança
    if (!appUser) {
      return NextResponse.json({ ok: true });
    }

    // Se o usuário já tiver o e-mail verificado, não reenvia
    if (appUser.email_verified) {
      return NextResponse.json({ ok: true, alreadyVerified: true });
    }

    // Invalidar tokens anteriores não utilizados
    await supabase
      .from("verification_tokens")
      .update({ used: true })
      .eq("email", email)
      .eq("used", false);

    // Gerar novo OTP
    const token = generateOtp();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    const { error: insertErr } = await supabase.from("verification_tokens").insert({
      email,
      token,
      expires_at: expiresAt,
    });

    if (insertErr) {
      console.error("[SendVerification] Erro ao gravar token:", insertErr);
      return NextResponse.json(
        { error: "Erro ao salvar código de verificação.", detail: insertErr.message },
        { status: 500 }
      );
    }

    // Disparar e-mail via Resend
    const emailResult = await sendVerificationEmail({
      to: email,
      code: token,
      name: appUser.name,
    });

    if (!emailResult.success) {
      return NextResponse.json(
        { error: "Erro ao enviar e-mail.", detail: emailResult.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error("[SendVerification Exception]", detail);
    return NextResponse.json({ error: "Erro interno.", detail }, { status: 500 });
  }
}
