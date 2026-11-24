import { NextResponse } from "next/server";
import { sendAccessRequestEmail } from "@/lib/email";
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
      return NextResponse.json({ error: "O envio da solicitação está indisponível. Tente novamente mais tarde." }, { status: 503 });
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

    const emailResult = await sendAccessRequestEmail({
      name,
      company,
      email,
      phone,
      segment,
    });
    if (!emailResult.success) {
      notificationError = {
        name: emailResult.name || "email_error",
        message: emailResult.error || "O e-mail de solicitação não foi enviado.",
        statusCode: emailResult.statusCode ?? null,
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
