"use client";

import { Reveal } from "@/components/ui/Reveal";
import {
  IconUsers,
  IconTrendingUp,
  IconCalendar,
  IconPhone,
  IconMail,
  IconTarget,
} from "@/components/icons";
import { IconCalendarCheck } from "@/components/ui/icons-additional";

const galleryItems = [
  {
    title: "Painel de Indicadores",
    description: "Visão geral da operação com métricas em tempo real.",
    icon: <IconTarget className="h-5 w-5 sm:h-6 sm:w-6" />,
    color: "from-brand-500/20 to-brand-600/20",
    iconColor: "text-brand-400",
    mockup: (
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {[
            { label: "Clientes", value: "342", color: "text-brand-400", bg: "bg-brand-500/10" },
            { label: "Vendas", value: "R$ 89k", color: "text-emerald-400", bg: "bg-emerald-500/10" },
            { label: "Pendentes", value: "12", color: "text-amber-400", bg: "bg-amber-500/10" },
          ].map((kpi) => (
            <div key={kpi.label} className={`rounded-lg ${kpi.bg} p-2 text-center sm:rounded-xl sm:p-3`}>
              <div className={`text-xs font-bold ${kpi.color} sm:text-sm`}>{kpi.value}</div>
              <div className="mt-0.5 text-[9px] text-muted sm:text-[11px]">{kpi.label}</div>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5 sm:p-3">
          <div className="flex items-end gap-1 sm:gap-1.5" style={{ height: "55px" }}>
            {[35, 52, 45, 68, 42, 75, 60].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-sm bg-gradient-to-t from-brand-600/70 to-brand-400/70 sm:rounded-t-md"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
          <div className="mt-1.5 flex justify-between text-[8px] text-muted sm:mt-2 sm:text-[10px]">
            {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Cadastro de Clientes",
    description: "Histórico completo com contatos, empresa e status.",
    icon: <IconUsers className="h-5 w-5 sm:h-6 sm:w-6" />,
    color: "from-emerald-500/20 to-emerald-600/20",
    iconColor: "text-emerald-400",
    mockup: (
      <div className="space-y-2 sm:space-y-3">
        {[
          { name: "João Silva", company: "Silva & Assoc.", status: "Ativo", color: "bg-emerald-500/15 text-emerald-400" },
          { name: "Maria Santos", company: "Santos Rep.", status: "Lead", color: "bg-brand-500/15 text-brand-400" },
          { name: "Pedro Costa", company: "Costa Materiais", status: "Ativo", color: "bg-emerald-500/15 text-emerald-400" },
        ].map((c) => (
          <div key={c.name} className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 transition-colors hover:bg-white/[0.04] sm:rounded-xl sm:px-4 sm:py-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-brand-500/20 to-brand-600/20 text-[10px] font-bold text-brand-400 sm:h-9 sm:w-9 sm:text-xs">
                {c.name.charAt(0)}
              </div>
              <div>
                <div className="text-[11px] font-medium text-foreground sm:text-sm">{c.name}</div>
                <div className="text-[9px] text-muted sm:text-[11px]">{c.company}</div>
              </div>
            </div>
            <span className={`rounded-full px-2 py-0.5 text-[9px] font-medium sm:px-2.5 sm:text-[10px] ${c.color}`}>
              {c.status}
            </span>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: "Funil de Vendas",
    description: "Do orçamento à conclusão, com status e valores claros.",
    icon: <IconTrendingUp className="h-5 w-5 sm:h-6 sm:w-6" />,
    color: "from-amber-500/20 to-amber-600/20",
    iconColor: "text-amber-400",
    mockup: (
      <div className="flex gap-2 overflow-x-auto sm:grid sm:grid-cols-3 sm:gap-3 sm:overflow-visible">
        {[
          { title: "Orçamento", count: 3, dotColor: "bg-brand-400", values: ["R$ 12k", "R$ 3k", "R$ 28k"] },
          { title: "Negociação", count: 2, dotColor: "bg-amber-400", values: ["R$ 45k", "R$ 8k"] },
          { title: "Fechado", count: 2, dotColor: "bg-emerald-400", values: ["R$ 22k", "R$ 6k"] },
        ].map((col) => (
          <div key={col.title} className="min-w-[130px] flex-shrink-0 rounded-lg border border-white/[0.06] bg-white/[0.01] sm:min-w-0 sm:rounded-xl">
            <div className="flex items-center gap-1.5 border-b border-white/[0.04] px-2.5 py-2 sm:gap-2 sm:px-3">
              <div className={`h-1.5 w-1.5 rounded-full ${col.dotColor} sm:h-2 sm:w-2`} />
              <span className="text-[10px] font-semibold text-foreground sm:text-xs">{col.title}</span>
              <span className="ml-auto rounded-full bg-white/[0.06] px-1.5 py-0.5 text-[8px] font-bold text-muted sm:px-2 sm:text-[10px]">{col.count}</span>
            </div>
            <div className="space-y-1.5 p-2 sm:space-y-2">
              {col.values.map((v, i) => (
                <div key={i} className="rounded-md bg-white/[0.03] px-2.5 py-1.5 sm:rounded-lg sm:px-3 sm:py-2">
                  <div className="text-[10px] font-bold text-brand-400 sm:text-xs">{v}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: "Follow-ups & Tarefas",
    description: "Ligações, WhatsApp, e-mails e reuniões organizados.",
    icon: <IconCalendarCheck className="h-5 w-5 sm:h-6 sm:w-6" />,
    color: "from-sky-500/20 to-sky-600/20",
    iconColor: "text-sky-400",
    mockup: (
      <div className="space-y-2 sm:space-y-3">
        {[
          { name: "João Silva", type: "Ligação", time: "09:00", status: "Concluído", color: "bg-emerald-500/15 text-emerald-400", icon: <IconPhone className="h-3 w-3 sm:h-4 sm:w-4" /> },
          { name: "Maria Santos", type: "Reunião", time: "10:30", status: "Em andamento", color: "bg-amber-500/15 text-amber-400", icon: <IconCalendar className="h-3 w-3 sm:h-4 sm:w-4" /> },
          { name: "Pedro Costa", type: "WhatsApp", time: "14:00", status: "Pendente", color: "bg-brand-500/15 text-brand-400", icon: <IconMail className="h-3 w-3 sm:h-4 sm:w-4" /> },
        ].map((f) => (
          <div key={f.name} className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 transition-colors hover:bg-white/[0.04] sm:rounded-xl sm:px-4 sm:py-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-muted">{f.icon}</span>
              <div>
                <div className="text-[11px] font-medium text-foreground sm:text-sm">{f.name}</div>
                <div className="text-[9px] text-muted sm:text-[11px]">{f.type} · {f.time}</div>
              </div>
            </div>
            <span className={`rounded-full px-2 py-0.5 text-[9px] font-medium sm:px-2.5 sm:text-[10px] ${f.color}`}>
              {f.status}
            </span>
          </div>
        ))}
      </div>
    ),
  },
];

export function LandingGallery() {
  return (
    <section className="relative border-y border-white/[0.04] bg-surface-1/50">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:py-28">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-brand-400">
              Funcionalidades
            </span>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-5xl">
              Tudo o que o seu time precisa
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">
              Conheça cada funcionalidade do RARY CRM em detalhes.
            </p>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-4 sm:mt-14 sm:gap-6 sm:grid-cols-2">
          {galleryItems.map((item, index) => (
            <Reveal key={item.title} delay={index * 100} className="h-full">
              <div className="group relative h-full">
                <div
                  aria-hidden="true"
                  className="absolute -inset-1 rounded-2xl bg-gradient-to-b from-brand-500/10 to-transparent opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100"
                />
                <div className="relative h-full overflow-hidden rounded-xl border border-white/[0.06] bg-surface-1/60 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-white/[0.12] hover:shadow-[0_20px_60px_-15px_rgba(124,58,237,0.2)] sm:rounded-2xl">
                  <div className="border-b border-white/[0.04] bg-white/[0.02] px-4 py-3 sm:px-6 sm:py-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <span className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${item.color} ${item.iconColor} transition-transform duration-300 group-hover:scale-110 sm:h-12 sm:w-12 sm:rounded-xl`}>
                        {item.icon}
                      </span>
                      <div>
                        <h3 className="text-sm font-semibold text-foreground sm:text-lg">{item.title}</h3>
                        <p className="mt-0.5 text-[11px] text-muted sm:text-sm">{item.description}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 sm:p-5">{item.mockup}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
