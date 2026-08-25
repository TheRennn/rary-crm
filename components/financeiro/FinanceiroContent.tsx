"use client";

import { useState, type ReactNode } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { PaymentsContent } from "@/components/pagamentos/PaymentsContent";
import { CommissionsContent } from "./CommissionsContent";
import { PedidosContent } from "./PedidosContent";
import { GoalsView } from "./GoalsView";
import { RegisterCommissionModal } from "./RegisterCommissionModal";
import { RegisterOrderModal } from "./RegisterOrderModal";
import { RegisterGoalModal } from "./RegisterGoalModal";
import { cn } from "@/lib/utils";
import { IconBuilding, IconUsers, IconPlus } from "@/components/icons";
import { useToast } from "@/components/ui/Toast";
import type { Commission, Goal, Order, Payment } from "@/types";
import type { PaymentStats } from "@/lib/services";

export interface FinanceiroContentProps {
  payments: Payment[];
  paymentStats: PaymentStats;
  commissions: Commission[];
  orders: Order[];
  goals: Goal[];
  clients: string[];
}

type FinanceiroProfile = "administracao" | "representante";
type AdminTab = "receber" | "metas";
type RepTab = "comissoes" | "pedidos";

const PROFILES: {
  id: FinanceiroProfile;
  label: string;
  icon: ReactNode;
  description: string;
}[] = [
  {
    id: "administracao",
    label: "Administração",
    icon: <IconBuilding className="h-3.5 w-3.5" />,
    description: "Contas a receber, metas e recebimentos dos clientes",
  },
  {
    id: "representante",
    label: "Representante",
    icon: <IconUsers className="h-3.5 w-3.5" />,
    description: "Comissões e pedidos de cada empresa representada",
  },
];

function TabToggle({
  options,
  value,
  onChange,
  label,
}: {
  options: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
  label: string;
}) {
  return (
    <div
      className="flex items-center gap-1 rounded-xl border border-border bg-surface-1 p-1"
      role="tablist"
      aria-label={label}
    >
      {options.map((option) => {
        const isActive = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.id)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
              isActive
                ? "bg-brand-500/15 text-brand-300"
                : "text-muted hover:bg-surface-2 hover:text-foreground"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function FinanceiroContent({
  payments,
  paymentStats,
  commissions: initialCommissions,
  orders: initialOrders,
  goals: initialGoals,
  clients,
}: FinanceiroContentProps) {
  const [profile, setProfile] = useState<FinanceiroProfile>("administracao");
  const [adminTab, setAdminTab] = useState<AdminTab>("receber");
  const [repTab, setRepTab] = useState<RepTab>("comissoes");
  const [commissions, setCommissions] = useState<Commission[]>(initialCommissions);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [commissionOpen, setCommissionOpen] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);
  const [goalOpen, setGoalOpen] = useState(false);
  const [editCommission, setEditCommission] = useState<Commission | null>(null);
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [editGoal, setEditGoal] = useState<Goal | null>(null);
  const { toast } = useToast();

  const active = PROFILES.find((option) => option.id === profile)!;

  const existingCompanies = Array.from(
    new Set(commissions.map((c) => c.companyName))
  );

  const currents = {
    clientes: clients.length,
    faturamento: paymentStats.received,
    vendas: orders.reduce((acc, order) => acc + order.total, 0),
  };

  const actionLabel =
    profile === "representante"
      ? repTab === "pedidos"
        ? "Adicionar pedido"
        : "Registrar comissão"
      : adminTab === "metas"
        ? "Adicionar meta"
        : "Novo recebimento";

  function handleCreate() {
    if (profile === "representante") {
      if (repTab === "pedidos") setOrderOpen(true);
      else setCommissionOpen(true);
      return;
    }
    if (adminTab === "metas") {
      setGoalOpen(true);
      return;
    }
    toast({
      title: "Novo recebimento",
      message: "Lançamento de recebimentos estará disponível no próximo sprint.",
      variant: "info",
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Financeiro"
        description={active.description}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div
              className="flex items-center gap-1 rounded-xl border border-border bg-surface-1 p-1"
              role="tablist"
              aria-label="Visão do financeiro"
            >
              {PROFILES.map((option) => {
                const isActive = option.id === profile;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setProfile(option.id)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                      isActive
                        ? "bg-brand-500/15 text-brand-300"
                        : "text-muted hover:bg-surface-2 hover:text-foreground"
                    )}
                  >
                    {option.icon}
                    <span className="hidden sm:inline">{option.label}</span>
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={handleCreate}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-surface-1 px-3 py-2 text-xs font-medium text-foreground transition-colors hover:border-brand-500/40 hover:text-brand-300"
            >
              <IconPlus className="h-3.5 w-3.5 text-brand-400" />
              {actionLabel}
            </button>
          </div>
        }
      />

      {profile === "administracao" ? (
        <div className="flex flex-col gap-4">
          <TabToggle
            label="Seção da administração"
            options={[
              { id: "receber", label: "Contas a receber" },
              { id: "metas", label: "Metas" },
            ]}
            value={adminTab}
            onChange={(id) => setAdminTab(id as AdminTab)}
          />
          {adminTab === "receber" ? (
            <PaymentsContent key="payments" payments={payments} stats={paymentStats} />
          ) : (
            <GoalsView key="goals" goals={goals} currents={currents} onEdit={(g) => { setEditGoal(g); setGoalOpen(true); }} />
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <TabToggle
            label="Seção do representante"
            options={[
              { id: "comissoes", label: "Comissões" },
              { id: "pedidos", label: "Pedidos" },
            ]}
            value={repTab}
            onChange={(id) => setRepTab(id as RepTab)}
          />
          {repTab === "comissoes" ? (
            <CommissionsContent key="commissions" commissions={commissions} onEdit={(c) => { setEditCommission(c); setCommissionOpen(true); }} />
          ) : (
            <PedidosContent key="orders" orders={orders} onEdit={(o) => { setEditOrder(o); setOrderOpen(true); }} />
          )}
        </div>
      )}

      <RegisterCommissionModal
        open={commissionOpen}
        onClose={() => { setCommissionOpen(false); setEditCommission(null); }}
        existingCompanies={existingCompanies}
        editCommission={editCommission}
        onCreated={(commission) => {
          if (editCommission) {
            setCommissions((prev) => prev.map((c) => c.id === commission.id ? commission : c));
          } else {
            setCommissions((prev) => [commission, ...prev]);
          }
          setEditCommission(null);
        }}
      />
      <RegisterOrderModal
        open={orderOpen}
        onClose={() => { setOrderOpen(false); setEditOrder(null); }}
        existingClients={clients}
        existingCompanies={existingCompanies}
        editOrder={editOrder}
        onCreated={(order) => {
          if (editOrder) {
            setOrders((prev) => prev.map((o) => o.id === order.id ? order : o));
          } else {
            setOrders((prev) => [order, ...prev]);
          }
          setEditOrder(null);
        }}
      />
      <RegisterGoalModal
        open={goalOpen}
        onClose={() => { setGoalOpen(false); setEditGoal(null); }}
        currents={currents}
        editGoal={editGoal}
        onCreated={(goal) => {
          if (editGoal) {
            setGoals((prev) => prev.map((g) => g.id === goal.id ? goal : g));
          } else {
            setGoals((prev) => [goal, ...prev]);
          }
          setEditGoal(null);
        }}
      />
    </div>
  );
}