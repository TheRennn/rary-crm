"use client";

import { useState } from "react";
import Link from "next/link";
import { DashboardWidget } from "./DashboardWidget";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import type { Task } from "@/types";
import { cn, relativeLabel } from "@/lib/utils";
import { TASK_STATUS_LABELS, TASK_STATUS_TONES } from "@/lib/constants";
import { IconCheck } from "@/components/icons";
import { IconCheckSquare } from "@/components/icons";

export interface PendingTasksProps {
  tasks: Task[];
}

export function PendingTasks({ tasks }: PendingTasksProps) {
  const { toast } = useToast();
  const [items, setItems] = useState(tasks);
  const [justCompleted, setJustCompleted] = useState<string | null>(null);

  function toggleComplete(task: Task) {
    setItems((prev) =>
      prev
        .map((item) =>
          item.id === task.id
            ? {
                ...item,
                completed: !item.completed,
                status: item.completed
                  ? ("PROXIMA" as const)
                  : ("CONCLUIDA" as const),
              }
            : item
        )
        .sort((a, b) => Number(a.completed) - Number(b.completed))
    );

    if (!task.completed) {
      setJustCompleted(task.id);
      toast({ title: "Tarefa concluída", message: task.title });
      setTimeout(() => setJustCompleted(null), 450);
    }
  }

  return (
    <DashboardWidget
      title="Pendências"
      subtitle="Tarefas de hoje e atrasadas"
      action={
        <Link
          href="/pendentes"
          className="text-xs font-medium text-brand-300 hover:text-brand-200"
        >
          Ver todas
        </Link>
      }
    >
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
          <IconCheckSquare className="h-8 w-8 text-success" />
          <p className="text-sm font-medium text-foreground">Nada pendente</p>
          <p className="text-xs text-muted">Você está em dia com suas tarefas.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((task) => (
            <li
              key={task.id}
              className={cn(
                "group flex items-start gap-3 rounded-lg border border-border px-3 py-2.5 transition-all",
                task.completed && "opacity-60",
                justCompleted === task.id && "border-success/40 bg-success/5"
              )}
            >
              <button
                type="button"
                onClick={() => toggleComplete(task)}
                aria-label={task.completed ? "Reverter tarefa" : "Concluir tarefa"}
                className={cn(
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors",
                  task.completed
                    ? "border-success bg-success text-white"
                    : "border-border-strong hover:border-brand-500/60 hover:bg-brand-500/10"
                )}
              >
                {task.completed && (
                  <IconCheck className={cn("h-3 w-3", justCompleted === task.id && "animate-pop-check")} />
                )}
              </button>
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "text-sm font-medium",
                    task.completed ? "text-muted line-through" : "text-foreground"
                  )}
                >
                  {task.title}
                </p>
                <p className="mt-0.5 text-xs text-muted">
                  {relativeLabel(task.dueDate)} · {task.dueTime}
                  {task.clientName && <span className="text-muted-2"> · {task.clientName}</span>}
                </p>
              </div>
              <Badge tone={TASK_STATUS_TONES[task.status]}>
                {TASK_STATUS_LABELS[task.status]}
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </DashboardWidget>
  );
}