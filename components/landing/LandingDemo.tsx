"use client";

import { useState, useEffect } from "react";
import { Reveal } from "@/components/ui/Reveal";
import {
  IconUsers,
  IconTrendingUp,
  IconCalendar,
  IconPhone,
  IconMail,
  IconTarget,
  IconSearch,
  IconFilter,
  IconRefresh,
  IconCreditCard,
  IconSettings,
  IconBell,
  IconCheck,
  IconArrowRight,
} from "@/components/icons";
import { IconCalendarCheck } from "@/components/ui/icons-additional";

function CursorDot() {
  return (
    <div className="pointer-events-none absolute z-50">
      <div className="relative">
        <div className="h-4 w-4 rounded-full border-2 border-brand-400 bg-brand-400/20" />
        <div className="absolute left-1 top-1 h-2 w-2 rounded-full bg-brand-400" />
      </div>
    </div>
  );
}

function Scene1Dashboard() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 500),
      setTimeout(() => setStep(2), 1500),
      setTimeout(() => setStep(3), 2500),
      setTimeout(() => setStep(4), 3500),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="relative h-full">
      <div className="flex h-full">
        <div className="hidden w-48 border-r border-white/[0.06] bg-surface-2/40 p-3 lg:block">
          <div className="mb-4 flex items-center gap-2.5 px-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700">
              <IconTarget className="h-4 w-4 text-white" />
            </div>
            <span className="text-xs font-semibold text-foreground">RARY CRM</span>
          </div>
          <div className="space-y-0.5">
            {[
              { icon: <IconTarget className="h-4 w-4" />, label: "Dashboard", active: true },
              { icon: <IconUsers className="h-4 w-4" />, label: "Clientes", active: false },
              { icon: <IconTrendingUp className="h-4 w-4" />, label: "Vendas", active: false },
              { icon: <IconCalendarCheck className="h-4 w-4" />, label: "Follow-ups", active: false },
              { icon: <IconCreditCard className="h-4 w-4" />, label: "Financeiro", active: false },
              { icon: <IconCalendar className="h-4 w-4" />, label: "Calendário", active: false },
            ].map((item) => (
              <div
                key={item.label}
                className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs transition-all duration-300 ${
                  item.active
                    ? "bg-brand-500/15 font-medium text-brand-400"
                    : "text-muted/60 hover:bg-white/[0.03] hover:text-muted"
                } ${step >= 1 && item.label === "Clientes" ? "bg-brand-500/15 text-brand-400 scale-[1.02]" : ""}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Bom dia, Renan!</h3>
              <p className="mt-0.5 text-xs text-muted">Aqui está o resumo da sua operação</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03]">
                <IconBell className="h-4 w-4 text-muted" />
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03]">
                <IconSettings className="h-4 w-4 text-muted" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Clientes", value: "342", change: "+12%", color: "text-brand-400", bg: "bg-brand-500/10", border: "border-brand-500/20", icon: <IconUsers className="h-4 w-4" /> },
              { label: "Vendas", value: "R$ 89.4k", change: "+8%", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: <IconTrendingUp className="h-4 w-4" /> },
              { label: "Follow-ups", value: "28", change: "5 hoje", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", icon: <IconCalendarCheck className="h-4 w-4" /> },
              { label: "Pagamentos", value: "R$ 45.2k", change: "12 pendentes", color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/20", icon: <IconCreditCard className="h-4 w-4" /> },
            ].map((kpi, i) => (
              <div
                key={kpi.label}
                className={`rounded-xl border ${kpi.border} ${kpi.bg} p-3 transition-all duration-500 ${
                  step >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                }`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-muted">{kpi.label}</span>
                  <span className={kpi.color}>{kpi.icon}</span>
                </div>
                <div className="mt-2 text-lg font-bold tracking-tight text-foreground">{kpi.value}</div>
                <div className={`mt-1 text-[10px] font-medium ${kpi.color}`}>{kpi.change}</div>
              </div>
            ))}
          </div>

          <div
            className={`mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 transition-all duration-500 ${
              step >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
          >
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">Atividade Recente</span>
                <span className="text-[10px] text-muted">Últimos 7 dias</span>
              </div>
              <div className="flex items-end gap-1.5" style={{ height: "80px" }}>
                {[35, 52, 45, 68, 42, 75, 60, 48, 72, 55, 65, 80].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-md bg-gradient-to-t from-brand-600/80 to-brand-400/80"
                    style={{
                      height: `${h}%`,
                      transition: "height 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
                      transitionDelay: `${i * 50}ms`,
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <span className="text-xs font-semibold text-foreground">Próximos Follow-ups</span>
              <div className="mt-3 space-y-2">
                {[
                  { name: "João Silva", time: "14:30", type: "Ligação", color: "bg-brand-500" },
                  { name: "Maria Santos", time: "16:00", type: "Reunião", color: "bg-emerald-500" },
                  { name: "Pedro Costa", time: "Amanhã", type: "WhatsApp", color: "bg-amber-500" },
                ].map((f) => (
                  <div key={f.name} className="flex items-center gap-3 rounded-lg bg-white/[0.03] px-3 py-2">
                    <div className={`h-8 w-8 rounded-full ${f.color}/20 flex items-center justify-center`}>
                      <span className="text-[10px] font-bold text-brand-400">{f.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-medium text-foreground">{f.name}</div>
                      <div className="text-[10px] text-muted">{f.type}</div>
                    </div>
                    <span className="text-[10px] font-medium text-brand-400">{f.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {step >= 1 && (
        <div
          className="absolute left-48 top-1/2 -translate-y-1/2 transition-all duration-700"
          style={{
            left: step >= 4 ? "180px" : "180px",
            top: step >= 4 ? "140px" : "50%",
            opacity: step >= 4 ? 1 : 0,
          }}
        >
          <CursorDot />
        </div>
      )}
    </div>
  );
}

function Scene2Clientes() {
  const [searchText, setSearchText] = useState("");
  const [step, setStep] = useState(0);

  const searchQuery = "Silva";

  useEffect(() => {
    let cancelled = false;
    const timers = [
      setTimeout(() => {
        if (!cancelled) setStep(1);
      }, 300),
      setTimeout(() => {
        if (!cancelled) setStep(2);
      }, 1000),
    ];
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    if (step < 1) return;
    let i = 0;
    let cancelled = false;

    const timer = setInterval(() => {
      if (cancelled) return;
      if (i < searchQuery.length) {
        setSearchText(searchQuery.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 100);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [step]);

  const clients = [
    { name: "João Silva", company: "Silva & Associados", status: "Ativo", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20", contact: "(11) 99999-1234", highlighted: true },
    { name: "Maria Santos", company: "Santos Representações", status: "Lead", color: "bg-brand-500/15 text-brand-400 border-brand-500/20", contact: "(11) 98888-5678", highlighted: false },
    { name: "Pedro Costa", company: "Costa Materiais", status: "Ativo", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20", contact: "(11) 97777-9012", highlighted: false },
  ];

  return (
    <div className="flex h-full flex-col p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/15">
            <IconUsers className="h-5 w-5 text-brand-400" />
          </div>
          <div>
            <span className="text-sm font-semibold text-foreground">Cadastro de Clientes</span>
            <span className="ml-2 rounded-full bg-brand-500/15 px-2 py-0.5 text-[10px] font-medium text-brand-400">342</span>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5">
            <IconFilter className="h-3.5 w-3.5 text-muted" />
            <span className="text-[11px] text-muted">Filtrar</span>
          </div>
          <div className="rounded-lg bg-brand-500 px-3 py-1.5">
            <span className="text-[11px] font-medium text-white">+ Novo</span>
          </div>
        </div>
      </div>

      <div className="mb-3 flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2">
        <IconSearch className="h-4 w-4 text-muted" />
        <span className="text-sm text-muted">
          {searchText}
          {step >= 1 && step < 2 && <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-brand-400" />}
        </span>
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
            <div
              key={i}
              className={`grid grid-cols-[1.5fr_1.2fr_0.7fr_1fr] items-center gap-2 px-4 py-3 transition-all duration-500 ${
                c.highlighted && step >= 2
                  ? "bg-brand-500/10 border-l-2 border-l-brand-500"
                  : "bg-white/[0.01] hover:bg-white/[0.03]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-500/20 to-brand-600/20 text-xs font-bold text-brand-400">
                  {c.name.charAt(0)}
                </div>
                <span className="text-xs font-medium text-foreground">{c.name}</span>
              </div>
              <span className="text-xs text-muted">{c.company}</span>
              <span className={`inline-flex w-fit rounded-full border px-2 py-0.5 text-[10px] font-medium ${c.color}`}>
                {c.status}
              </span>
              <span className="text-xs text-muted">{c.contact}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Scene3Vendas() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 500),
      setTimeout(() => setStep(2), 2000),
      setTimeout(() => setStep(3), 3500),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const columns = [
    {
      title: "Orçamento",
      count: 4,
      dotColor: "bg-brand-400",
      headerBg: "bg-brand-500/10",
      borderColor: "border-brand-500/20",
      deals: [
        { name: "Projeto Alpha", value: "R$ 12.500", client: "Silva & Assoc.", badge: "Novo", highlighted: step >= 1 },
        { name: "Compra Mensal", value: "R$ 3.200", client: "Santos Rep.", badge: "", highlighted: false },
        { name: "Equipamentos", value: "R$ 28.900", client: "Costa Mat.", badge: "", highlighted: false },
      ],
    },
    {
      title: "Negociação",
      count: 3,
      dotColor: "bg-amber-400",
      headerBg: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
      deals: [
        { name: "Contrato Anual", value: "R$ 45.000", client: "Ferreira Dist.", badge: "Urgente", highlighted: step >= 2 },
        { name: "Fornecedor VIP", value: "R$ 8.750", client: "Mendes Com.", badge: "", highlighted: false },
      ],
    },
    {
      title: "Fechado",
      count: 2,
      dotColor: "bg-emerald-400",
      headerBg: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
      deals: [
        { name: "Venda Q1", value: "R$ 22.400", client: "Costa Mat.", badge: "", highlighted: step >= 3 },
        { name: "Service Pack", value: "R$ 6.800", client: "Oliveira", badge: "", highlighted: false },
      ],
    },
  ];

  return (
    <div className="flex h-full flex-col p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/15">
            <IconTrendingUp className="h-5 w-5 text-brand-400" />
          </div>
          <span className="text-sm font-semibold text-foreground">Funil de Vendas</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-lg bg-white/[0.03] px-3 py-1.5">
            <IconRefresh className="h-3.5 w-3.5 text-muted" />
            <span className="text-[11px] text-muted">Atualizar</span>
          </div>
          <div className="rounded-lg bg-brand-500 px-3 py-1.5">
            <span className="text-[11px] font-medium text-white">+ Nova Venda</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 flex-1">
        {columns.map((col) => (
          <div key={col.title} className={`rounded-xl border ${col.borderColor} bg-white/[0.01]`}>
            <div className={`flex items-center justify-between border-b ${col.borderColor} ${col.headerBg} rounded-t-xl px-3 py-2.5`}>
              <div className="flex items-center gap-2">
                <div className={`h-2.5 w-2.5 rounded-full ${col.dotColor}`} />
                <span className="text-xs font-semibold text-foreground">{col.title}</span>
              </div>
              <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-white/[0.06] px-2 text-[10px] font-bold text-muted">
                {col.count}
              </span>
            </div>
            <div className="space-y-2 p-2.5">
              {col.deals.map((deal, i) => (
                <div
                  key={i}
                  className={`rounded-xl border bg-white/[0.02] p-3 transition-all duration-500 ${
                    deal.highlighted
                      ? "border-brand-500/40 shadow-lg shadow-brand-600/20 scale-[1.02]"
                      : "border-white/[0.06] hover:border-white/[0.12]"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="text-xs font-semibold text-foreground">{deal.name}</div>
                    {deal.badge && (
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${
                        deal.badge === "Urgente" ? "bg-amber-500/15 text-amber-400" : "bg-brand-500/15 text-brand-400"
                      }`}>
                        {deal.badge}
                      </span>
                    )}
                  </div>
                  <div className="mt-1.5 text-sm font-bold text-brand-400">{deal.value}</div>
                  <div className="mt-1 text-[11px] text-muted">{deal.client}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Scene4FollowUp() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 500),
      setTimeout(() => setStep(2), 2000),
      setTimeout(() => setStep(3), 3500),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const followUps = [
    { name: "João Silva", type: "Ligação", time: "09:00", status: "Concluído", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20", icon: <IconPhone className="h-4 w-4" />, done: step >= 1 },
    { name: "Maria Santos", type: "Reunião", time: "10:30", status: "Em andamento", color: "bg-amber-500/15 text-amber-400 border-amber-500/20", icon: <IconCalendar className="h-4 w-4" />, done: step >= 2 },
    { name: "Pedro Costa", type: "WhatsApp", time: "14:00", status: "Pendente", color: "bg-brand-500/15 text-brand-400 border-brand-500/20", icon: <IconMail className="h-4 w-4" />, done: step >= 3 },
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
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/15">
            <IconCalendarCheck className="h-5 w-5 text-brand-400" />
          </div>
          <span className="text-sm font-semibold text-foreground">Central de Follow-ups</span>
        </div>
        <div className="rounded-lg bg-brand-500 px-3 py-1.5">
          <span className="text-[11px] font-medium text-white">+ Novo</span>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-4 gap-3">
        {summary.map((s) => (
          <div key={s.label} className={`rounded-xl ${s.bg} px-3 py-2.5 text-center`}>
            <div className={`text-base font-bold ${s.color}`}>{s.count}</div>
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
            <div
              key={i}
              className={`grid grid-cols-[1.5fr_0.8fr_0.6fr_1fr] items-center gap-2 px-4 py-3 transition-all duration-500 ${
                f.done ? "bg-emerald-500/5" : "bg-white/[0.01] hover:bg-white/[0.03]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                  f.done
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-gradient-to-br from-brand-500/20 to-brand-600/20 text-brand-400"
                }`}>
                  {f.done ? <IconCheck className="h-4 w-4" /> : f.name.charAt(0)}
                </div>
                <span className="text-xs font-medium text-foreground">{f.name}</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted">
                {f.icon}
                <span className="text-xs">{f.type}</span>
              </div>
              <span className="text-xs text-muted">{f.time}</span>
              <span className={`inline-flex w-fit rounded-full border px-2 py-0.5 text-[10px] font-medium ${f.color}`}>
                {f.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const scenes = [
  { id: "dashboard", label: "Dashboard", icon: <IconTarget className="h-4 w-4" />, component: Scene1Dashboard },
  { id: "clientes", label: "Clientes", icon: <IconUsers className="h-4 w-4" />, component: Scene2Clientes },
  { id: "vendas", label: "Vendas", icon: <IconTrendingUp className="h-4 w-4" />, component: Scene3Vendas },
  { id: "followup", label: "Follow-ups", icon: <IconCalendarCheck className="h-4 w-4" />, component: Scene4FollowUp },
];

export function LandingDemo() {
  const [activeScene, setActiveScene] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setActiveScene((current) => (current + 1) % scenes.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const handleSceneClick = (index: number) => {
    setActiveScene(index);
    setIsAutoPlaying(false);
  };

  const ActiveComponent = scenes[activeScene].component;

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
              Demonstração
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              Veja o{" "}
              <span className="bg-gradient-to-r from-brand-400 to-brand-300 bg-clip-text text-transparent">
                RARY CRM
              </span>{" "}
              em ação
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted">
              Navegue pelas telas e veja como é simples gerenciar sua operação.
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
                {scenes.map((scene, index) => (
                  <button
                    key={scene.id}
                    onClick={() => handleSceneClick(index)}
                    className={`relative flex items-center gap-1.5 px-5 py-3 text-xs font-medium transition-all duration-300 ${
                      activeScene === index
                        ? "text-brand-400"
                        : "text-muted/60 hover:text-muted"
                    }`}
                  >
                    {scene.icon}
                    {scene.label}
                    {activeScene === index && (
                      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-brand-500/0 via-brand-500 to-brand-500/0" />
                    )}
                  </button>
                ))}
              </div>

              <div className="h-[350px] sm:h-[420px] overflow-hidden bg-surface-1/40">
                <div key={activeScene} className="animate-fade-in h-full">
                  <ActiveComponent />
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center gap-2">
              {scenes.map((scene, index) => (
                <button
                  key={scene.id}
                  onClick={() => handleSceneClick(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    activeScene === index
                      ? "w-8 bg-brand-500"
                      : "w-2 bg-white/20 hover:bg-white/30"
                  }`}
                />
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
