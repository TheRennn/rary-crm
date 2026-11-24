import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { CADASTRO_VALOR_CENTAVOS } from "@/lib/constants";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

type JsonObject = Record<string, unknown>;

function asObject(value: unknown): JsonObject {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonObject)
    : {};
}

function nestedObject(parent: JsonObject, key: string): JsonObject {
  return asObject(parent[key]);
}

function firstString(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

function findOrderCode(
  data: JsonObject,
  order: JsonObject,
  charge: JsonObject
): string | null {
  const metadata = nestedObject(order, "metadata");
  const chargeMetadata = nestedObject(charge, "metadata");
  const orderFromCharge = nestedObject(charge, "order");

  return firstString(
    data.order_code,
    order.order_code,
    order.code,
    charge.order_code,
    orderFromCharge.order_code,
    orderFromCharge.code,
    metadata.order_code,
    metadata.invoice_id,
    chargeMetadata.order_code,
    chargeMetadata.invoice_id
  );
}

function amountInCents(...values: unknown[]): number | null {
  for (const value of values) {
    if (typeof value === "number" && Number.isSafeInteger(value)) return value;
  }
  return null;
}

function verifyWebhookAuthentication(request: Request, rawBody: string): boolean {
  const secret = process.env.PAGARME_WEBHOOK_SECRET;
  if (!secret) return false;

  const signatureHeader = request.headers.get("x-hub-signature-256");
  if (signatureHeader) {
    const provided = signatureHeader.trim().replace(/^sha256=/i, "");
    if (!/^[a-f0-9]{64}$/i.test(provided)) return false;

    const expected = createHmac("sha256", secret).update(rawBody).digest();
    const actual = Buffer.from(provided, "hex");
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  }

  const suppliedToken = new URL(request.url).searchParams.get("token");
  if (!suppliedToken) return false;
  const expectedToken = Buffer.from(secret);
  const actualToken = Buffer.from(suppliedToken);
  return (
    actualToken.length === expectedToken.length &&
    timingSafeEqual(actualToken, expectedToken)
  );
}

function eventResultOk(value: unknown): boolean {
  const result = asObject(value);
  return result.ok === true;
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  if (!verifyWebhookAuthentication(request, rawBody)) {
    return NextResponse.json({ error: "Assinatura do webhook inválida." }, { status: 401 });
  }

  let event: JsonObject;
  try {
    event = asObject(JSON.parse(rawBody));
  } catch {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  const eventType = firstString(event.type, event.event);
  const data = nestedObject(event, "data");
  const order = nestedObject(data, "order");
  const charge = nestedObject(data, "charge");
  const chargeList = Array.isArray(order.charges) ? order.charges : [];
  const charges = chargeList.map(asObject);
  const paidCharge =
    charges.find((item) => item.status === "paid" || item.status === "succeeded") ??
    charges[0];
  const effectiveCharge =
    Object.keys(charge).length > 0 ? charge : paidCharge ?? order;
  const effectiveOrder =
    Object.keys(order).length > 0
      ? order
      : nestedObject(effectiveCharge, "order");
  const orderCode = findOrderCode(data, effectiveOrder, effectiveCharge);

  if (!eventType) {
    return NextResponse.json({ error: "Evento sem tipo." }, { status: 400 });
  }

  const isPaid = eventType === "charge.paid" || eventType === "order.paid";
  const isFailed =
    eventType === "charge.payment_failed" || eventType === "order.payment_failed";
  const isRefunded = eventType === "charge.refunded" || eventType === "order.refunded";

  if (!isPaid && !isFailed && !isRefunded) {
    return NextResponse.json({ received: true, ignored: true });
  }

  if (isFailed) {
    return NextResponse.json({ received: true, ignored: true });
  }

  if (!orderCode) {
    return NextResponse.json({ error: "Cobrança sem código de fatura." }, { status: 422 });
  }

  const customer = nestedObject(effectiveCharge, "customer");
  const orderCustomer = nestedObject(effectiveOrder, "customer");
  const email = firstString(
    customer.email,
    orderCustomer.email,
    nestedObject(data, "customer").email,
    effectiveCharge.customer_email,
    effectiveOrder.customer_email
  )?.toLowerCase();
  const chargeId = firstString(
    effectiveCharge === effectiveOrder ? null : effectiveCharge.id,
    data.charge_id
  );

  if (isRefunded) {
    if (!chargeId) {
      return NextResponse.json({ error: "Estorno sem identificador de cobrança." }, { status: 422 });
    }
    const supabase = getSupabaseAdmin();
    const { data: result, error } = await supabase.rpc(
      "refund_subscription_invoice_payment",
      { p_order_code: orderCode, p_charge_id: chargeId }
    );
    if (error) {
      console.error("Falha ao registrar estorno:", error);
      return NextResponse.json({ error: "Não foi possível registrar o estorno." }, { status: 500 });
    }
    if (!eventResultOk(result)) {
      return NextResponse.json({ error: "Estorno não corresponde a uma fatura paga." }, { status: 422 });
    }
    return NextResponse.json({ received: true });
  }

  const amount = amountInCents(
    effectiveCharge.amount,
    effectiveCharge.paid_amount,
    effectiveOrder.amount,
    data.amount
  );

  if (amount !== CADASTRO_VALOR_CENTAVOS) {
    console.warn("Pagamento mensal recusado por valor divergente.", {
      orderCode,
      receivedAmount: amount,
    });
    return NextResponse.json({ error: "Valor do pagamento inválido." }, { status: 422 });
  }
  if (!email || !chargeId) {
    return NextResponse.json(
      { error: "Pagamento sem e-mail do cliente ou identificador da cobrança." },
      { status: 422 }
    );
  }

  const supabase = getSupabaseAdmin();
  const { data: result, error } = await supabase.rpc(
    "confirm_subscription_invoice_payment",
    {
      p_order_code: orderCode,
      p_amount_cents: amount,
      p_charge_id: chargeId,
      p_customer_email: email,
    }
  );

  if (error) {
    console.error("Falha ao confirmar pagamento mensal:", error);
    return NextResponse.json({ error: "Não foi possível confirmar o pagamento." }, { status: 500 });
  }
  if (!eventResultOk(result)) {
    const reason = asObject(result).reason;
    console.warn("Webhook de pagamento não correspondeu à fatura:", reason);
    return NextResponse.json({ error: "Pagamento não corresponde a uma fatura elegível." }, { status: 422 });
  }

  return NextResponse.json({ received: true, duplicate: asObject(result).duplicate === true });
}
