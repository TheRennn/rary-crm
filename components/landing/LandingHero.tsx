import Link from "next/link";
import { Button } from "@/components/ui/Button";
import {
  IconCalendar,
  IconUsers,
  IconCreditCard,
  IconRefresh,
  IconSparkles,
  IconZap,
  IconTrendingUp,
  IconTarget,
  IconCheck,
} from "@/components/icons";

function HeroMiniDashboard() {
  return (
    <div className="mx-auto mt-14 w-full max-w-4xl px-4 sm:px-6">
      <div className="animate-fade-in-up" style={{ animationDelay: "700ms" }}>
        <div className="group relative">
          <div
            aria-hidden="true"
            className="absolute -inset-4 rounded-3xl bg-gradient-to-b from-brand-500/20 via-brand-500/5 to-transparent opacity-60 blur-3xl transition-opacity duration-700 group-hover:opacity-100"
          />
          <div className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-surface-1/80 shadow-[0_20px_80px_-20px_rgba(124,58,237,0.25)] backdrop-blur-sm sm:rounded-2xl">
            <div className="flex items-center gap-2 border-b border-white/[0.06] bg-surface-2/60 px-3 py-2 sm:px-4 sm:py-2.5">
              <div className="flex gap-1.5">
                <div className="h-2 w-2 rounded-full bg-white/10 sm:h-2.5 sm:w-2.5" />
                <div className="h-2 w-2 rounded-full bg-white/10 sm:h-2.5 sm:w-2.5" />
                <div className="h-2 w-2 rounded-full bg-white/10 sm:h-2.5 sm:w-2.5" />
              </div>
              <div className="flex flex-1 items-center justify-center">
                <div className="flex items-center gap-1.5 rounded-lg bg-white/[0.04] px-2 py-1 sm:px-3">
                  <IconRefresh className="h-2 w-2 text-muted sm:h-2.5 sm:w-2.5" />
                  <span className="text-[9px] text-muted sm:text-[10px]">rary-crm.vercel.app/dashboard</span>
                </div>
              </div>
            </div>

            <div className="flex h-[180px] sm:h-[280px]">
              <div className="hidden w-36 border-r border-white/[0.06] bg-surface-2/40 p-3 lg:block lg:w-40">
                <div className="mb-3 px-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700">
                      <IconTarget className="h-3.5 w-3.5 text-white" />
                    </div>
                    <span className="text-[10px] font-semibold text-foreground">RARY CRM</span>
                  </div>
                </div>
                <div className="space-y-0.5">
                  {[
                    { icon: <IconTarget className="h-3.5 w-3.5" />, label: "Dashboard", active: true },
                    { icon: <IconUsers className="h-3.5 w-3.5" />, label: "Clientes", active: false },
                    { icon: <IconTrendingUp className="h-3.5 w-3.5" />, label: "Vendas", active: false },
                    { icon: <IconRefresh className="h-3.5 w-3.5" />, label: "Follow-ups", active: false },
                    { icon: <IconCreditCard className="h-3.5 w-3.5" />, label: "Financeiro", active: false },
                    { icon: <IconCalendar className="h-3.5 w-3.5" />, label: "Calendário", active: false },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[11px] transition-colors ${
                        item.active
                          ? "bg-brand-500/15 font-medium text-brand-400"
                          : "text-muted/70 hover:bg-white/[0.03] hover:text-muted"
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex-1 p-3 sm:p-5">
                <div className="mb-3 grid grid-cols-2 gap-2 sm:mb-4 sm:grid-cols-4 sm:gap-3">
                  {[
                    { label: "Clientes", value: "342", change: "+12%", color: "text-brand-400", bg: "bg-brand-500/8", border: "border-brand-500/15" },
                    { label: "Vendas", value: "R$ 89k", change: "+8%", color: "text-emerald-400", bg: "bg-emerald-500/8", border: "border-emerald-500/15" },
                    { label: "Follow-ups", value: "28", change: "5 hoje", color: "text-amber-400", bg: "bg-amber-500/8", border: "border-amber-500/15" },
                    { label: "Pagamentos", value: "R$ 45k", change: "12 pendentes", color: "text-sky-400", bg: "bg-sky-500/8", border: "border-sky-500/15" },
                  ].map((kpi) => (
                    <div key={kpi.label} className={`rounded-lg border ${kpi.border} ${kpi.bg} p-2 transition-all hover:scale-[1.02] sm:rounded-xl sm:p-3`}>
                      <div className="text-[9px] font-medium text-muted sm:text-[10px]">{kpi.label}</div>
                      <div className="mt-1 text-base font-bold tracking-tight text-foreground sm:mt-1.5 sm:text-xl">{kpi.value}</div>
                      <div className={`mt-0.5 text-[9px] font-medium ${kpi.color} sm:mt-1 sm:text-[10px]`}>{kpi.change}</div>
                    </div>
                  ))}
                </div>

                <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2 sm:rounded-xl sm:p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-foreground sm:text-[11px]">Visão Geral</span>
                    <span className="text-[8px] text-muted sm:text-[9px]">Últimos 7 dias</span>
                  </div>
                  <div className="flex items-end gap-1 sm:gap-1.5" style={{ height: "40px" }}>
                    {[35, 52, 45, 68, 42, 75, 60, 48, 72, 55, 65, 80].map((h, i) => (
                      <div key={i} className="group/bar flex flex-1 flex-col items-center gap-1">
                        <div
                          className="w-full rounded-t-sm bg-gradient-to-t from-brand-600/80 to-brand-400/80 transition-all duration-300 group-hover/bar:from-brand-500 group-hover/bar:to-brand-300 group-hover/bar:shadow-[0_0_12px_rgba(124,58,237,0.4)] sm:rounded-t-md"
                          style={{ height: `${h}%` }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LandingHero() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% -20%, rgba(124,58,237,0.12), transparent 70%)",
        }}
      />

      <div className="relative mx-auto flex max-w-6xl flex-col items-center px-4 pb-8 pt-20 text-center sm:px-6 sm:pt-28">
        <div
          className="animate-fade-in-up inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-1.5 text-xs font-medium text-muted backdrop-blur-sm"
          style={{ animationDelay: "0ms" }}
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-500" />
          </span>
          Plano único · R$ 49,90/mês · Sem surpresas
        </div>

        <h1
          className="animate-fade-in-up mt-8 max-w-4xl text-4xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-6xl md:text-7xl"
          style={{ animationDelay: "120ms" }}
        >
          Seu cliente. Sua operação.
          <br />
          <span className="bg-gradient-to-r from-brand-400 via-brand-500 to-brand-300 bg-clip-text text-transparent">
            Tudo em um só lugar.
          </span>
        </h1>

        <p
          className="animate-fade-in-up mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg"
          style={{ animationDelay: "240ms" }}
        >
          Organize clientes, vendas, pagamentos, tarefas e follow-ups em uma
          única plataforma. Menos planilha, mais resultado.
        </p>

        <div
          className="animate-fade-in-up mt-10 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row sm:gap-4"
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
          className="animate-fade-in-up mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3"
          style={{ animationDelay: "480ms" }}
        >
          {[
            { label: "Clientes" },
            { label: "Vendas" },
            { label: "Follow-ups" },
            { label: "Pagamentos" },
          ].map((item) => (
            <span key={item.label} className="flex items-center gap-2 text-sm text-muted/80">
              <IconCheck className="h-3.5 w-3.5 text-brand-400" />
              {item.label}
            </span>
          ))}
        </div>

        <div
          className="animate-fade-in-up mt-8 flex flex-col items-center gap-4 sm:flex-row sm:gap-8"
          style={{ animationDelay: "600ms" }}
        >
          {[
            { icon: <IconZap className="h-4 w-4" />, label: "Setup em minutos" },
            { icon: <IconSparkles className="h-4 w-4" />, label: "Sem cartão de crédito" },
            { icon: <IconTrendingUp className="h-4 w-4" />, label: "Suporte prioritário" },
          ].map((item) => (
            <span
              key={item.label}
              className="flex items-center gap-2 text-sm text-muted/70"
            >
              <span className="text-brand-400/80">{item.icon}</span>
              {item.label}
            </span>
          ))}
        </div>
      </div>

      <HeroMiniDashboard />
    </section>
  );
}
