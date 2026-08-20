"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import type { Task } from "@/types";
import { cn, relativeLabel } from "@/lib/utils";
import { TASK_STATUS_LABELS, TASK_STATUS_TONES, ROUTES } from "@/lib/constants";
import { IconCheck } from "@/components/icons";
import { IconCheckSquare } from "@/components/icons";

export interface PendingTasksProps {
  tasks: Task[];
}

export function PendingTasks({ tasks }: PendingTasksProps) {
  const { toast } = useToast();
  const [items, setItems] = useState(tasks);

  function toggleComplete(task: Task) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === task.id
          ? { ...item, completed: !item.completed, status: item.completed ? task.status : "CONCLUIDA" }
          : item
      )
    );
    if (!task.completed) {
      toast({ title: "Tarefa concluída", message: task.title });
    }
  }

  return (
    <Card>
      <CardHeader
        title="Pendências"
        description="Tarefas atrasadas e do dia"
        action={
          <Link
            href={ROUTES.pendentes}
            className="text-xs font-medium text-brand-400 hover:text-brand-300"
          >
            Ver todas
          </Link>
        }
      />
      <CardContent className="px-2 py-2">
        {items.length === 0 ? (
          <EmptyState
            icon={<IconCheckSquare className="h-6 w-6" />}
            title="Nada pendente"
            description="Você está em dia com suas tarefas."
          />
        ) : (
          <ul className="divide-y divide-border/60">
            {items.map((task) => (
              <li key={task.id} className="flex items-start gap-3 px-3 py-3">
                <button
                  type="button"
                  onClick={() => toggleComplete(task)}
                  aria-label={task.completed ? "Reverter tarefa" : "Concluir tarefa"}
                  className={cn(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors",
                    task.completed
                      ? "border-brand-500 bg-brand-500 text-white"
                      : "border-border-strong hover:border-brand-500/60"
                  )}
                >
                  {task.completed && <IconCheck className="h-3 w-3" />}
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
      </CardContent>
    </Card>
  );
}