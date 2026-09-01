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
      return NextResponse.json({ error: "E-mail e código (6 dígitos) são obrigatórios." }, { status: 400 });
    }

    let supabase;
    try {
      supabase = getAdmin();
    } catch {
      return NextResponse.json({ error: "Configuração incompleta." }, { status: 500 });
    }

    const { data: tokenRow, error: tokenErr } = await supabase
      .from("verification_tokens")
      .select("*")
      .eq("email", email)
      .eq("token", token)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (tokenErr || !tokenRow) {
      return NextResponse.json({ error: "Código inválido ou expirado." }, { status: 400 });
    }

    await supabase
      .from("verification_tokens")
      .update({ used: true })
      .eq("id", tokenRow.id);

    const { data: users, error: listErr } = await supabase.auth.admin.listUsers();
    if (listErr) {
      return NextResponse.json({ error: "Erro interno." }, { status: 500 });
    }

    const authUser = users.users.find((u) => u.email === email);
    if (!authUser) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    const { error: updateErr } = await supabase
      .from("users")
      .update({ email_verified: true })
      .eq("auth_id", authUser.id);

    if (updateErr) {
      return NextResponse.json({ error: "Erro ao verificar e-mail." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
