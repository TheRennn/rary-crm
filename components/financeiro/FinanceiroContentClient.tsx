"use client";

import { useState } from "react";
import { FinanceiroContent } from "./FinanceiroContent";
import { useToast } from "@/components/ui/Toast";
import { commissionService, orderService, goalService, paymentService } from "@/lib/services";
import type { Commission, Order, Goal, Payment } from "@/types";
import type { PaymentStats } from "@/lib/services";

export interface FinanceiroContentClientProps {
  payments: Payment[];
  paymentStats: PaymentStats;
  commissions: Commission[];
  orders: Order[];
  goals: Goal[];
  clients: string[];
}

export function FinanceiroContentClient({
  payments: initialPayments,
  paymentStats,
  commissions: initialCommissions,
  orders: initialOrders,
  goals: initialGoals,
  clients,
}: FinanceiroContentClientProps) {
  const { toast } = useToast();
  const [payments] = useState(initialPayments);
  const [commissions, setCommissions] = useState(initialCommissions);
  const [orders, setOrders] = useState(initialOrders);
  const [goals, setGoals] = useState(initialGoals);

  async function handleDeleteCommission(commission: Commission) {
    try {
      await commissionService.delete(commission.id);
      setCommissions((prev) => prev.filter((c) => c.id !== commission.id));
      toast({ title: "Comissão excluída", message: `${commission.companyName} — ${commission.period}`, variant: "success" });
    } catch {
      toast({ title: "Erro ao excluir", message: "Não foi possível excluir a comissão.", variant: "error" });
    }
  }

  async function handleDeleteOrder(order: Order) {
    try {
      await orderService.delete(order.id);
      setOrders((prev) => prev.filter((o) => o.id !== order.id));
      toast({ title: "Pedido excluído", message: `${order.code} — ${order.clientName}`, variant: "success" });
    } catch {
      toast({ title: "Erro ao excluir", message: "Não foi possível excluir o pedido.", variant: "error" });
    }
  }

  async function handleDeleteGoal(goal: Goal) {
    try {
      await goalService.delete(goal.id);
      setGoals((prev) => prev.filter((g) => g.id !== goal.id));
      toast({ title: "Meta excluída", message: `${goal.targetType} — ${goal.period}`, variant: "success" });
    } catch {
      toast({ title: "Erro ao excluir", message: "Não foi possível excluir a meta.", variant: "error" });
    }
  }

  async function handleDeletePayment(payment: Payment) {
    try {
      await paymentService.delete(payment.id);
      toast({ title: "Pagamento excluído", message: `${payment.description} — ${payment.clientName}`, variant: "success" });
    } catch {
      toast({ title: "Erro ao excluir", message: "Não foi possível excluir o pagamento.", variant: "error" });
    }
  }

  return (
    <FinanceiroContent
      payments={payments}
      paymentStats={paymentStats}
      commissions={commissions}
      orders={orders}
      goals={goals}
      clients={clients}
      onDeleteCommission={handleDeleteCommission}
      onDeleteOrder={handleDeleteOrder}
      onDeleteGoal={handleDeleteGoal}
      onDeletePayment={handleDeletePayment}
    />
  );
}
