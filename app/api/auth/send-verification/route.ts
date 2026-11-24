import { NextResponse } from "next/server";
import { sendVerificationEmail } from "@/lib/email";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

function generateOtp(): string {
  return Math.floor(100_000 + Math.random() * 900_000).toString();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "E-mail obrigatório." }, { status: 400 });
    }
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: "O envio de e-mail está indisponível." }, { status: 503 });
    }

    const supabase = getSupabaseAdmin();
    const { data: appUser, error: userErr } = await supabase
      .from("users")
      .select("name, email_verified")
      .eq("email", email)
      .maybeSingle();

    if (userErr) {
      console.error("Erro ao buscar usuário para reenvio de código:", userErr);
      return NextResponse.json({ error: "Erro ao acessar conta." }, { status: 500 });
    }
    // Não revela se o endereço está cadastrado.
    if (!appUser || appUser.email_verified) {
      return NextResponse.json({ ok: true });
    }

    const recentTokenCutoff = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count, error: rateLimitErr } = await supabase
      .from("verification_tokens")
      .select("id", { count: "exact", head: true })
      .eq("email", email)
      .gte("created_at", recentTokenCutoff);
    if (rateLimitErr) throw rateLimitErr;
    if ((count ?? 0) >= 10) {
      return NextResponse.json({ error: "Limite de reenvios atingido. Tente novamente mais tarde." }, { status: 429 });
    }

    const { error: invalidateErr } = await supabase
      .from("verification_tokens")
      .update({ used: true })
      .eq("email", email)
      .eq("used", false);
    if (invalidateErr) throw invalidateErr;

    const token = generateOtp();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    const { error: insertErr } = await supabase.from("verification_tokens").insert({
      email,
      token,
      expires_at: expiresAt,
    });
    if (insertErr) throw insertErr;

    const emailResult = await sendVerificationEmail({ to: email, code: token, name: appUser.name });
    if (!emailResult.success) {
      console.error("Resend recusou o reenvio do código:", emailResult.error);
      return NextResponse.json({ error: "Não foi possível enviar o código. Tente novamente mais tarde." }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro ao reenviar código de verificação:", error);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
