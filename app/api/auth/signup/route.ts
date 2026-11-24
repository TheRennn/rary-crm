import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  let authId: string | null = null;
  let companyId: string | null = null;
  let notificationError: { name: string; message: string; statusCode: number | null } | null = null;
  let supabase: ReturnType<typeof getSupabaseAdmin> | null = null;

  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const company = typeof body.company === "string" ? body.company.trim() : "";
    const segment = typeof body.segment === "string" ? body.segment.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !name || !company || !phone) {
      return NextResponse.json({ error: "Informe nome, empresa, telefone e um e-mail válido." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "A senha deve ter pelo menos 8 caracteres." }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: "O envio de verificação está indisponível. Tente novamente mais tarde." }, { status: 503 });
    }

    supabase = getSupabaseAdmin();
    const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, company, segment, phone },
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
      phone,
      email_verified: true,
      access_requirements_enforced: true,
      access_status: "Aguardando",
    });
    if (userErr) throw userErr;

    const resend = new Resend(process.env.RESEND_API_KEY);
    const accessRequestRecipient = process.env.ACCESS_REQUEST_EMAIL_TO || "contato@raryservice.com.br";
    const { error: emailErr } = await resend.emails.send({
      from: process.env.RESEND_FROM || "RARY CRM <contato@raryservice.com.br>",
      to: accessRequestRecipient,
      subject: `Novo pedido de acesso ao RARY CRM — ${name}`,
      text: [
        "Novo pedido de acesso ao RARY CRM",
        "",
        `Nome: ${name}`,
        `Empresa: ${company}`,
        `E-mail: ${email}`,
        `Telefone/WhatsApp: ${phone}`,
        `Segmento: ${segment || "Não informado"}`,
        "",
        "A conta está aguardando aprovação. Para liberar, altere public.users.access_status para Liberado para este usuário no Supabase.",
      ].join("\n"),
    });
    if (emailErr) {
      notificationError = {
        name: emailErr.name,
        message: emailErr.message,
        statusCode: emailErr.statusCode,
      };
      throw new Error("access_request_notification_failed");
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (supabase) {
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
    if (notificationError) {
      console.error("Resend recusou a notificação de pedido de acesso:", notificationError);
      return NextResponse.json(
        {
          error: `Não foi possível enviar seu pedido (${notificationError.name}, HTTP ${notificationError.statusCode ?? "desconhecido"}). Tente novamente mais tarde.`,
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
