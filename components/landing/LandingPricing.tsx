import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import {
  IconCheck,
  IconSparkles,
  IconArrowRight,
  IconMessageCircle,
} from "@/components/icons";
import { IconShieldCheck } from "@/components/ui/icons-additional";

const planFeatures = [
  "Clientes, vendas e follow-ups",
  "Calendário e central de pendentes",
  "Controle de pagamentos",
  "Painéis de indicadores",
  "Equipe e responsáveis",
  "Suporte prioritário",
];

const price = formatCurrency(49.9);

export function LandingPricing() {
  return (
    <section id="precos" className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
      <Reveal>
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-brand-500">
            Planos
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Preço simples, sem surpresas
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted">
            Um único plano com tudo o que o seu time precisa. Comece hoje e
            cancele quando quiser.
          </p>
        </div>
      </Reveal>

      <Reveal delay={120} className="mt-12">
        <div className="group relative mx-auto max-w-4xl">
          <div
            aria-hidden="true"
            className="absolute -inset-1 rounded-3xl bg-brand-500/20 opacity-60 blur-xl transition-opacity duration-300 group-hover:opacity-90"
          />
          <div className="relative grid gap-8 rounded-3xl border border-brand-500/30 bg-surface-1 p-8 shadow-2xl shadow-black/40 sm:p-10 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-500/25 bg-brand-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-brand-300">
                <IconSparkles className="h-3 w-3" />
                Tudo incluído
              </span>
              <h3 className="mt-5 text-xl font-semibold tracking-tight text-foreground">
                Tudo o que o seu time precisa, sem módulos vendidos à parte
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Você não paga por cada funcionalidade — paga uma vez e usa tudo.
              </p>

              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {planFeatures.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 text-sm text-foreground"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-500/15 text-brand-300">
                      <IconCheck className="h-3 w-3" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col rounded-2xl border border-brand-500/25 bg-surface-2/60 p-6 lg:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-muted">
                Plano único
              </span>
              <div className="mt-3 flex items-end gap-1.5">
                <span className="text-4xl font-bold tracking-tight text-foreground">
                  {price}
                </span>
                <span className="pb-1 text-sm font-medium text-muted">/mês</span>
              </div>
              <p className="mt-1.5 text-sm text-muted">
                Menos de <strong className="font-semibold text-foreground">R$ 1,70 por dia</strong>.
                Sem custo de implementação.
              </p>

              <Link href="/cadastro" className="mt-6 block">
                <Button size="lg" className="w-full">
                  Começar agora
                  <IconArrowRight className="h-4 w-4" />
                </Button>
              </Link>

              <div className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-muted">
                <IconShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                Garantia de 7 dias: experimente sem risco e cancele sem burocracia.
              </div>

              <div className="mt-5 flex items-center gap-2 border-t border-border pt-5">
                <IconMessageCircle className="h-4 w-4 shrink-0 text-brand-400" />
                <p className="text-sm text-muted">
                  Sem cartão?{" "}
                  <Link
                    href="/cadastro"
                    className="font-semibold text-brand-300 underline-offset-4 transition-colors hover:text-brand-200 hover:underline"
                  >
                    Fale com a gente
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}