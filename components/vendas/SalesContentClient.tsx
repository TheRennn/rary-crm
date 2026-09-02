"use client";

import { useEffect, useState } from "react";
import { SalesContent } from "./SalesContent";
import { useToast } from "@/components/ui/Toast";
import { dealService } from "@/lib/services";
import type { Deal } from "@/types";

export interface SalesContentClientProps {
  deals: Deal[];
  stats: import("@/lib/services").DealStats;
  clientNames: Record<string, string>;
  clients: { id: string; name: string; code: string }[];
  currentUserId: string;
}

export function SalesContentClient({
  deals: initialDeals,
  stats,
  clientNames,
  clients,
  currentUserId,
}: SalesContentClientProps) {
  const { toast } = useToast();
  const [deals, setDeals] = useState(initialDeals);

  useEffect(() => {
    setDeals(initialDeals);
  }, [initialDeals]);

  async function handleDelete(deal: Deal) {
    try {
      await dealService.delete(deal.id);
      setDeals((prev) => prev.filter((d) => d.id !== deal.id));
      toast({
        title: "Venda excluída",
        message: `${deal.code} — ${deal.product} foi removida.`,
        variant: "success",
      });
    } catch {
      toast({
        title: "Erro ao excluir",
        message: "Não foi possível excluir a venda. Tente novamente.",
        variant: "error",
      });
    }
  }

  return (
    <SalesContent
      deals={deals}
      stats={stats}
      clientNames={clientNames}
      clients={clients}
      currentUserId={currentUserId}
      onDelete={handleDelete}
    />
  );
}
