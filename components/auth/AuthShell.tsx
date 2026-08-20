import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand/Logo";
import {
  IconUsers,
  IconCalendar,
  IconTrendingUp,
  IconCreditCard,
} from "@/components/icons";

export interface AuthShellProps {
  title: string;
  description: string;
  footer: ReactNode;
  children: ReactNode;
}

const highlights = [
  {
    icon: <IconUsers className="h-4 w-4" />,
    title: "Clientes organizados",
    text: "Cadastros, contatos e histórico de tratativas em um só lugar.",
  },
  {
    icon: <IconCalendar className="h-4 w-4" />,
    title: "Follow-ups no dia",
    text: "Rotina comercial clara: hoje, atrasados e próximos.",
  },
  {
    icon: <IconTrendingUp className="h-4 w-4" />,
    title: "Vendas sob controle",
    text: "Funil do orçamento à conclusão, com valores claros.",
  },
  {
    icon: <IconCreditCard className="h-4 w-4" />,
    title: "Pagamentos visíveis",
    text: "Recebido, pendente ou atrasado — você sabe tudo.",
  },
];

export function AuthShell({ title, description, footer, children }: AuthShellProps) {
  return (
    <div className="relative flex min-h-dvh items-center overflow-hidden px-4 py-10 sm:px-6">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 45% 40% at 50% -5%, rgba(124,58,237,0.14), transparent 65%)",
        }}
      />
      <div
        aria-hidden="true"
        className="animate-pulse-glow pointer-events-none absolute -left-32 bottom-0 h-80 w-80 rounded-full bg-brand-600/10 blur-3xl"
      />

      <div className="relative mx-auto grid w-full max-w-5xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="hidden lg:block">
          <Link href="/" aria-label="Página inicial do RARY CRM" className="inline-block">
            <Logo size="lg" />
          </Link>

          <h2
            className="animate-fade-in-up mt-10 max-w-md text-4xl font-bold leading-[1.1] tracking-tight text-foreground"
            style={{ animationDelay: "100ms" }}
          >
            Sua operação,{" "}
            <span className="bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
              sob controle.
            </span>
          </h2>
          <p
            className="animate-fade-in-up mt-4 max-w-md text-base leading-relaxed text-muted"
            style={{ animationDelay: "200ms" }}
          >
            O RARY CRM centraliza clientes, vendas, pagamentos e follow-ups
            para sua equipe trabalhar com clareza e foco.
          </p>

          <div className="animate-fade-in-up mt-10 space-y-5" style={{ animationDelay: "300ms" }}>
            {highlights.map((item) => (
              <div key={item.title} className="flex items-start gap-3.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-brand-500/25 bg-brand-500/10 text-brand-300">
                  {item.icon}
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.title}</p>
                  <p className="mt-0.5 text-sm text-muted">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="animate-fade-in-up w-full max-w-md mx-auto" style={{ animationDelay: "150ms" }}>
          <Link
            href="/"
            aria-label="Página inicial do RARY CRM"
            className="mb-8 flex flex-col items-center gap-4 lg:hidden"
          >
            <Logo size="lg" showText={false} />
            <Logo size="lg" />
          </Link>

          <div className="rounded-2xl border border-border bg-surface-1 p-7 shadow-xl shadow-black/40 sm:p-9">
            <span className="mb-4 inline-flex rounded-full border border-brand-500/25 bg-brand-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-brand-300">
              RARY CRM
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {title}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
            <div className="mt-7">{children}</div>
          </div>

          <p className="mt-6 text-center text-sm text-muted">{footer}</p>
        </div>
      </div>
    </div>
  );
}