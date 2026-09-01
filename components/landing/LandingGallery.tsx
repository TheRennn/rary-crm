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
    icon: <IconTarget className="h-6 w-6" />,
    color: "from-brand-500/20 to-brand-600/20",
    iconColor: "text-brand-400",
    mockup: (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Clientes", value: "342", color: "text-brand-400", bg: "bg-brand-500/10" },
            { label: "Vendas", value: "R$ 89k", color: "text-emerald-400", bg: "bg-emerald-500/10" },
            { label: "Pendentes", value: "12", color: "text-amber-400", bg: "bg-amber-500/10" },
          ].map((kpi) => (
            <div key={kpi.label} className={`rounded-xl ${kpi.bg} p-3 text-center`}>
              <div className={`text-sm font-bold ${kpi.color}`}>{kpi.value}</div>
              <div className="mt-1 text-[11px] text-muted">{kpi.label}</div>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
          <div className="flex items-end gap-1.5" style={{ height: "70px" }}>
            {[35, 52, 45, 68, 42, 75, 60].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-md bg-gradient-to-t from-brand-600/70 to-brand-400/70"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-muted">
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
    icon: <IconUsers className="h-6 w-6" />,
    color: "from-emerald-500/20 to-emerald-600/20",
    iconColor: "text-emerald-400",
    mockup: (
      <div className="space-y-3">
        {[
          { name: "João Silva", company: "Silva & Associados", status: "Ativo", color: "bg-emerald-500/15 text-emerald-400" },
          { name: "Maria Santos", company: "Santos Representações", status: "Lead", color: "bg-brand-500/15 text-brand-400" },
          { name: "Pedro Costa", company: "Costa Materiais", status: "Ativo", color: "bg-emerald-500/15 text-emerald-400" },
        ].map((c) => (
          <div key={c.name} className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 transition-colors hover:bg-white/[0.04]">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-500/20 to-brand-600/20 text-xs font-bold text-brand-400">
                {c.name.charAt(0)}
              </div>
              <div>
                <div className="text-sm font-medium text-foreground">{c.name}</div>
                <div className="text-[11px] text-muted">{c.company}</div>
              </div>
            </div>
            <span className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${c.color}`}>
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
    icon: <IconTrendingUp className="h-6 w-6" />,
    color: "from-amber-500/20 to-amber-600/20",
    iconColor: "text-amber-400",
    mockup: (
      <div className="grid grid-cols-3 gap-3">
        {[
          { title: "Orçamento", count: 3, dotColor: "bg-brand-400", values: ["R$ 12k", "R$ 3k", "R$ 28k"] },
          { title: "Negociação", count: 2, dotColor: "bg-amber-400", values: ["R$ 45k", "R$ 8k"] },
          { title: "Fechado", count: 2, dotColor: "bg-emerald-400", values: ["R$ 22k", "R$ 6k"] },
        ].map((col) => (
          <div key={col.title} className="rounded-xl border border-white/[0.06] bg-white/[0.01]">
            <div className="flex items-center gap-2 border-b border-white/[0.04] px-3 py-2">
              <div className={`h-2 w-2 rounded-full ${col.dotColor}`} />
              <span className="text-xs font-semibold text-foreground">{col.title}</span>
              <span className="ml-auto rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] font-bold text-muted">{col.count}</span>
            </div>
            <div className="space-y-2 p-2">
              {col.values.map((v, i) => (
                <div key={i} className="rounded-lg bg-white/[0.03] px-3 py-2">
                  <div className="text-xs font-bold text-brand-400">{v}</div>
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
    icon: <IconCalendarCheck className="h-6 w-6" />,
    color: "from-sky-500/20 to-sky-600/20",
    iconColor: "text-sky-400",
    mockup: (
      <div className="space-y-3">
        {[
          { name: "João Silva", type: "Ligação", time: "09:00", status: "Concluído", color: "bg-emerald-500/15 text-emerald-400", icon: <IconPhone className="h-4 w-4" /> },
          { name: "Maria Santos", type: "Reunião", time: "10:30", status: "Em andamento", color: "bg-amber-500/15 text-amber-400", icon: <IconCalendar className="h-4 w-4" /> },
          { name: "Pedro Costa", type: "WhatsApp", time: "14:00", status: "Pendente", color: "bg-brand-500/15 text-brand-400", icon: <IconMail className="h-4 w-4" /> },
        ].map((f) => (
          <div key={f.name} className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 transition-colors hover:bg-white/[0.04]">
            <div className="flex items-center gap-3">
              <span className="text-muted">{f.icon}</span>
              <div>
                <div className="text-sm font-medium text-foreground">{f.name}</div>
                <div className="text-[11px] text-muted">{f.type} · {f.time}</div>
              </div>
            </div>
            <span className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${f.color}`}>
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
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-28">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-brand-400">
              Funcionalidades
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              Tudo o que o seu time precisa
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted">
              Conheça cada funcionalidade do RARY CRM em detalhes.
            </p>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {galleryItems.map((item, index) => (
            <Reveal key={item.title} delay={index * 100} className="h-full">
              <div className="group relative h-full">
                <div
                  aria-hidden="true"
                  className="absolute -inset-1 rounded-2xl bg-gradient-to-b from-brand-500/10 to-transparent opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100"
                />
                <div className="relative h-full overflow-hidden rounded-2xl border border-white/[0.06] bg-surface-1/60 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-white/[0.12] hover:shadow-[0_20px_60px_-15px_rgba(124,58,237,0.2)]">
                  <div className="border-b border-white/[0.04] bg-white/[0.02] px-6 py-4">
                    <div className="flex items-center gap-4">
                      <span className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${item.color} ${item.iconColor} transition-transform duration-300 group-hover:scale-110`}>
                        {item.icon}
                      </span>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                        <p className="mt-0.5 text-sm text-muted">{item.description}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-5">{item.mockup}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
