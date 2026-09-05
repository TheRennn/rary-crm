"use client";

import { useState, type ReactNode } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { PaymentsContent } from "@/components/pagamentos/PaymentsContent";
import { RegisterPaymentModal } from "@/components/pagamentos/RegisterPaymentModal";
import { RepresentanteContent } from "./RepresentanteContent";
import { GoalsView } from "./GoalsView";
import { ProductsContent } from "./ProductsContent";
import { RegisterCommissionModal } from "./RegisterCommissionModal";
import { RegisterOrderModal } from "./RegisterOrderModal";
import { RegisterRecebimentoModal } from "./RegisterRecebimentoModal";
import { RegisterGoalModal } from "./RegisterGoalModal";
import { RegisterProductModal } from "./RegisterProductModal";
import { cn } from "@/lib/utils";
import { IconBuilding, IconUsers, IconPlus } from "@/components/icons";
import type { Commission, Goal, Order, Payment, Product, Recebimento } from "@/types";
import type { PaymentStats, RecebimentoStats } from "@/lib/services";

export interface FinanceiroContentProps {
  payments: Payment[];
  onPaymentsChange?: (payments: Payment[] | ((prev: Payment[]) => Payment[])) => void;
  paymentStats: PaymentStats;
  commissions: Commission[];
  orders: Order[];
  recebimentos: Recebimento[];
  recebimentoStats: RecebimentoStats;
  goals: Goal[];
  products: Product[];
  clients: { id: string; name: string }[];
  onDeleteCommission?: (commission: Commission) => void;
  onDeleteOrder?: (order: Order) => void;
  onDeleteRecebimento?: (recebimento: Recebimento) => void;
  onDeleteGoal?: (goal: Goal) => void;
  onDeletePayment?: (payment: Payment) => void;
  onDeleteProduct?: (product: Product) => void;
}

type FinanceiroProfile = "administracao" | "representante";
type AdminTab = "receber" | "pagar" | "metas" | "produtos";

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
    description: "Contas a receber, metas e produtos",
  },
  {
    id: "representante",
    label: "Representante",
    icon: <IconUsers className="h-3.5 w-3.5" />,
    description: "Comissões, pedidos e recebimentos integrados",
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
  onPaymentsChange,
  paymentStats,
  commissions: initialCommissions,
  orders: initialOrders,
  recebimentos: initialRecebimentos,
  recebimentoStats,
  goals: initialGoals,
  products: initialProducts,
  clients,
  onDeleteCommission,
  onDeleteOrder,
  onDeleteRecebimento,
  onDeleteGoal,
  onDeletePayment,
  onDeleteProduct,
}: FinanceiroContentProps) {
  const [profile, setProfile] = useState<FinanceiroProfile>("administracao");
  const [adminTab, setAdminTab] = useState<AdminTab>("receber");
  const [commissions, setCommissions] = useState<Commission[]>(initialCommissions);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [recebimentos, setRecebimentos] = useState<Recebimento[]>(initialRecebimentos);
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [commissionOpen, setCommissionOpen] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);
  const [recebimentoOpen, setRecebimentoOpen] = useState(false);
  const [goalOpen, setGoalOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentDirection, setPaymentDirection] = useState<"ENTRADA" | "SAIDA">("ENTRADA");
  const [productOpen, setProductOpen] = useState(false);
  const [editCommission, setEditCommission] = useState<Commission | null>(null);
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [editRecebimento, setEditRecebimento] = useState<Recebimento | null>(null);
  const [editGoal, setEditGoal] = useState<Goal | null>(null);
  const [editPayment, setEditPayment] = useState<Payment | null>(null);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  const active = PROFILES.find((option) => option.id === profile)!;

  const existingCompanies = Array.from(
    new Set([
      ...commissions.map((c) => c.companyName),
      ...orders.map((o) => o.companyName),
      ...recebimentos.map((r) => r.companyName),
    ])
  );

  const currents = {
    clientes: clients.length,
    faturamento: paymentStats.received,
    vendas: orders.reduce((acc, order) => acc + order.total, 0),
  };

  const actionLabel =
    profile === "representante"
      ? "Novo pagamento"
      : adminTab === "metas"
        ? "Adicionar meta"
        : adminTab === "produtos"
          ? "Cadastrar produto"
          : adminTab === "pagar"
            ? "Novo pagamento"
            : "Novo recebimento";

  function handleCreate() {
    if (profile === "representante") {
      setPaymentDirection("SAIDA");
      setPaymentOpen(true);
      return;
    }
    if (adminTab === "metas") {
      setGoalOpen(true);
      return;
    }
    if (adminTab === "produtos") {
      setProductOpen(true);
      return;
    }
    if (adminTab === "pagar") {
      setPaymentDirection("SAIDA");
      setPaymentOpen(true);
      return;
    }
    setPaymentDirection("ENTRADA");
    setPaymentOpen(true);
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
              { id: "pagar", label: "Contas a pagar" },
              { id: "metas", label: "Metas" },
              { id: "produtos", label: "Produtos" },
            ]}
            value={adminTab}
            onChange={(id) => setAdminTab(id as AdminTab)}
          />
          {adminTab === "receber" ? (
            <PaymentsContent key="payments" payments={payments.filter((p) => p.direction === "ENTRADA")} stats={paymentStats} onDelete={onDeletePayment} onEdit={(p) => { setEditPayment(p); setPaymentOpen(true); }} />
          ) : adminTab === "pagar" ? (
            <PaymentsContent key="payables" payments={payments.filter((p) => p.direction === "SAIDA")} stats={paymentStats} onDelete={onDeletePayment} onEdit={(p) => { setEditPayment(p); setPaymentOpen(true); }} />
          ) : adminTab === "metas" ? (
            <GoalsView key="goals" goals={goals} currents={currents} onEdit={(g) => { setEditGoal(g); setGoalOpen(true); }} onDelete={onDeleteGoal} />
          ) : (
            <ProductsContent key="products" products={products} onEdit={(p) => { setEditProduct(p); setProductOpen(true); }} onDelete={onDeleteProduct} />
          )}
        </div>
      ) : (
        <RepresentanteContent
          commissions={commissions}
          orders={orders}
          recebimentos={recebimentos}
          existingCompanies={existingCompanies}
          onEditCommission={(c) => { setEditCommission(c); setCommissionOpen(true); }}
          onEditOrder={(o) => { setEditOrder(o); setOrderOpen(true); }}
          onEditRecebimento={(r) => { setEditRecebimento(r); setRecebimentoOpen(true); }}
          onDeleteCommission={onDeleteCommission}
          onDeleteOrder={onDeleteOrder}
          onDeleteRecebimento={onDeleteRecebimento}
        />
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
        existingClients={clients.map((c) => c.name)}
        existingCompanies={existingCompanies}
        products={products}
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
      <RegisterRecebimentoModal
        open={recebimentoOpen}
        onClose={() => { setRecebimentoOpen(false); setEditRecebimento(null); }}
        clients={clients}
        existingCompanies={existingCompanies}
        editRecebimento={editRecebimento}
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
      <RegisterPaymentModal
        open={paymentOpen}
        onClose={() => { setPaymentOpen(false); setEditPayment(null); }}
        existingClients={clients}
        editPayment={editPayment}
        defaultDirection={paymentDirection}
        onCreated={(payment) => {
          if (onPaymentsChange) {
            if (editPayment) {
              onPaymentsChange((prev) => prev.map((p) => p.id === payment.id ? payment : p));
            } else {
              onPaymentsChange((prev) => [payment, ...prev]);
            }
          }
          setPaymentOpen(false);
          setEditPayment(null);
        }}
      />
      <RegisterProductModal
        open={productOpen}
        onClose={() => { setProductOpen(false); setEditProduct(null); }}
        existingCompanies={existingCompanies}
        editProduct={editProduct}
        onCreated={(product) => {
          if (editProduct) {
            setProducts((prev) => prev.map((p) => p.id === product.id ? product : p));
          } else {
            setProducts((prev) => [product, ...prev]);
          }
          setEditProduct(null);
        }}
      />
    </div>
  );
}
