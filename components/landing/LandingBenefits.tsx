import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import {
  IconShield,
  IconZap,
  IconLayers,
  IconUsers,
  IconArrowRight,
} from "@/components/icons";

const benefits = [
  { icon: <IconZap className="h-5 w-5" />, title: "Produtividade", text: "Menos tempo caçando informação, mais tempo vendendo." },
  { icon: <IconLayers className="h-5 w-5" />, title: "Organização", text: "Uma fonte de verdade para toda a operação comercial." },
  { icon: <IconShield className="h-5 w-5" />, title: "Controle", text: "Prazos, pendências e valores sempre visíveis." },
  { icon: <IconUsers className="h-5 w-5" />, title: "Confiança", text: "Equipe alinhada e cliente bem acompanhado do início ao fim." },
];

export function LandingBenefits() {
  return (
    <section id="beneficios" className="border-y border-brand-500/10 bg-surface-1/70">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
        <div className="grid gap-6 lg:grid-cols-2">
          <Reveal>
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-brand-400">
                Benefícios
              </span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
                Operação organizada, equipe que rende mais
              </h2>
              <p className="mt-4 max-w-md text-base leading-relaxed text-muted">
                Quando a rotina está sob controle, o cliente percebe. E a receita
                sente no final do mês.
              </p>
              <Link href="/cadastro" className="mt-10 inline-block">
                <Button size="lg">
                  Começar agora <IconArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2">
            {benefits.map((item, index) => (
              <Reveal key={item.title} delay={index * 80} className="h-full">
                <div className="group h-full rounded-xl border border-border bg-surface-1/80 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/40 hover:shadow-xl hover:shadow-brand-600/15">
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-brand-500/30 bg-brand-500/10 text-brand-300 transition-transform duration-300 group-hover:scale-110">
                    {item.icon}
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{item.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function LandingFinalCta() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 55% 65% at 50% 110%, rgba(124,58,237,0.14), transparent 70%)",
        }}
      />
      <Reveal className="relative">
        <div className="relative mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center sm:px-6 sm:py-28">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Pronto para organizar sua{" "}
            <span className="inline-block pb-2 text-brand-500">operação?</span>
          </h2>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-muted">
            Comece hoje a centralizar seus clientes, vendas, pagamentos e
            follow-ups por{" "}
            <span className="font-semibold text-brand-300">R$ 49,90/mês</span>.
            Seu time agradece. Sua receita também.
          </p>
          <div className="mt-10 flex w-full flex-col items-center justify-center gap-4 sm:w-auto sm:flex-row">
            <Link href="/cadastro" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto">
                Começar agora
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Entrar na minha conta
              </Button>
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}