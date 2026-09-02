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
        <div className="h-3 w-3 rounded-full border-2 border-brand-400 bg-brand-400/20 sm:h-4 sm:w-4" />
        <div className="absolute left-0.5 top-0.5 h-1.5 w-1.5 rounded-full bg-brand-400 sm:left-1 sm:top-1 sm:h-2 sm:w-2" />
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
        <div className="hidden w-44 border-r border-white/[0.06] bg-surface-2/40 p-3 xl:w-48 lg:block">
          <div className="mb-4 flex items-center gap-2.5 px-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 sm:h-8 sm:w-8">
              <IconTarget className="h-3.5 w-3.5 text-white sm:h-4 sm:w-4" />
            </div>
            <span className="text-[11px] font-semibold text-foreground sm:text-xs">RARY CRM</span>
          </div>
          <div className="space-y-0.5">
            {[
              { icon: <IconTarget className="h-3.5 w-3.5 sm:h-4 sm:w-4" />, label: "Dashboard", active: true },
              { icon: <IconUsers className="h-3.5 w-3.5 sm:h-4 sm:w-4" />, label: "Clientes", active: false },
              { icon: <IconTrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />, label: "Vendas", active: false },
              { icon: <IconCalendarCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />, label: "Follow-ups", active: false },
              { icon: <IconCreditCard className="h-3.5 w-3.5 sm:h-4 sm:w-4" />, label: "Financeiro", active: false },
              { icon: <IconCalendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />, label: "Calendário", active: false },
            ].map((item) => (
              <div
                key={item.label}
                className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[11px] transition-all duration-300 sm:py-2 sm:text-xs ${
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

        <div className="flex-1 p-3 sm:p-4 lg:p-5">
          <div className="mb-3 flex items-center justify-between sm:mb-4">
            <div>
              <h3 className="text-xs font-semibold text-foreground sm:text-sm">Bom dia, Renan!</h3>
              <p className="mt-0.5 text-[10px] text-muted sm:text-xs">Aqui está o resumo da sua operação</p>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] sm:h-8 sm:w-8">
                <IconBell className="h-3.5 w-3.5 text-muted sm:h-4 sm:w-4" />
              </div>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] sm:h-8 sm:w-8">
                <IconSettings className="h-3.5 w-3.5 text-muted sm:h-4 sm:w-4" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
            {[
              { label: "Clientes", value: "342", change: "+12%", color: "text-brand-400", bg: "bg-brand-500/10", border: "border-brand-500/20", icon: <IconUsers className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> },
              { label: "Vendas", value: "R$ 89.4k", change: "+8%", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: <IconTrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> },
              { label: "Follow-ups", value: "28", change: "5 hoje", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", icon: <IconCalendarCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> },
              { label: "Pagamentos", value: "R$ 45.2k", change: "12 pendentes", color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/20", icon: <IconCreditCard className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> },
            ].map((kpi, i) => (
              <div
                key={kpi.label}
                className={`rounded-lg border ${kpi.border} ${kpi.bg} p-2.5 transition-all duration-500 sm:rounded-xl sm:p-3 lg:p-4 ${
                  step >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                }`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-medium text-muted sm:text-[11px]">{kpi.label}</span>
                  <span className={kpi.color}>{kpi.icon}</span>
                </div>
                <div className="mt-1.5 text-base font-bold tracking-tight text-foreground sm:mt-2 sm:text-lg">{kpi.value}</div>
                <div className={`mt-0.5 text-[9px] font-medium ${kpi.color} sm:mt-1 sm:text-[10px]`}>{kpi.change}</div>
              </div>
            ))}
          </div>

          <div
            className={`mt-3 grid grid-cols-1 gap-2 sm:mt-4 sm:gap-3 lg:grid-cols-2 transition-all duration-500 ${
              step >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
          >
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 sm:rounded-xl sm:p-4">
              <div className="mb-2 flex items-center justify-between sm:mb-3">
                <span className="text-[10px] font-semibold text-foreground sm:text-xs">Atividade Recente</span>
                <span className="text-[9px] text-muted sm:text-[10px]">Últimos 7 dias</span>
              </div>
              <div className="flex items-end gap-1 sm:gap-1.5" style={{ height: "60px" }}>
                {[35, 52, 45, 68, 42, 75, 60, 48, 72, 55, 65, 80].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-sm bg-gradient-to-t from-brand-600/80 to-brand-400/80 sm:rounded-t-md"
                    style={{
                      height: `${h}%`,
                      transition: "height 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
                      transitionDelay: `${i * 50}ms`,
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 sm:rounded-xl sm:p-4">
              <span className="text-[10px] font-semibold text-foreground sm:text-xs">Próximos Follow-ups</span>
              <div className="mt-2 space-y-1.5 sm:mt-3 sm:space-y-2">
                {[
                  { name: "João Silva", time: "14:30", type: "Ligação", color: "bg-brand-500" },
                  { name: "Maria Santos", time: "16:00", type: "Reunião", color: "bg-emerald-500" },
                  { name: "Pedro Costa", time: "Amanhã", type: "WhatsApp", color: "bg-amber-500" },
                ].map((f) => (
                  <div key={f.name} className="flex items-center gap-2 rounded-lg bg-white/[0.03] px-2.5 py-2 transition-colors hover:bg-white/[0.05] sm:gap-3 sm:px-3">
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full ${f.color}/20 sm:h-8 sm:w-8`}>
                      <span className="text-[9px] font-bold text-brand-400 sm:text-[10px]">{f.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-medium text-foreground sm:text-xs">{f.name}</div>
                      <div className="text-[9px] text-muted sm:text-[10px]">{f.type}</div>
                    </div>
                    <span className="text-[9px] font-medium text-brand-400 sm:text-[10px]">{f.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {step >= 4 && (
        <div
          className="absolute transition-all duration-700"
          style={{ left: "min(180px, 40%)", top: "50%" }}
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
    { name: "João Silva", company: "Silva & Assoc.", status: "Ativo", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20", contact: "(11) 99999-1234", highlighted: true },
    { name: "Maria Santos", company: "Santos Rep.", status: "Lead", color: "bg-brand-500/15 text-brand-400 border-brand-500/20", contact: "(11) 98888-5678", highlighted: false },
    { name: "Pedro Costa", company: "Costa Materiais", status: "Ativo", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20", contact: "(11) 97777-9012", highlighted: false },
  ];

  return (
    <div className="flex h-full flex-col p-3 sm:p-4 lg:p-5">
      <div className="mb-3 flex items-center justify-between sm:mb-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500/15 sm:h-9 sm:w-9 sm:rounded-xl">
            <IconUsers className="h-3.5 w-3.5 text-brand-400 sm:h-5 sm:w-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-foreground sm:text-sm">Cadastro de Clientes</span>
            <span className="ml-1.5 rounded-full bg-brand-500/15 px-1.5 py-0.5 text-[8px] font-medium text-brand-400 sm:ml-2 sm:text-[10px]">342</span>
          </div>
        </div>
        <div className="flex gap-1.5 sm:gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2 py-1.5 sm:px-3">
            <IconFilter className="h-3 w-3 text-muted sm:h-3.5 sm:w-3.5" />
            <span className="hidden text-[10px] text-muted sm:inline sm:text-[11px]">Filtrar</span>
          </div>
          <div className="rounded-lg bg-brand-500 px-2 py-1.5 sm:px-3">
            <span className="text-[10px] font-medium text-white sm:text-[11px]">+ Novo</span>
          </div>
        </div>
      </div>

      <div className="mb-2 flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-2 sm:mb-3 sm:rounded-xl sm:px-3">
        <IconSearch className="h-3.5 w-3.5 text-muted sm:h-4 sm:w-4" />
        <span className="text-[11px] text-muted sm:text-sm">
          {searchText}
          {step >= 1 && step < 2 && <span className="ml-0.5 inline-block h-3 w-0.5 animate-pulse bg-brand-400 sm:h-4" />}
        </span>
      </div>

      <div className="flex-1 overflow-hidden rounded-lg border border-white/[0.06] sm:rounded-xl">
        <div className="hidden border-b border-white/[0.06] bg-white/[0.03] px-3 py-2.5 sm:grid sm:grid-cols-[1.5fr_1.2fr_0.7fr_1fr] sm:gap-2 sm:px-4">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">Cliente</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">Empresa</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">Status</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">Contato</span>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {clients.map((c, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 bg-white/[0.01] px-3 py-2.5 transition-all duration-500 sm:grid sm:grid-cols-[1.5fr_1.2fr_0.7fr_1fr] sm:gap-2 sm:px-4 sm:py-3 ${
                c.highlighted && step >= 2
                  ? "bg-brand-500/10 sm:border-l-2 sm:border-l-brand-500"
                  : "hover:bg-white/[0.03]"
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-brand-500/20 to-brand-600/20 text-[9px] font-bold text-brand-400 sm:h-8 sm:w-8 sm:text-xs">
                  {c.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-medium text-foreground sm:text-xs">{c.name}</span>
                  <span className="ml-1.5 text-[9px] text-muted sm:hidden">{c.company}</span>
                </div>
              </div>
              <span className="hidden text-xs text-muted sm:block">{c.company}</span>
              <span className={`inline-flex w-fit rounded-full border px-1.5 py-0.5 text-[8px] font-medium sm:px-2 sm:text-[10px] ${c.color}`}>
                {c.status}
              </span>
              <span className="text-[10px] text-muted sm:text-xs">{c.contact}</span>
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
    <div className="flex h-full flex-col p-3 sm:p-4 lg:p-5">
      <div className="mb-3 flex items-center justify-between sm:mb-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500/15 sm:h-9 sm:w-9 sm:rounded-xl">
            <IconTrendingUp className="h-3.5 w-3.5 text-brand-400 sm:h-5 sm:w-5" />
          </div>
          <span className="text-[11px] font-semibold text-foreground sm:text-sm">Funil de Vendas</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="flex items-center gap-1 rounded-lg bg-white/[0.03] px-2 py-1.5 sm:px-3">
            <IconRefresh className="h-3 w-3 text-muted sm:h-3.5 sm:w-3.5" />
            <span className="hidden text-[10px] text-muted sm:inline sm:text-[11px]">Atualizar</span>
          </div>
          <div className="rounded-lg bg-brand-500 px-2 py-1.5 sm:px-3">
            <span className="text-[10px] font-medium text-white sm:text-[11px]">+ Nova Venda</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible">
        {columns.map((col) => (
          <div key={col.title} className={`min-w-[150px] flex-shrink-0 rounded-lg border ${col.borderColor} bg-white/[0.01] sm:min-w-0`}>
            <div className={`flex items-center justify-between border-b ${col.borderColor} ${col.headerBg} rounded-t-lg px-2.5 py-2 sm:rounded-t-xl sm:px-3 sm:py-2.5`}>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className={`h-1.5 w-1.5 rounded-full ${col.dotColor} sm:h-2.5 sm:w-2.5`} />
                <span className="text-[10px] font-semibold text-foreground sm:text-xs">{col.title}</span>
              </div>
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-white/[0.06] px-1 text-[8px] font-bold text-muted sm:h-6 sm:min-w-6 sm:px-2 sm:text-[10px]">
                {col.count}
              </span>
            </div>
            <div className="space-y-1.5 p-2 sm:space-y-2 sm:p-2.5">
              {col.deals.map((deal, i) => (
                <div
                  key={i}
                  className={`rounded-md border bg-white/[0.02] p-2 transition-all duration-500 sm:rounded-xl sm:p-3 ${
                    deal.highlighted
                      ? "border-brand-500/40 shadow-lg shadow-brand-600/20 sm:scale-[1.02]"
                      : "border-white/[0.06] hover:border-white/[0.12]"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="text-[10px] font-semibold text-foreground sm:text-xs">{deal.name}</div>
                    {deal.badge && (
                      <span className={`rounded-full px-1.5 py-0.5 text-[7px] font-medium sm:px-2 sm:text-[9px] ${
                        deal.badge === "Urgente" ? "bg-amber-500/15 text-amber-400" : "bg-brand-500/15 text-brand-400"
                      }`}>
                        {deal.badge}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-[11px] font-bold text-brand-400 sm:mt-1.5 sm:text-sm">{deal.value}</div>
                  <div className="mt-0.5 text-[9px] text-muted sm:mt-1 sm:text-[11px]">{deal.client}</div>
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
    { name: "João Silva", type: "Ligação", time: "09:00", status: "Concluído", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20", icon: <IconPhone className="h-3 w-3 sm:h-4 sm:w-4" />, done: step >= 1 },
    { name: "Maria Santos", type: "Reunião", time: "10:30", status: "Em andamento", color: "bg-amber-500/15 text-amber-400 border-amber-500/20", icon: <IconCalendar className="h-3 w-3 sm:h-4 sm:w-4" />, done: step >= 2 },
    { name: "Pedro Costa", type: "WhatsApp", time: "14:00", status: "Pendente", color: "bg-brand-500/15 text-brand-400 border-brand-500/20", icon: <IconMail className="h-3 w-3 sm:h-4 sm:w-4" />, done: step >= 3 },
  ];

  const summary = [
    { label: "Hoje", count: 4, color: "text-brand-400", bg: "bg-brand-500/10" },
    { label: "Atrasados", count: 2, color: "text-red-400", bg: "bg-red-500/10" },
    { label: "Próximos", count: 8, color: "text-muted", bg: "bg-white/[0.04]" },
    { label: "Concluídos", count: 12, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  ];

  return (
    <div className="flex h-full flex-col p-3 sm:p-4 lg:p-5">
      <div className="mb-3 flex items-center justify-between sm:mb-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500/15 sm:h-9 sm:w-9 sm:rounded-xl">
            <IconCalendarCheck className="h-3.5 w-3.5 text-brand-400 sm:h-5 sm:w-5" />
          </div>
          <span className="text-[11px] font-semibold text-foreground sm:text-sm">Central de Follow-ups</span>
        </div>
        <div className="rounded-lg bg-brand-500 px-2 py-1.5 sm:px-3">
          <span className="text-[10px] font-medium text-white sm:text-[11px]">+ Novo</span>
        </div>
      </div>

      <div className="mb-3 grid grid-cols-4 gap-1.5 sm:mb-4 sm:gap-3">
        {summary.map((s) => (
          <div key={s.label} className={`rounded-lg ${s.bg} px-1.5 py-2 text-center sm:rounded-xl sm:px-3 sm:py-2.5`}>
            <div className={`text-xs font-bold ${s.color} sm:text-base`}>{s.count}</div>
            <div className="text-[8px] text-muted sm:text-[10px]">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-hidden rounded-lg border border-white/[0.06] sm:rounded-xl">
        <div className="hidden border-b border-white/[0.06] bg-white/[0.03] px-3 py-2.5 sm:grid sm:grid-cols-[1.5fr_0.8fr_0.6fr_1fr] sm:gap-2 sm:px-4">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">Cliente</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">Tipo</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">Hora</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">Status</span>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {followUps.map((f, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 bg-white/[0.01] px-3 py-2.5 transition-all duration-500 sm:grid sm:grid-cols-[1.5fr_0.8fr_0.6fr_1fr] sm:gap-2 sm:px-4 sm:py-3 ${
                f.done ? "bg-emerald-500/5" : "hover:bg-white/[0.03]"
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-bold sm:h-8 sm:w-8 sm:text-xs ${
                  f.done
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-gradient-to-br from-brand-500/20 to-brand-600/20 text-brand-400"
                }`}>
                  {f.done ? <IconCheck className="h-3 w-3 sm:h-4 sm:w-4" /> : f.name.charAt(0)}
                </div>
                <span className="text-[10px] font-medium text-foreground sm:text-xs">{f.name}</span>
              </div>
              <div className="hidden items-center gap-1.5 text-muted sm:flex">
                {f.icon}
                <span className="text-xs">{f.type}</span>
              </div>
              <span className="hidden text-xs text-muted sm:block">{f.time}</span>
              <span className={`inline-flex w-fit rounded-full border px-1.5 py-0.5 text-[8px] font-medium sm:px-2 sm:text-[10px] ${f.color}`}>
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
    <section className="relative overflow-hidden py-16 sm:py-24">
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
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-5xl">
              Veja o{" "}
              <span className="bg-gradient-to-r from-brand-400 to-brand-300 bg-clip-text text-transparent">
                RARY CRM
              </span>{" "}
              em ação
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">
              Navegue pelas telas e veja como é simples gerenciar sua operação.
            </p>
          </div>
        </Reveal>

        <Reveal delay={150} className="mt-10 sm:mt-14">
          <div className="group relative mx-auto max-w-5xl">
            <div
              aria-hidden="true"
              className="absolute -inset-4 rounded-3xl bg-gradient-to-b from-brand-500/15 via-brand-500/5 to-transparent opacity-50 blur-3xl transition-opacity duration-700 group-hover:opacity-80"
            />

            <div className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-surface-1/80 shadow-[0_20px_80px_-20px_rgba(124,58,237,0.2)] backdrop-blur-sm sm:rounded-2xl">
              <div className="hidden items-center gap-2 border-b border-white/[0.06] bg-surface-2/60 px-4 py-2.5 sm:flex">
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

              <div className="flex overflow-x-auto border-b border-white/[0.06] bg-surface-1/60 scrollbar-none">
                {scenes.map((scene, index) => (
                  <button
                    key={scene.id}
                    onClick={() => handleSceneClick(index)}
                    className={`relative flex items-center gap-1.5 whitespace-nowrap px-3 py-2.5 text-[10px] font-medium transition-all duration-300 sm:px-5 sm:text-xs ${
                      activeScene === index
                        ? "text-brand-400"
                        : "text-muted/60 hover:text-muted"
                    }`}
                  >
                    <span className="hidden sm:inline">{scene.icon}</span>
                    {scene.label}
                    {activeScene === index && (
                      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-brand-500/0 via-brand-500 to-brand-500/0" />
                    )}
                  </button>
                ))}
              </div>

              <div className="h-[280px] overflow-hidden bg-surface-1/40 sm:h-[420px]">
                <div key={activeScene} className="animate-fade-in h-full">
                  <ActiveComponent />
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-center gap-2 sm:mt-6">
              {scenes.map((scene, index) => (
                <button
                  key={scene.id}
                  onClick={() => handleSceneClick(index)}
                  className={`h-1.5 rounded-full transition-all duration-300 sm:h-2 ${
                    activeScene === index
                      ? "w-6 sm:w-8 bg-brand-500"
                      : "w-1.5 bg-white/20 hover:bg-white/30"
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
