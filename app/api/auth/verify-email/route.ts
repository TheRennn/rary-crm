import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const { email, token } = await request.json();

    if (!email || !token) {
      return NextResponse.json({ error: "E-mail e código são obrigatórios." }, { status: 400 });
    }

    if (typeof token !== "string" || token.length !== 6) {
      return NextResponse.json({ error: "Código deve ter 6 dígitos." }, { status: 400 });
    }

    let supabase;
    try {
      supabase = createAdminClient();
    } catch {
      return NextResponse.json({ error: "Configuração incompleta." }, { status: 500 });
    }

    const { data: tokenRow, error: tokenError } = await supabase
      .from("verification_tokens")
      .select("*")
      .eq("email", email)
      .eq("token", token)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (tokenError || !tokenRow) {
      return NextResponse.json({ error: "Código inválido ou expirado." }, { status: 400 });
    }

    await supabase
      .from("verification_tokens")
      .update({ used: true })
      .eq("id", tokenRow.id);

    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
      return NextResponse.json({ error: "Erro interno." }, { status: 500 });
    }

    const authUser = users.users.find((u) => u.email === email);
    if (!authUser) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    const { error: updateError } = await supabase
      .from("users")
      .update({ email_verified: true })
      .eq("auth_id", authUser.id);

    if (updateError) {
      return NextResponse.json({ error: "Erro ao verificar e-mail." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
