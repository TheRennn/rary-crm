/**
 * Integração com Stone via Pagar.me (API v5).
 *
 * Gera uma cobrança avulsa para cada período mensal do CRM (R$ 49,90).
 *
 * Variáveis de ambiente necessárias:
 * - PAGARME_API_KEY: chave secreta da conta Stone/Pagar.me (sk_test ou de produção)
 * - PAGARME_ENV: "test" | "production" (padrão: test)
 * - PAGARME_SUCCESS_URL: URL pública HTTPS de retorno após o checkout (opcional)
 * - NEXT_PUBLIC_APP_URL: URL base HTTPS pública usada se PAGARME_SUCCESS_URL não estiver definida
 */
import { CADASTRO_VALOR_CENTAVOS } from "@/lib/constants";
import { isIP } from "node:net";

const PAGARME_API_KEY = process.env.PAGARME_API_KEY;
const PAGARME_ENV = (process.env.PAGARME_ENV || "test") as "test" | "production";

export { CADASTRO_VALOR_CENTAVOS } from "@/lib/constants";

const BASE_URL =
  PAGARME_ENV === "production"
    ? "https://api.pagar.me/core/v5"
    : "https://sdx-api.pagar.me/core/v5"; // ambiente de teste (sandbox)

export interface CreatePaymentLinkInput {
  email: string;
  name: string;
  amountCents?: number;
  reference?: string; // order_code usado para correlacionar o webhook com o usuário
  expiresInMinutes?: number;
}

export interface PaymentLinkOutput {
  id: string;
  url: string;
  status: string;
  amountCents: number;
}

export class PagarmeApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = "PagarmeApiError";
  }
}

function isPublicHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase();

    return (
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      hostname !== "localhost" &&
      !hostname.endsWith(".localhost") &&
      !hostname.endsWith(".local") &&
      !hostname.endsWith(".internal") &&
      !isIP(hostname)
    );
  } catch {
    return false;
  }
}

function getSuccessUrl(): string | undefined {
  const configuredSuccessUrl = process.env.PAGARME_SUCCESS_URL?.trim();
  if (configuredSuccessUrl) {
    if (!isPublicHttpsUrl(configuredSuccessUrl)) {
      throw new Error("PAGARME_SUCCESS_URL deve ser uma URL pública HTTPS válida.");
    }
    return new URL(configuredSuccessUrl).toString();
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!appUrl || !isPublicHttpsUrl(appUrl)) {
    return undefined;
  }

  return new URL("/pagamento/sucesso", appUrl).toString();
}

export async function createPaymentLink(
  input: CreatePaymentLinkInput
): Promise<PaymentLinkOutput> {
  if (!PAGARME_API_KEY) {
    throw new Error("PAGARME_API_KEY não configurada");
  }

  const amountCents = input.amountCents ?? CADASTRO_VALOR_CENTAVOS;
  const successUrl = getSuccessUrl();

  const body = {
    type: "order",
    name: "Mensalidade RARY CRM",
    order_code: input.reference ?? input.email,
    expires_in: input.expiresInMinutes ?? 43200,
    payment_settings: {
      accepted_payment_methods: ["pix", "credit_card", "boleto"],
      statement_descriptor: "RARY CRM",
      credit_card_settings: {
        operation_type: "auth_and_capture",
        installments_setup: {
          max_installments: 12,
          amount: amountCents,
          interest_type: "simple",
          interest_rate: 0,
          customer_fee: false,
          free_installments: 1,
        },
      },
      pix_settings: {
        expires_in: 3600, // 1 hora em segundos
      },
      boleto_settings: {
        due_in: 5, // 5 dias
        instructions: "Mensalidade RARY CRM",
      },
    },
    customer_settings: {
      customer: {
        name: input.name,
        type: "individual",
        email: input.email,
      },
    },
    cart_settings: {
      items: [
        {
          name: "Mensalidade RARY CRM",
          description: "Acesso mensal ao CRM RARY",
          amount: amountCents,
          default_quantity: 1,
        },
      ],
    },
    ...(successUrl ? { flow_settings: { success_url: successUrl } } : {}),
  };

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}/paymentlinks`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${PAGARME_API_KEY}:`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new PagarmeApiError(
      "Não foi possível conectar à API da Pagar.me. Verifique a conexão e tente novamente.",
      0
    );
  }

  if (!response.ok) {
    const responseText = await response.text();
    let message = `A Pagar.me recusou a solicitação (HTTP ${response.status}).`;

    try {
      const errorBody = JSON.parse(responseText) as {
        title?: string;
        message?: string;
        errors?: Record<string, string | string[]>;
      };
      const validationMessages = Object.values(errorBody.errors ?? {}).flatMap(
        (value) => (Array.isArray(value) ? value : [value])
      );
      message =
        validationMessages.join(" ") ||
        errorBody.message ||
        errorBody.title ||
        message;
    } catch {
      // Keep the sanitized status message when the gateway response is not JSON.
    }

    throw new PagarmeApiError(message, response.status);
  }

  const data = await response.json();
  if (
    typeof data.id !== "string" ||
    typeof data.url !== "string" ||
    typeof data.status !== "string"
  ) {
    throw new PagarmeApiError(
      "A Pagar.me retornou uma resposta incompleta ao criar o link.",
      response.status
    );
  }

  return {
    id: data.id,
    url: data.url,
    status: data.status,
    amountCents: amountCents,
  };
}
