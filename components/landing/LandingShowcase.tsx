"use client";

import { useState, useEffect, useCallback } from "react";
import { Reveal } from "@/components/ui/Reveal";
import {
  IconUsers,
  IconTrendingUp,
  IconCalendar,
  IconArrowRight,
  IconPhone,
  IconMail,
  IconTarget,
  IconRefresh,
  IconCreditCard,
  IconBuilding,
} from "@/components/icons";
import { IconCalendarCheck } from "@/components/ui/icons-additional";

type Tab = "dashboard" | "clientes" | "vendas" | "followup";

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "dashboard", label: "Dashboard", icon: <IconTarget className="h-4 w-4" /> },
  { id: "clientes", label: "Clientes", icon: <IconUsers className="h-4 w-4" /> },
  { id: "vendas", label: "Vendas", icon: <IconTrendingUp className="h-4 w-4" /> },
  { id: "followup", label: "Follow-ups", icon: <IconCalendarCheck className="h-4 w-4" /> },
];

function DashboardMockup() {
  return (
    <div className="flex h-full flex-col p-4 sm:p-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Clientes", value: "342", change: "+12%", color: "text-brand-400", bg: "bg-brand-500/8", border: "border-brand-500/15", icon: <IconUsers className="h-4 w-4" /> },
          { label: "Vendas", value: "R$ 89.4k", change: "+8%", color: "text-emerald-400", bg: "bg-emerald-500/8", border: "border-emerald-500/15", icon: <IconTrendingUp className="h-4 w-4" /> },
          { label: "Follow-ups", value: "28", change: "5 hoje", color: "text-amber-400", bg: "bg-amber-500/8", border: "border-amber-500/15", icon: <IconCalendarCheck className="h-4 w-4" /> },
          { label: "Pagamentos", value: "R$ 45.2k", change: "12 pendentes", color: "text-sky-400", bg: "bg-sky-500/8", border: "border-sky-500/15", icon: <IconCreditCard className="h-4 w-4" /> },
        ].map((kpi) => (
          <div key={kpi.label} className={`rounded-xl border ${kpi.border} ${kpi.bg} p-4 transition-all hover:scale-[1.02]`}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-muted">{kpi.label}</span>
              <span className={kpi.color}>{kpi.icon}</span>
            </div>
            <div className="mt-2 text-xl font-bold tracking-tight text-foreground">{kpi.value}</div>
            <div className={`mt-1 text-[11px] font-medium ${kpi.color}`}>{kpi.change}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 sm:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-foreground">Atividade Recente</span>
            <span className="text-[10px] text-muted">Últimos 7 dias</span>
          </div>
          <div className="flex items-end gap-1.5" style={{ height: "80px" }}>
            {[35, 52, 45, 68, 42, 75, 60, 48, 72, 55, 65, 80].map((h, i) => (
              <div key={i} className="group/bar flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-brand-600/80 to-brand-400/80 transition-all duration-300 group-hover/bar:from-brand-500 group-hover/bar:to-brand-300"
                  style={{ height: `${h}%` }}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[9px] text-muted">
            {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <span className="text-[11px] font-semibold text-foreground">Próximos Follow-ups</span>
          <div className="mt-3 space-y-2.5">
            {[
              { name: "João Silva", time: "14:30", type: "Ligação", color: "bg-brand-500" },
              { name: "Maria Santos", time: "16:00", type: "Reunião", color: "bg-emerald-500" },
              { name: "Pedro Costa", time: "Amanhã", type: "WhatsApp", color: "bg-amber-500" },
            ].map((f) => (
              <div key={f.name} className="flex items-center gap-3 rounded-lg bg-white/[0.03] px-3 py-2 transition-colors hover:bg-white/[0.05]">
                <div className={`h-8 w-8 rounded-full ${f.color}/20 flex items-center justify-center`}>
                  <span className="text-[10px] font-bold text-brand-400">{f.name.charAt(0)}</span>
                </div>
                <div className="flex-1">
                  <div className="text-[11px] font-medium text-foreground">{f.name}</div>
                  <div className="text-[10px] text-muted">{f.type}</div>
                </div>
                <span className="text-[10px] font-medium text-brand-400">{f.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ClientesMockup() {
  const clients = [
    { name: "João Silva", company: "Silva & Associados", status: "Ativo", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20", contact: "(11) 99999-1234" },
    { name: "Maria Santos", company: "Santos Representações", status: "Lead", color: "bg-brand-500/15 text-brand-400 border-brand-500/20", contact: "(11) 98888-5678" },
    { name: "Pedro Costa", company: "Costa Materiais", status: "Ativo", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20", contact: "(11) 97777-9012" },
    { name: "Ana Oliveira", company: "Oliveira & Filhos", status: "Inativo", color: "bg-white/[0.06] text-muted border-white/[0.08]", contact: "(11) 96666-3456" },
    { name: "Carlos Ferreira", company: "Ferreira Distribuidora", status: "Ativo", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20", contact: "(11) 95555-7890" },
  ];

  return (
    <div className="flex h-full flex-col p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/15">
            <IconUsers className="h-4 w-4 text-brand-400" />
          </div>
          <div>
            <span className="text-[12px] font-semibold text-foreground">Cadastro de Clientes</span>
            <span className="ml-2 rounded-full bg-brand-500/15 px-2 py-0.5 text-[9px] font-medium text-brand-400">342</span>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5">
            <IconRefresh className="h-3 w-3 text-muted" />
            <span className="text-[10px] text-muted">Filtrar</span>
          </div>
          <div className="rounded-lg bg-brand-500 px-3 py-1.5">
            <span className="text-[10px] font-medium text-white">+ Novo</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden rounded-xl border border-white/[0.06]">
        <div className="grid grid-cols-[1.5fr_1.2fr_0.7fr_1fr] gap-2 border-b border-white/[0.06] bg-white/[0.03] px-4 py-2.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">Cliente</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">Empresa</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">Status</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">Contato</span>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {clients.map((c, i) => (
            <div key={i} className="grid grid-cols-[1.5fr_1.2fr_0.7fr_1fr] items-center gap-2 bg-white/[0.01] px-4 py-3 transition-colors hover:bg-white/[0.03]">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-brand-500/20 to-brand-600/20 text-[10px] font-bold text-brand-400">
                  {c.name.charAt(0)}
                </div>
                <span className="text-[11px] font-medium text-foreground">{c.name}</span>
              </div>
              <span className="text-[11px] text-muted">{c.company}</span>
              <span className={`inline-flex w-fit rounded-full border px-2 py-0.5 text-[9px] font-medium ${c.color}`}>
                {c.status}
              </span>
              <span className="text-[11px] text-muted">{c.contact}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function VendasMockup() {
  const columns = [
    {
      title: "Orçamento",
      count: 4,
      color: "border-brand-500/20",
      headerBg: "bg-brand-500/8",
      dotColor: "bg-brand-400",
      deals: [
        { name: "Projeto Alpha", value: "R$ 12.500", client: "Silva & Assoc.", badge: "Novo" },
        { name: "Compra Mensal", value: "R$ 3.200", client: "Santos Rep.", badge: "" },
        { name: "Equipamentos", value: "R$ 28.900", client: "Costa Mat.", badge: "" },
      ],
    },
    {
      title: "Negociação",
      count: 3,
      color: "border-amber-500/20",
      headerBg: "bg-amber-500/8",
      dotColor: "bg-amber-400",
      deals: [
        { name: "Contrato Anual", value: "R$ 45.000", client: "Ferreira Dist.", badge: "Urgente" },
        { name: "Fornecedor VIP", value: "R$ 8.750", client: "Mendes Com.", badge: "" },
      ],
    },
    {
      title: "Fechado",
      count: 2,
      color: "border-emerald-500/20",
      headerBg: "bg-emerald-500/8",
      dotColor: "bg-emerald-400",
      deals: [
        { name: "Venda Q1", value: "R$ 22.400", client: "Costa Mat.", badge: "" },
        { name: "Service Pack", value: "R$ 6.800", client: "Oliveira", badge: "" },
      ],
    },
  ];

  return (
    <div className="flex h-full flex-col p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/15">
            <IconTrendingUp className="h-4 w-4 text-brand-400" />
          </div>
          <span className="text-[12px] font-semibold text-foreground">Funil de Vendas</span>
        </div>
        <div className="rounded-lg bg-brand-500 px-3 py-1.5">
          <span className="text-[10px] font-medium text-white">+ Nova Venda</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 flex-1">
        {columns.map((col) => (
          <div key={col.title} className={`rounded-xl border ${col.color} bg-white/[0.01]`}>
            <div className={`flex items-center justify-between border-b ${col.color} ${col.headerBg} rounded-t-xl px-3 py-2.5`}>
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${col.dotColor}`} />
                <span className="text-[11px] font-semibold text-foreground">{col.title}</span>
              </div>
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white/[0.06] px-1.5 text-[9px] font-bold text-muted">
                {col.count}
              </span>
            </div>
            <div className="space-y-2 p-2.5">
              {col.deals.map((deal, i) => (
                <div key={i} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 transition-all hover:-translate-y-0.5 hover:border-brand-500/20 hover:shadow-lg hover:shadow-brand-600/10">
                  <div className="flex items-start justify-between">
                    <div className="text-[11px] font-semibold text-foreground">{deal.name}</div>
                    {deal.badge && (
                      <span className="rounded-full bg-brand-500/15 px-1.5 py-0.5 text-[8px] font-medium text-brand-400">
                        {deal.badge}
                      </span>
                    )}
                  </div>
                  <div className="mt-1.5 text-[12px] font-bold text-brand-400">{deal.value}</div>
                  <div className="mt-1 text-[10px] text-muted">{deal.client}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FollowUpMockup() {
  const followUps = [
    { name: "João Silva", type: "Ligação", time: "09:00", status: "Concluído", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20", icon: <IconPhone className="h-3.5 w-3.5" /> },
    { name: "Maria Santos", type: "Reunião", time: "10:30", status: "Em andamento", color: "bg-amber-500/15 text-amber-400 border-amber-500/20", icon: <IconCalendar className="h-3.5 w-3.5" /> },
    { name: "Pedro Costa", type: "WhatsApp", time: "14:00", status: "Pendente", color: "bg-brand-500/15 text-brand-400 border-brand-500/20", icon: <IconMail className="h-3.5 w-3.5" /> },
    { name: "Ana Oliveira", type: "E-mail", time: "15:30", status: "Pendente", color: "bg-brand-500/15 text-brand-400 border-brand-500/20", icon: <IconMail className="h-3.5 w-3.5" /> },
    { name: "Carlos Ferreira", type: "Visita", time: "Amanhã", status: "Agendado", color: "bg-sky-500/15 text-sky-400 border-sky-500/20", icon: <IconBuilding className="h-3.5 w-3.5" /> },
  ];

  const summary = [
    { label: "Hoje", count: 4, color: "text-brand-400", bg: "bg-brand-500/10" },
    { label: "Atrasados", count: 2, color: "text-red-400", bg: "bg-red-500/10" },
    { label: "Próximos", count: 8, color: "text-muted", bg: "bg-white/[0.04]" },
    { label: "Concluídos", count: 12, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  ];

  return (
    <div className="flex h-full flex-col p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/15">
            <IconCalendarCheck className="h-4 w-4 text-brand-400" />
          </div>
          <span className="text-[12px] font-semibold text-foreground">Central de Follow-ups</span>
        </div>
        <div className="rounded-lg bg-brand-500 px-3 py-1.5">
          <span className="text-[10px] font-medium text-white">+ Novo</span>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-4 gap-3">
        {summary.map((s) => (
          <div key={s.label} className={`rounded-xl ${s.bg} px-3 py-2.5 text-center`}>
            <div className={`text-[14px] font-bold ${s.color}`}>{s.count}</div>
            <div className="text-[10px] text-muted">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-hidden rounded-xl border border-white/[0.06]">
        <div className="grid grid-cols-[1.5fr_0.8fr_0.6fr_1fr] gap-2 border-b border-white/[0.06] bg-white/[0.03] px-4 py-2.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">Cliente</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">Tipo</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">Hora</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">Status</span>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {followUps.map((f, i) => (
            <div key={i} className="grid grid-cols-[1.5fr_0.8fr_0.6fr_1fr] items-center gap-2 bg-white/[0.01] px-4 py-3 transition-colors hover:bg-white/[0.03]">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-brand-500/20 to-brand-600/20 text-[10px] font-bold text-brand-400">
                  {f.name.charAt(0)}
                </div>
                <span className="text-[11px] font-medium text-foreground">{f.name}</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted">
                {f.icon}
                <span className="text-[11px]">{f.type}</span>
              </div>
              <span className="text-[11px] text-muted">{f.time}</span>
              <span className={`inline-flex w-fit rounded-full border px-2 py-0.5 text-[9px] font-medium ${f.color}`}>
                {f.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function LandingShowcase() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextTab = useCallback(() => {
    setActiveTab((current) => {
      const currentIndex = tabs.findIndex((t) => t.id === current);
      const nextIndex = (currentIndex + 1) % tabs.length;
      return tabs[nextIndex].id;
    });
  }, []);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(nextTab, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextTab]);

  const handleTabClick = (tabId: Tab) => {
    setActiveTab(tabId);
    setIsAutoPlaying(false);
  };

  const renderMockup = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardMockup />;
      case "clientes":
        return <ClientesMockup />;
      case "vendas":
        return <VendasMockup />;
      case "followup":
        return <FollowUpMockup />;
    }
  };

  return (
    <section className="relative overflow-hidden py-24">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(124,58,237,0.06), transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-brand-400">
              Veja na prática
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              Uma plataforma,{" "}
              <span className="bg-gradient-to-r from-brand-400 to-brand-300 bg-clip-text text-transparent">
                tudo visível
              </span>
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted">
              Dashboard, clientes, vendas e follow-ups integrados em uma única
              tela. Conheça cada funcionalidade.
            </p>
          </div>
        </Reveal>

        <Reveal delay={150} className="mt-14">
          <div className="group relative mx-auto max-w-5xl">
            <div
              aria-hidden="true"
              className="absolute -inset-4 rounded-3xl bg-gradient-to-b from-brand-500/15 via-brand-500/5 to-transparent opacity-50 blur-3xl transition-opacity duration-700 group-hover:opacity-80"
            />

            <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-surface-1/80 shadow-[0_20px_80px_-20px_rgba(124,58,237,0.2)] backdrop-blur-sm">
              <div className="flex items-center gap-2 border-b border-white/[0.06] bg-surface-2/60 px-4 py-2.5">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
                  <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
                  <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
                </div>
                <div className="flex flex-1 items-center justify-center">
                  <div className="flex items-center gap-1.5 rounded-lg bg-white/[0.04] px-3 py-1">
                    <IconArrowRight className="h-3 w-3 text-muted" />
                    <span className="text-[10px] text-muted">rary-crm.vercel.app</span>
                  </div>
                </div>
              </div>

              <div className="flex border-b border-white/[0.06] bg-surface-1/60">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    className={`relative flex items-center gap-1.5 px-5 py-3 text-[11px] font-medium transition-all duration-300 ${
                      activeTab === tab.id
                        ? "text-brand-400"
                        : "text-muted/60 hover:text-muted"
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                    {activeTab === tab.id && (
                      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-brand-500/0 via-brand-500 to-brand-500/0" />
                    )}
                  </button>
                ))}
              </div>

              <div className="h-[320px] sm:h-[380px] overflow-hidden bg-surface-1/40">
                <div key={activeTab} className="animate-fade-in h-full">
                  {renderMockup()}
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
