import Link from "next/link";
import { Button } from "@/components/ui/Button";
import {
  IconCalendar,
  IconUsers,
  IconCreditCard,
  IconRefresh,
  IconSparkles,
  IconZap,
} from "@/components/icons";
import { IconBadgeCheck } from "@/components/ui/icons-additional";

const highlights = [
  { icon: <IconUsers className="h-4 w-4" />, label: "Clientes" },
  { icon: <IconRefresh className="h-4 w-4" />, label: "Vendas" },
  { icon: <IconCalendar className="h-4 w-4" />, label: "Follow-ups" },
  { icon: <IconCreditCard className="h-4 w-4" />, label: "Pagamentos" },
];

const trustPoints = [
  { icon: <IconBadgeCheck className="h-4 w-4" />, label: "Controle total da operação" },
  { icon: <IconSparkles className="h-4 w-4" />, label: "Tudo em uma única plataforma" },
  { icon: <IconZap className="h-4 w-4" />, label: "Rotina comercial organizada" },
];

export function LandingHero() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 55% 45% at 50% -10%, rgba(124,58,237,0.14), transparent 65%)",
        }}
      />

      <div className="relative mx-auto flex max-w-6xl flex-col items-center px-4 pb-20 pt-16 text-center sm:px-6 sm:pt-20">
        <div
          className="animate-fade-in-up flex items-center gap-2 rounded-full border border-border bg-surface-1 px-4 py-2 text-xs font-medium text-muted"
          style={{ animationDelay: "0ms" }}
        >
          <IconSparkles className="h-3.5 w-3.5 text-brand-400" />
          Gestão comercial completa para o seu negócio
        </div>

        <h1
          className="animate-fade-in-up mt-6 max-w-3xl text-3xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl md:text-6xl"
          style={{ animationDelay: "120ms" }}
        >
          Seu cliente. Sua operação.
          <br />
          <span className="inline-block pb-2 text-brand-500">
            Tudo em um só lugar.
          </span>
        </h1>

        <p
          className="animate-fade-in-up mt-4 max-w-xl text-base leading-relaxed text-muted sm:text-lg"
          style={{ animationDelay: "240ms" }}
        >
          Organize clientes, vendas, pagamentos, tarefas e follow-ups em uma
          única plataforma. Menos planilha, mais resultado.
        </p>

        <div
          className="animate-fade-in-up mt-8 flex w-full flex-col items-center justify-center gap-4 sm:w-auto sm:flex-row"
          style={{ animationDelay: "360ms" }}
        >
          <Link href="/cadastro" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto">
              Começar agora
            </Button>
          </Link>
          <Link href="#solucao" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Conhecer o CRM
            </Button>
          </Link>
        </div>

        <div
          className="animate-fade-in-up mt-10 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-xs text-muted"
          style={{ animationDelay: "480ms" }}
        >
          {highlights.map((item) => (
            <span key={item.label} className="flex items-center gap-1.5">
              <span className="text-brand-400">{item.icon}</span>
              {item.label}
            </span>
          ))}
        </div>

        <div
          className="animate-fade-in-up mt-6 flex flex-col items-center gap-3 sm:flex-row sm:gap-8"
          style={{ animationDelay: "600ms" }}
        >
          {trustPoints.map((item) => (
            <span
              key={item.label}
              className="flex items-center gap-2 text-sm text-muted"
            >
              <span className="text-success">{item.icon}</span>
              {item.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}