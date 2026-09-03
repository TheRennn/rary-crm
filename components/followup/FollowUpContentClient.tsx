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

function localDateStr(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function groupKeyFromDate(date: string): keyof FollowUpContentClientProps["groups"] {
  const dateStr = date.slice(0, 10);
  const todayStr = localDateStr();
  if (dateStr === todayStr) return "hoje";
  if (dateStr < todayStr) return "atrasados";
  return "proximos";
}

function sourceKey(followUp: FollowUp): keyof FollowUpContentClientProps["groups"] {
  if (followUp.status === "CONCLUIDO") return "concluidos";
  return groupKeyFromDate(followUp.date);
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

  async function handleComplete(followUp: FollowUp) {
    try {
      const isCompleting = followUp.status !== "CONCLUIDO";
      const newStatus = isCompleting ? "CONCLUIDO" : "HOJE";
      const targetKey = isCompleting ? "concluidos" : groupKeyFromDate(followUp.date);
      await followUpService.update(followUp.id, { status: newStatus });
      const fromKey = sourceKey(followUp);
      setGroups((prev) => ({
        ...prev,
        [fromKey]: prev[fromKey].filter((f) => f.id !== followUp.id),
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
      const fromKey = sourceKey(followUp);
      setGroups((prev) => ({
        ...prev,
        [fromKey]: prev[fromKey].filter((f) => f.id !== followUp.id),
      }));
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
