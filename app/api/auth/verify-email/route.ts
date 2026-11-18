import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("missing_env");
  return createClient(url, key);
}

export async function POST(request: Request) {
  try {
    const { email, token } = await request.json();

    if (!email || !token || typeof token !== "string" || token.length !== 6) {
      return NextResponse.json(
        { error: "E-mail e código (6 dígitos) são obrigatórios." },
        { status: 400 }
      );
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

    const { data: tokenRow, error: tokenErr } = await supabase
      .from("verification_tokens")
      .select("id")
      .eq("email", email)
      .eq("token", token)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (tokenErr || !tokenRow) {
      return NextResponse.json({ error: "Código inválido ou expirado." }, { status: 400 });
    }

    // Marcar token como utilizado
    await supabase
      .from("verification_tokens")
      .update({ used: true })
      .eq("id", tokenRow.id);

    // Atualizar email_verified na tabela users
    const { error: updateErr } = await supabase
      .from("users")
      .update({ email_verified: true })
      .eq("email", email);

    if (updateErr) {
      console.error("[VerifyEmail] Erro ao atualizar status do usuário:", updateErr);
      return NextResponse.json(
        { error: "Erro ao confirmar verificação no sistema." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[VerifyEmail Exception]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
