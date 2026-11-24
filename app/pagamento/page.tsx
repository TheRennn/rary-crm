"use client";

import { Suspense } from "react";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import {
  IconAlertCircle,
  IconArrowRight,
  IconCheckCircle,
  IconChevronDown,
  IconClock,
  IconCreditCard,
  IconFileText,
  IconRefresh,
  IconRary,
  IconShield,
  IconSparkles,
  IconZap,
} from "@/components/icons";
import { useToast } from "@/components/ui/Toast";
import { CADASTRO_VALOR_CENTAVOS } from "@/lib/constants";

const VALOR_MENSAL = (CADASTRO_VALOR_CENTAVOS / 100).toLocaleString("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const FAQ_ITEMS = [
  {
    question: "A mensalidade será cobrada automaticamente?",
    answer:
      "Não. O RARY CRM usa cobrança mensal por link. Você escolhe quando pagar e confirma cada novo período no checkout.",
  },
  {
    question: "Quais formas de pagamento estão disponíveis?",
    answer:
      "O checkout Stone oferece Pix, cartão de crédito em até 12 parcelas e boleto bancário. As opções finais aparecem na página segura de pagamento.",
  },
  {
    question: "Quando meu acesso será liberado?",
    answer:
      "O acesso é liberado depois que a Stone confirma o pagamento e o webhook atualiza sua assinatura. Apenas abrir o checkout ou iniciar um pagamento não libera o CRM.",
  },
  {
    question: "Já paguei. O que faço se o acesso continuar bloqueado?",
    answer:
      "A confirmação pode levar alguns instantes. Volte a esta tela e use “Já paguei — verificar acesso”. Se o acesso não for atualizado, entre em contato com o suporte antes de tentar pagar novamente.",
  },
] as const;

function formatDate(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return null;
  return date.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function PagamentoPage() {
  return (
    <Suspense fallback={<PaymentLoadingState />}>
      <PagamentoContent />
    </Suspense>
  );
}

function PaymentLoadingState() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6">
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500/10 blur-3xl"
      />
      <div className="relative flex flex-col items-center gap-4 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-brand-400/20 bg-brand-500/10 text-brand-300">
          <IconRefresh className="h-6 w-6 animate-spin" aria-hidden="true" />
        </span>
        <div>
          <p className="font-semibold text-foreground">Preparando seu pagamento</p>
          <p className="mt-1 text-sm text-muted">Só um instante, estamos conferindo sua cobrança.</p>
        </div>
      </div>
    </main>
  );
}

function PagamentoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [linkUrl, setLinkUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [dueAt, setDueAt] = useState<string | null>(null);
  const [accessExpiresAt, setAccessExpiresAt] = useState<string | null>(null);
  const email = searchParams.get("email")?.trim() ?? "";
  const formattedDueAt = formatDate(dueAt);
  const formattedAccessExpiresAt = formatDate(accessExpiresAt);

  const requestPaymentLink = useCallback(async (statusCheck = false) => {
    if (!email) {
      setErrorMessage("O e-mail da conta não foi identificado. Volte ao cadastro ou faça login.");
      setLoading(false);
      setChecking(false);
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
      <PaymentLoadingState />
    );
  }

  if (!linkUrl) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
        <div
          aria-hidden="true"
          className="absolute -right-28 top-12 h-72 w-72 rounded-full bg-danger/10 blur-3xl"
        />
        <Card className="relative w-full max-w-lg animate-fade-in-up border-danger/20 bg-surface-1/95 shadow-2xl shadow-black/30 motion-reduce:animate-none">
          <CardContent className="p-7 text-center sm:p-10">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-danger/20 bg-danger/10 text-danger">
              <IconAlertCircle className="h-7 w-7" aria-hidden="true" />
            </span>
            <h1 className="mt-5 text-2xl font-bold tracking-tight text-foreground">
              Não foi possível preparar sua cobrança
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted">
              {errorMessage || "Ocorreu um erro ao criar o link de pagamento. Tente novamente."}
            </p>
            <Button
              onClick={() => void requestPaymentLink()}
              className="mt-7 w-full"
              size="lg"
            >
              Tentar novamente
              <IconArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
            <div className="mt-5 flex justify-center gap-5 text-sm">
              <Link href="/cadastro" className="font-medium text-brand-300 transition-colors hover:text-brand-200">
                Voltar ao cadastro
              </Link>
              <Link href="/login" className="font-medium text-muted transition-colors hover:text-foreground">
                Ir para o login
              </Link>
            </div>
            <p className="mt-4 text-xs leading-5 text-muted">
              Nenhuma cobrança é concluída ao tentar novamente. Você só paga ao confirmar no checkout Stone.
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-float-slow absolute -left-40 -top-40 h-96 w-96 rounded-full bg-brand-500/15 blur-3xl motion-reduce:animate-none" />
        <div className="animate-float-drift absolute -right-40 top-1/3 h-96 w-96 rounded-full bg-info/10 blur-3xl motion-reduce:animate-none" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <header className="flex items-center justify-between gap-4">
          <Link href="/" aria-label="RARY CRM - início" className="inline-flex items-center gap-2.5">
            <IconRary className="h-9 w-9" />
            <span className="text-sm font-bold tracking-wide text-foreground">
              RARY <span className="text-brand-300">CRM</span>
            </span>
          </Link>
          <div className="inline-flex items-center gap-2 rounded-full border border-success/20 bg-success/5 px-3 py-2 text-xs font-medium text-success">
            <IconShield className="h-4 w-4" aria-hidden="true" />
            <span>Checkout protegido pela Stone</span>
          </div>
        </header>

        <div className="grid flex-1 content-center gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_440px] lg:gap-16 lg:py-16">
          <section className="animate-fade-in-up max-w-2xl motion-reduce:animate-none">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-400/20 bg-brand-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-brand-200">
              <IconSparkles className="h-4 w-4" aria-hidden="true" />
              Assinatura mensal
            </div>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Seu acesso ao RARY está a{" "}
              <span className="bg-gradient-to-r from-brand-300 via-brand-200 to-info bg-clip-text text-transparent">
                um passo
              </span>
              .
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted sm:text-lg">
              Mantenha clientes, vendas e follow-ups organizados em um só lugar.
              Ative seu próximo período com uma mensalidade de{" "}
              <span className="font-semibold text-foreground">R$ {VALOR_MENSAL}</span>.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-2xl border border-border bg-surface-1/70 p-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-success/10 text-success">
                  <IconCheckCircle className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">Acesso após confirmação</p>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    O painel libera quando o pagamento é confirmado pelo webhook.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-2xl border border-border bg-surface-1/70 p-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-info/10 text-info">
                  <IconClock className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">Você controla o pagamento</p>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    A cobrança é mensal por link; não há débito automático.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <Card className="animate-fade-in-up self-center border-brand-400/20 bg-gradient-to-b from-surface-1 to-surface-2 shadow-2xl shadow-brand-950/30 ring-1 ring-brand-400/10 motion-reduce:animate-none">
            <CardHeader className="border-border/80 px-6 pb-0 pt-6 sm:px-8 sm:pt-8">
              <div className="flex w-full items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-300">
                    Próximo período
                  </p>
                  <h2 className="mt-2 text-xl font-bold text-foreground">Mensalidade RARY CRM</h2>
                </div>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-brand-400/20 bg-brand-500/10 text-brand-200">
                  <IconCreditCard className="h-5 w-5" aria-hidden="true" />
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 px-6 pb-6 pt-5 sm:px-8 sm:pb-8">
              <div className="rounded-2xl border border-brand-400/15 bg-gradient-to-br from-brand-500/10 via-surface-2 to-surface-2 p-5">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-medium text-muted">R$</span>
                  <span className="text-4xl font-bold tracking-tight text-foreground">
                    {VALOR_MENSAL}
                  </span>
                  <span className="text-sm text-muted">/ mês</span>
                </div>
                <p className="mt-2 text-xs leading-5 text-muted">
                  Uma cobrança por período. O pagamento é feito por você no checkout.
                </p>
                {formattedAccessExpiresAt && (
                  <p className="mt-3 border-t border-border/70 pt-3 text-xs text-muted">
                    Seu período atual está ativo até{" "}
                    <span className="font-medium text-foreground">{formattedAccessExpiresAt}</span>.
                  </p>
                )}
              </div>

              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                  Escolha no checkout
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-surface-1/70 px-2 py-3 text-center">
                    <IconZap className="h-5 w-5 text-warning" aria-hidden="true" />
                    <span className="text-xs font-medium text-foreground">Pix</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-surface-1/70 px-2 py-3 text-center">
                    <IconCreditCard className="h-5 w-5 text-brand-300" aria-hidden="true" />
                    <span className="text-xs font-medium text-foreground">Cartão</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-surface-1/70 px-2 py-3 text-center">
                    <IconFileText className="h-5 w-5 text-info" aria-hidden="true" />
                    <span className="text-xs font-medium text-foreground">Boleto</span>
                  </div>
                </div>
                <p className="mt-2 text-center text-xs text-muted">
                  Cartão disponível em até 12 parcelas.
                </p>
              </div>

              {formattedDueAt && (
                <div className="flex items-center gap-2 rounded-xl border border-warning/15 bg-warning/5 px-3 py-2.5 text-xs text-warning">
                  <IconClock className="h-4 w-4 shrink-0" aria-hidden="true" />
                  Este link fica disponível até {formattedDueAt}.
                </div>
              )}

              <div className="space-y-3">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => window.open(linkUrl, "_blank", "noopener,noreferrer")}
                >
                  Ir para pagamento seguro
                  <IconArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
                <p className="text-center text-xs text-muted">
                  Você será direcionado ao checkout seguro da Stone.
                </p>
              </div>

              <div className="border-t border-border pt-5">
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  loading={checking}
                  disabled={checking}
                  onClick={() => void requestPaymentLink(true)}
                >
                  {!checking && <IconRefresh className="h-4 w-4" aria-hidden="true" />}
                  Já paguei — verificar acesso
                </Button>
                <p className="mt-3 text-center text-xs leading-5 text-muted">
                  O acesso só é liberado após a confirmação do pagamento.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <section aria-labelledby="payment-faq-heading" className="mx-auto w-full max-w-4xl pb-10 sm:pb-14">
          <div className="mb-5 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-300">
              Precisa de ajuda?
            </p>
            <h2 id="payment-faq-heading" className="mt-2 text-2xl font-bold text-foreground">
              Dúvidas frequentes
            </h2>
          </div>
          <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface-1/80 px-5 sm:px-6">
            {FAQ_ITEMS.map((item) => (
              <details key={item.question} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 [&::-webkit-details-marker]:hidden">
                  <span className="text-sm font-semibold text-foreground sm:text-base">
                    {item.question}
                  </span>
                  <IconChevronDown
                    className="h-5 w-5 shrink-0 text-muted transition-transform duration-200 group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>
                <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-out group-open:grid-rows-[1fr]">
                  <div className="overflow-hidden">
                    <p className="pb-5 pr-8 text-sm leading-6 text-muted">{item.answer}</p>
                  </div>
                </div>
              </details>
            ))}
          </div>
        </section>

        <footer className="flex flex-col items-center justify-between gap-2 border-t border-border/70 py-5 text-center text-xs text-muted sm:flex-row sm:text-left">
          <span>RARY CRM · Assinatura mensal</span>
          <span className="inline-flex items-center gap-1.5">
            <IconShield className="h-3.5 w-3.5 text-success" aria-hidden="true" />
            Seus dados de pagamento são tratados no checkout da Stone.
          </span>
        </footer>
      </div>
    </main>
  );
}
