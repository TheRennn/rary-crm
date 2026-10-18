"use client";

import { Suspense } from "react";
import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { IconCreditCard, IconAlertCircle } from "@/components/icons";
import { IconShield } from "@/components/icons";
import { useToast } from "@/components/ui/Toast";
import { CADASTRO_VALOR_CENTAVOS } from "@/lib/constants";

const VALOR_CADASTRO = (CADASTRO_VALOR_CENTAVOS / 100).toLocaleString("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export default function PagamentoPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center text-muted">Carregando pagamento...</div>}>
      <PagamentoContent />
    </Suspense>
  );
}

function PagamentoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [linkUrl, setLinkUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [dueAt, setDueAt] = useState<string | null>(null);
  const [accessExpiresAt, setAccessExpiresAt] = useState<string | null>(null);
  const email = searchParams.get("email")?.trim() ?? "";

  const requestPaymentLink = useCallback(async (statusCheck = false) => {
    if (!email) {
      setErrorMessage("O e-mail da conta não foi identificado. Volte ao cadastro ou faça login.");
      return;
    }

    if (statusCheck) setChecking(true);
    else setLoading(true);
    setErrorMessage("");
    try {
      const res = await fetch("/api/pagamentos/criar-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Erro ao gerar link de pagamento.");
      }
      if (data.active) {
        router.replace("/dashboard");
        return;
      }
      if (typeof data.url !== "string") {
        throw new Error("O link de pagamento não foi retornado.");
      }

      setLinkUrl(data.url);
      setDueAt(typeof data.dueAt === "string" ? data.dueAt : null);
      setAccessExpiresAt(
        typeof data.accessExpiresAt === "string" ? data.accessExpiresAt : null
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Tente novamente mais tarde.";
      setErrorMessage(message);
      toast({
        title: "Erro ao gerar pagamento",
        message,
        variant: "error",
      });
    } finally {
      setLoading(false);
      setChecking(false);
    }
  }, [email, router, toast]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void requestPaymentLink();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [requestPaymentLink]);

  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
        <p className="mt-4 text-muted">Gerando seu link de pagamento...</p>
      </div>
    );
  }

  if (!linkUrl) {
    return (
      <div className="flex h-screen flex-col items-center justify-center text-center p-6">
        <Card>
          <CardContent className="p-8">
            <IconAlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Não foi possível gerar o pagamento</h3>
            <p className="text-muted-foreground mb-6">
              {errorMessage || "Ocorreu um erro ao criar o link de pagamento. Tente novamente."}
            </p>
            <Button
              onClick={() => void requestPaymentLink()}
              className="w-full"
            >
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md">
        <Card className="border-brand-600">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <IconShield className="h-6 w-6 text-brand-600" />
            </div>
            <h3 className="text-2xl font-bold text-center">Pagamento necessário</h3>
            <p className="text-muted text-sm text-center">
              Para liberar ou manter o acesso ao CRM, pague a mensalidade de
              <span className="font-bold text-brand-600"> R$ {VALOR_CADASTRO}</span>.
            </p>
            {accessExpiresAt && (
              <p className="mt-2 text-xs text-muted-foreground">
                Seu acesso atual vence em {new Date(accessExpiresAt).toLocaleDateString("pt-BR")}.
              </p>
            )}
          </CardHeader>
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <div className="bg-muted rounded-lg p-4 border">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <IconCreditCard className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Métodos disponíveis:</span>
                </div>
                <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
                  <span className="px-2 py-1 bg-background rounded border">Pix</span>
                  <span className="px-2 py-1 bg-background rounded border">Cartão de crédito</span>
                  <span className="px-2 py-1 bg-background rounded border">Boleto bancário</span>
                </div>
                {dueAt && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    Este link vence em {new Date(dueAt).toLocaleDateString("pt-BR")}.
                  </p>
                )}
              </div>

              <div className="mt-6">
                <Button
                  className="w-full bg-brand-600 hover:bg-brand-700 text-white text-lg py-4"
                  onClick={() => window.open(linkUrl, "_blank")}
                >
                  Abrir pagamento Stone
                </Button>
              </div>

              <p className="text-xs text-muted-foreground mt-4">
                A mensalidade é cobrada por período. O acesso só é liberado após a confirmação do pagamento pelo webhook.
              </p>
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                loading={checking}
                disabled={checking}
                onClick={() => void requestPaymentLink(true)}
              >
                Já paguei — verificar acesso
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
