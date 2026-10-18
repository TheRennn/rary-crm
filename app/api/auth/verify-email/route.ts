import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const token = typeof body.token === "string" ? body.token : "";

    if (!email || !/^\d{6}$/.test(token)) {
      return NextResponse.json({ error: "E-mail e código (6 dígitos) são obrigatórios." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const { data: tokenRow, error: tokenErr } = await supabase
      .from("verification_tokens")
      .select("id, token, attempt_count")
      .eq("email", email)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (tokenErr) {
      console.error("Erro ao localizar código de verificação:", tokenErr);
      return NextResponse.json({ error: "Erro interno." }, { status: 500 });
    }
    if (!tokenRow) {
      return NextResponse.json({ error: "Código inválido ou expirado." }, { status: 400 });
    }
    if (tokenRow.attempt_count >= 5) {
      return NextResponse.json(
        { error: "Muitas tentativas. Solicite um novo código." },
        { status: 429 }
      );
    }

    if (tokenRow.token !== token) {
      const { error: attemptErr } = await supabase
        .from("verification_tokens")
        .update({ attempt_count: tokenRow.attempt_count + 1 })
        .eq("id", tokenRow.id)
        .eq("attempt_count", tokenRow.attempt_count)
        .eq("used", false);
      if (attemptErr) {
        console.error("Erro ao registrar tentativa de verificação:", attemptErr);
        return NextResponse.json({ error: "Erro interno." }, { status: 500 });
      }
      return NextResponse.json({ error: "Código inválido ou expirado." }, { status: 400 });
    }

    const { data: appUser, error: userErr } = await supabase
      .from("users")
      .select("auth_id")
      .eq("email", email)
      .maybeSingle();
    if (userErr || !appUser?.auth_id) {
      console.error("Erro ao localizar usuário para verificação:", userErr);
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    const { data: consumedToken, error: consumeErr } = await supabase
      .from("verification_tokens")
      .update({ used: true })
      .eq("id", tokenRow.id)
      .eq("used", false)
      .eq("attempt_count", tokenRow.attempt_count)
      .select("id")
      .maybeSingle();
    if (consumeErr || !consumedToken) {
      if (consumeErr) console.error("Erro ao consumir código de verificação:", consumeErr);
      return NextResponse.json({ error: "Código inválido ou expirado." }, { status: 400 });
    }

    const { error: authErr } = await supabase.auth.admin.updateUserById(appUser.auth_id, {
      email_confirm: true,
    });
    if (authErr) {
      console.error("Erro ao confirmar e-mail no Supabase Auth:", authErr);
      return NextResponse.json({ error: "Erro ao verificar e-mail." }, { status: 500 });
    }

    const { error: updateErr } = await supabase
      .from("users")
      .update({ email_verified: true })
      .eq("auth_id", appUser.auth_id);

    if (updateErr) {
      console.error("Erro ao registrar verificação do e-mail:", updateErr);
      return NextResponse.json({ error: "Erro ao verificar e-mail." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro ao verificar e-mail:", error);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
