"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { NewFollowUpModal } from "@/components/followup/NewFollowUpModal";
import type { FollowUp, Task } from "@/types";
import { cn, relativeLabel } from "@/lib/utils";
import { FOLLOW_UP_STATUS_LABELS, FOLLOW_UP_STATUS_TONES, TASK_STATUS_LABELS, TASK_STATUS_TONES } from "@/lib/constants";
import { IconCheck, IconRefresh, IconCheckSquare } from "@/components/icons";

export interface ClientPendingProps {
  tasks: Task[];
  followUps: FollowUp[];
  clientName: string;
  clientId: string;
}

export function ClientPending({ tasks, followUps, clientName, clientId }: ClientPendingProps) {
  const { toast } = useToast();
  const [items, setItems] = useState(tasks);
  const [followUpOpen, setFollowUpOpen] = useState(false);

  function toggle(task: Task) {
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
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader
          title="Tarefas"
          description="Pendências relacionadas ao cliente"
          action={
            <Button size="sm" onClick={() => setFollowUpOpen(true)}>
              <IconRefresh className="h-4 w-4" />
              Novo follow-up
            </Button>
          }
        />
        <CardContent className="px-2 py-2">
          {items.length === 0 ? (
            <EmptyState
              icon={<IconCheckSquare className="h-6 w-6" />}
              title="Nenhuma tarefa"
              description="Crie follow-ups e tarefas para não perder o acompanhamento."
            />
          ) : (
            <ul className="divide-y divide-border/60">
              {items.map((task) => (
                <li key={task.id} className="flex items-start gap-3 px-3 py-3">
                  <button
                    type="button"
                    onClick={() => toggle(task)}
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
                    <p className={cn("text-sm font-medium", task.completed ? "text-muted line-through" : "text-foreground")}>
                      {task.title}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      {relativeLabel(task.dueDate)} · {task.dueTime}
                    </p>
                  </div>
                  <Badge tone={TASK_STATUS_TONES[task.status]}>{TASK_STATUS_LABELS[task.status]}</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Follow-ups" description="Contatos agendados com o cliente" />
        <CardContent className="px-2 py-2">
          {followUps.length === 0 ? (
            <EmptyState
              icon={<IconRefresh className="h-6 w-6" />}
              title="Nenhum follow-up"
              description="Agende o próximo contato com este cliente."
              action={
                <Button size="sm" variant="outline" onClick={() => setFollowUpOpen(true)}>
                  Agendar follow-up
                </Button>
              }
            />
          ) : (
            <ul className="divide-y divide-border/60">
              {followUps.map((followUp) => (
                <li key={followUp.id} className="flex items-start gap-3 px-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{followUp.subject ?? followUp.type}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {relativeLabel(followUp.date)} · {followUp.time}
                    </p>
                  </div>
                  <Badge tone={FOLLOW_UP_STATUS_TONES[followUp.status]}>
                    {FOLLOW_UP_STATUS_LABELS[followUp.status]}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <NewFollowUpModal
        open={followUpOpen}
        onClose={() => setFollowUpOpen(false)}
        clientId={clientId}
        clientName={clientName}
      />
    </div>
  );
}