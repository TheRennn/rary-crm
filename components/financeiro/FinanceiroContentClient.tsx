"use client";

import { useState } from "react";
import { FinanceiroContent } from "./FinanceiroContent";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useToast } from "@/components/ui/Toast";
import { commissionService, orderService, recebimentoService, goalService, paymentService, productService } from "@/lib/services";
import type { Commission, Order, Recebimento, Goal, Payment, Product } from "@/types";
import type { PaymentStats, RecebimentoStats } from "@/lib/services";

export interface FinanceiroContentClientProps {
  payments: Payment[];
  paymentStats: PaymentStats;
  commissions: Commission[];
  orders: Order[];
  recebimentos: Recebimento[];
  recebimentoStats: RecebimentoStats;
  goals: Goal[];
  products: Product[];
  clients: { id: string; name: string }[];
}

type DeleteTarget =
  | { type: "commission"; item: Commission }
  | { type: "order"; item: Order }
  | { type: "recebimento"; item: Recebimento }
  | { type: "goal"; item: Goal }
  | { type: "payment"; item: Payment }
  | { type: "product"; item: Product }
  | null;

export function FinanceiroContentClient({
  payments: initialPayments,
  paymentStats,
  commissions: initialCommissions,
  orders: initialOrders,
  recebimentos: initialRecebimentos,
  recebimentoStats,
  goals: initialGoals,
  products: initialProducts,
  clients,
}: FinanceiroContentClientProps) {
  const { toast } = useToast();
  const [payments, setPayments] = useState(initialPayments);
  const [commissions, setCommissions] = useState(initialCommissions);
  const [orders, setOrders] = useState(initialOrders);
  const [recebimentos, setRecebimentos] = useState(initialRecebimentos);
  const [goals, setGoals] = useState(initialGoals);
  const [products, setProducts] = useState(initialProducts);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);
  const [deleting, setDeleting] = useState(false);

  function getDeleteInfo(target: DeleteTarget): { title: string; description: string } {
    if (!target) return { title: "", description: "" };
    switch (target.type) {
      case "commission":
        return {
          title: "Excluir comissão",
          description: `Deseja excluir a comissão de ${target.item.companyName} — ${target.item.period}?`,
        };
      case "order":
        return {
          title: "Excluir pedido",
          description: `Deseja excluir o pedido ${target.item.code} — ${target.item.clientName}?`,
        };
      case "recebimento":
        return {
          title: "Excluir recebimento",
          description: `Deseja excluir o recebimento de ${target.item.companyName} — ${target.item.product}?`,
        };
      case "goal":
        return {
          title: "Excluir meta",
          description: `Deseja excluir a meta ${target.item.targetType} — ${target.item.period}?`,
        };
      case "payment":
        return {
          title: "Excluir pagamento",
          description: `Deseja excluir o pagamento ${target.item.description} — ${target.item.clientName}?`,
        };
      case "product":
        return {
          title: "Excluir produto",
          description: `Deseja excluir o produto ${target.item.code} — ${target.item.name}?`,
        };
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      switch (deleteTarget.type) {
        case "commission":
          await commissionService.delete(deleteTarget.item.id);
          setCommissions((prev) => prev.filter((c) => c.id !== deleteTarget.item.id));
          toast({ title: "Comissão excluída", message: `${deleteTarget.item.companyName} — ${deleteTarget.item.period}`, variant: "success" });
          break;
        case "order":
          await orderService.delete(deleteTarget.item.id);
          setOrders((prev) => prev.filter((o) => o.id !== deleteTarget.item.id));
          toast({ title: "Pedido excluído", message: `${deleteTarget.item.code} — ${deleteTarget.item.clientName}`, variant: "success" });
          break;
        case "recebimento":
          await recebimentoService.delete(deleteTarget.item.id);
          setRecebimentos((prev) => prev.filter((r) => r.id !== deleteTarget.item.id));
          toast({ title: "Recebimento excluído", message: `${deleteTarget.item.companyName} — ${deleteTarget.item.product}`, variant: "success" });
          break;
        case "goal":
          await goalService.delete(deleteTarget.item.id);
          setGoals((prev) => prev.filter((g) => g.id !== deleteTarget.item.id));
          toast({ title: "Meta excluída", message: `${deleteTarget.item.targetType} — ${deleteTarget.item.period}`, variant: "success" });
          break;
        case "payment":
          await paymentService.delete(deleteTarget.item.id);
          setPayments((prev) => prev.filter((p) => p.id !== deleteTarget.item.id));
          toast({ title: "Pagamento excluído", message: `${deleteTarget.item.description} — ${deleteTarget.item.clientName}`, variant: "success" });
          break;
        case "product":
          await productService.delete(deleteTarget.item.id);
          setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.item.id));
          toast({ title: "Produto excluído", message: `${deleteTarget.item.code} — ${deleteTarget.item.name}`, variant: "success" });
          break;
      }
    } catch {
      toast({ title: "Erro ao excluir", message: "Não foi possível excluir. Tente novamente.", variant: "error" });
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  const deleteInfo = getDeleteInfo(deleteTarget);

  return (
    <>
      <FinanceiroContent
        payments={payments}
        onPaymentsChange={setPayments}
        paymentStats={paymentStats}
        commissions={commissions}
        orders={orders}
        recebimentos={recebimentos}
        recebimentoStats={recebimentoStats}
        goals={goals}
        products={products}
        clients={clients}
        onDeleteCommission={(c) => setDeleteTarget({ type: "commission", item: c })}
        onDeleteOrder={(o) => setDeleteTarget({ type: "order", item: o })}
        onDeleteRecebimento={(r) => setDeleteTarget({ type: "recebimento", item: r })}
        onDeleteGoal={(g) => setDeleteTarget({ type: "goal", item: g })}
        onDeletePayment={(p) => setDeleteTarget({ type: "payment", item: p })}
        onDeleteProduct={(p) => setDeleteTarget({ type: "product", item: p })}
      />
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title={deleteInfo.title}
        description={deleteInfo.description}
        loading={deleting}
      />
    </>
  );
}
