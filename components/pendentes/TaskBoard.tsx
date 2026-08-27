"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Dropdown } from "@/components/ui/Dropdown";
import { useToast } from "@/components/ui/Toast";
import { TaskDrawer } from "./TaskDrawer";
import type { Task, TaskStatus } from "@/types";
import type { TaskGroups } from "@/lib/services";
import { cn, relativeLabel } from "@/lib/utils";
import { TASK_STATUS_LABELS, TASK_STATUS_TONES } from "@/lib/constants";
import { IconPlus, IconCheck, IconEdit, IconTrash } from "@/components/icons";

export interface TaskBoardProps {
  groups: TaskGroups;
  clients: { value: string; label: string }[];
  onDelete?: (task: Task) => void;
  onToggleComplete?: (task: Task) => void;
}

const sectionOrder: Array<{ key: keyof TaskGroups; status: TaskStatus }> = [
  { key: "atrasadas", status: "ATRASADA" },
  { key: "hoje", status: "HOJE" },
  { key: "proximas", status: "PROXIMA" },
  { key: "concluidas", status: "CONCLUIDA" },
];

export function TaskBoard({ groups, clients, onDelete, onToggleComplete }: TaskBoardProps) {
  const { toast } = useToast();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [drawerKey, setDrawerKey] = useState(0);

  function openNew() {
    setEditing(null);
    setDrawerKey((value) => value + 1);
    setDrawerOpen(true);
  }

  function openEdit(task: Task) {
    setEditing(task);
    setDrawerKey((value) => value + 1);
    setDrawerOpen(true);
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Pendentes"
        description="Central de tarefas da equipe"
        actions={
          <Button onClick={openNew}>
            <IconPlus className="h-4 w-4" />
            Nova tarefa
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {sectionOrder.map(({ key, status }) => {
          const tasks = groups[key];
          return (
            <Card key={key} className="h-fit">
              <CardHeader
                title={TASK_STATUS_LABELS[status]}
                description={`${tasks.length} tarefa(s)`}
                action={<Badge tone={TASK_STATUS_TONES[status]} dot>{tasks.length}</Badge>}
              />
              <CardContent className="px-2 py-2">
                {tasks.length === 0 ? (
                  <p className="px-3 py-6 text-center text-xs text-muted-2">
                    Nenhuma tarefa nesta categoria.
                  </p>
                ) : (
                  <ul className="flex flex-col gap-1">
                    {tasks.map((task) => (
                      <li
                        key={task.id}
                        className={cn(
                          "group rounded-lg border border-transparent px-3 py-2.5 transition-colors hover:border-border hover:bg-surface-2",
                          status === "CONCLUIDA" && "opacity-70"
                        )}
                      >
                        <div className="flex items-start gap-2.5">
                          <button
                            type="button"
                            onClick={() => onToggleComplete?.(task)}
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
                            {task.clientName && (
                              <p className="mt-0.5 text-xs text-muted-2">{task.clientName}</p>
                            )}
                          </div>
                          <Dropdown
                            align="right"
                            triggerClassName="flex h-7 w-7 items-center justify-center rounded-md opacity-0 group-hover:opacity-100 hover:bg-surface-3"
                            trigger={<span className="text-muted">•••</span>}
                            items={[
                              {
                                label: "Concluir",
                                icon: <IconCheck className="h-4 w-4" />,
                                onClick: () => onToggleComplete?.(task),
                              },
                              {
                                label: "Editar / definir prazo",
                                icon: <IconEdit className="h-4 w-4" />,
                                onClick: () => openEdit(task),
                              },
                              {
                                label: "Excluir",
                                icon: <IconTrash className="h-4 w-4" />,
                                onClick: () => onDelete?.(task),
                                danger: true,
                              },
                            ]}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="rounded-xl border border-dashed border-border bg-surface-1/40 px-5 py-4 text-xs text-muted-2">
        Dica: use o botão de três pontos para editar prazo, vincular ao cliente ou definir o
        responsável de cada tarefa.
      </div>

      <TaskDrawer
        key={drawerKey}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        task={editing}
        clients={clients}
      />
    </div>
  );
}