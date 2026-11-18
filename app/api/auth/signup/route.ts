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
    const { email, password, name, company, segment } = await request.json();

    if (!email || !password || !name || !company) {
      return NextResponse.json({ error: "Campos obrigatórios faltando." }, { status: 400 });
    }

    let supabase;
    try {
      supabase = getAdmin();
    } catch {
      return NextResponse.json({ error: "Configuração incompleta no servidor." }, { status: 500 });
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
      email_verified: false,
    });

    const token = generateOtp();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    await supabase.from("verification_tokens").insert({
      email,
      token,
      expires_at: expiresAt,
    });

    const emailResult = await sendVerificationEmail({
      to: email,
      code: token,
      name,
    });

    if (!emailResult.success && process.env.NODE_ENV !== "development") {
      console.error("[Signup] Falha no disparo do e-mail de verificação:", emailResult.error);
    }

    return NextResponse.json({ ok: true, emailSent: emailResult.success });
  } catch (err) {
    console.error("[Signup Exception]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
