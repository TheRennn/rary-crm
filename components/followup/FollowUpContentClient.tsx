"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FollowUpContent } from "./FollowUpContent";
import { useToast } from "@/components/ui/Toast";
import { followUpService } from "@/lib/services";
import type { FollowUp } from "@/types";

export interface FollowUpContentClientProps {
  groups: {
    hoje: FollowUp[];
    atrasados: FollowUp[];
    proximos: FollowUp[];
    concluidos: FollowUp[];
  };
}

export function FollowUpContentClient({ groups: initialGroups }: FollowUpContentClientProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [groups, setGroups] = useState(initialGroups);
  const [prevInitial, setPrevInitial] = useState(initialGroups);

  if (prevInitial !== initialGroups) {
    setPrevInitial(initialGroups);
    setGroups(initialGroups);
  }

  const refresh = useCallback(() => {
    router.refresh();
  }, [router]);

  const followUpStatusToGroup: Record<FollowUp["status"], keyof FollowUpContentClientProps["groups"]> = {
    HOJE: "hoje",
    ATRASADO: "atrasados",
    PROXIMO: "proximos",
    CONCLUIDO: "concluidos",
  };

  function groupKeyFromDate(date: string): keyof FollowUpContentClientProps["groups"] {
    const todayStr = new Date().toISOString().slice(0, 10);
    const dateStr = date.slice(0, 10);
    if (dateStr === todayStr) return "hoje";
    if (dateStr < todayStr) return "atrasados";
    return "proximos";
  }

  function updateGroup(status: FollowUp["status"], updater: (items: FollowUp[]) => FollowUp[]) {
    const key = followUpStatusToGroup[status];
    setGroups((prev) => ({ ...prev, [key]: updater(prev[key]) }));
  }

  async function handleComplete(followUp: FollowUp) {
    try {
      const isCompleting = followUp.status !== "CONCLUIDO";
      const newStatus = isCompleting ? "CONCLUIDO" : "HOJE";
      const targetKey = isCompleting ? "concluidos" : groupKeyFromDate(followUp.date);
      await followUpService.update(followUp.id, { status: newStatus });
      updateGroup(followUp.status, (items) => items.filter((f) => f.id !== followUp.id));
      setGroups((prev) => ({
        ...prev,
        [targetKey]: [{ ...followUp, status: newStatus }, ...prev[targetKey]],
      }));
      toast({ title: isCompleting ? "Follow-up concluído" : "Follow-up reaberto", message: followUp.clientName, variant: "success" });
    } catch {
      toast({ title: "Erro", message: "Não foi possível atualizar o follow-up.", variant: "error" });
    }
  }

  async function handleDelete(followUp: FollowUp) {
    try {
      await followUpService.delete(followUp.id);
      updateGroup(followUp.status, (items) => items.filter((f) => f.id !== followUp.id));
      toast({ title: "Follow-up excluído", message: followUp.clientName, variant: "success" });
    } catch {
      toast({ title: "Erro ao excluir", message: "Não foi possível excluir o follow-up.", variant: "error" });
    }
  }

  return (
    <FollowUpContent
      groups={groups}
      onComplete={handleComplete}
      onDelete={handleDelete}
      onRefresh={refresh}
    />
  );
}
