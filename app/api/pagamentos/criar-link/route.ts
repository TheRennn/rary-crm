import { NextResponse } from "next/server";
import {
  CADASTRO_VALOR_CENTAVOS,
  createPaymentLink,
  PagarmeApiError,
} from "@/lib/services/pagarme-service";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const RENEWAL_WINDOW_MS = 5 * 24 * 60 * 60 * 1000;
const PAYMENT_LINK_EXPIRY_MINUTES = 5 * 24 * 60;

interface SubscriptionInvoice {
  invoice_id: string;
  status: "creating" | "pending" | "paid" | "failed" | "expired" | "refunded";
  payment_url: string | null;
  due_at: string;
  created: boolean;
  access_expires_at: string | null;
}

function isSubscriptionInvoice(value: unknown): value is SubscriptionInvoice {
  if (!value || typeof value !== "object") return false;
  const invoice = value as Partial<SubscriptionInvoice>;
  return (
    typeof invoice.invoice_id === "string" &&
    typeof invoice.status === "string" &&
    typeof invoice.due_at === "string" &&
    typeof invoice.created === "boolean"
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Informe um e-mail válido." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("auth_id, email, name, email_verified, payment_verified, access_requirements_enforced, access_expires_at")
      .eq("email", email)
      .maybeSingle();

    if (userError) {
      console.error("Erro ao validar conta para pagamento:", userError);
      return NextResponse.json({ error: "Não foi possível validar a conta." }, { status: 500 });
    }
    if (!user?.auth_id || !user.email_verified) {
      return NextResponse.json(
        { error: "Verifique seu e-mail antes de realizar o pagamento." },
        { status: 403 }
      );
    }
    if (!user.access_requirements_enforced) {
      return NextResponse.json(
        { error: "Esta conta existente não faz parte do fluxo de mensalidade." },
        { status: 409 }
      );
    }

    const accessExpiresAt = user.access_expires_at
      ? new Date(user.access_expires_at)
      : null;
    if (
      user.payment_verified &&
      accessExpiresAt &&
      accessExpiresAt.getTime() > Date.now() + RENEWAL_WINDOW_MS
    ) {
      return NextResponse.json({
        ok: true,
        active: true,
        accessExpiresAt: accessExpiresAt.toISOString(),
      });
    }

    const { data: invoiceResult, error: invoiceError } = await supabase.rpc(
      "create_or_reuse_subscription_invoice",
      {
        p_auth_id: user.auth_id,
        p_email: user.email,
        p_amount_cents: CADASTRO_VALOR_CENTAVOS,
      }
    );

    if (invoiceError) {
      console.error("Erro ao criar cobrança mensal:", invoiceError);
      return NextResponse.json(
        { error: "Não foi possível preparar a cobrança mensal. Verifique se a migração 016 foi aplicada." },
        { status: 500 }
      );
    }
    if (!isSubscriptionInvoice(invoiceResult)) {
      console.error("Resposta inválida ao preparar cobrança mensal.");
      return NextResponse.json({ error: "Resposta inválida ao preparar a cobrança." }, { status: 500 });
    }

    const invoice = invoiceResult;
    if (invoice.status === "pending" && invoice.payment_url) {
      return NextResponse.json({
        ok: true,
        active: false,
        status: invoice.status,
        url: invoice.payment_url,
        amountCents: CADASTRO_VALOR_CENTAVOS,
        dueAt: invoice.due_at,
        accessExpiresAt: invoice.access_expires_at,
      });
    }

    if (!invoice.created) {
      return NextResponse.json(
        { error: "A cobrança está sendo preparada. Aguarde alguns segundos e tente novamente." },
        { status: 409 }
      );
    }

    let link: Awaited<ReturnType<typeof createPaymentLink>>;
    try {
      link = await createPaymentLink({
        email: user.email,
        name: user.name,
        reference: invoice.invoice_id,
        expiresInMinutes: PAYMENT_LINK_EXPIRY_MINUTES,
      });
    } catch (error) {
      const { error: updateError } = await supabase
        .from("subscription_invoices")
        .update({ status: "failed", updated_at: new Date().toISOString() })
        .eq("id", invoice.invoice_id)
        .eq("status", "creating");
      if (updateError) {
        console.error("Erro ao encerrar cobrança que falhou:", updateError);
      }
      throw error;
    }

    const { data: updatedInvoice, error: updateError } = await supabase
      .from("subscription_invoices")
      .update({
        status: "pending",
        payment_link_id: link.id,
        payment_url: link.url,
        updated_at: new Date().toISOString(),
      })
      .eq("id", invoice.invoice_id)
      .eq("status", "creating")
      .select("id")
      .maybeSingle();

    if (updateError || !updatedInvoice) {
      if (updateError) console.error("Erro ao salvar link da cobrança:", updateError);
      return NextResponse.json(
        { error: "O link foi criado, mas não foi possível registrá-lo. Tente novamente ou contate o suporte." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      active: false,
      status: "pending",
      url: link.url,
      amountCents: link.amountCents,
      dueAt: invoice.due_at,
      accessExpiresAt: invoice.access_expires_at,
    });
  } catch (error) {
    if (error instanceof PagarmeApiError) {
      console.error("Falha na API de pagamento:", {
        statusCode: error.statusCode,
        message: error.message,
      });
      return NextResponse.json(
        { error: `Não foi possível criar o link na Pagar.me: ${error.message}` },
        { status: 502 }
      );
    }

    console.error("Erro ao criar link de pagamento:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro inesperado ao criar link de pagamento." },
      { status: 500 }
    );
  }
}
