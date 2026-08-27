"use client";

import { useState } from "react";
import { TaskBoard } from "./TaskBoard";
import { useToast } from "@/components/ui/Toast";
import { taskService } from "@/lib/services";
import type { Task, TaskStatus } from "@/types";
import type { TaskGroups } from "@/lib/services";

export interface TaskBoardClientProps {
  groups: TaskGroups;
  clients: { value: string; label: string }[];
}

function recomputeStatus(task: Task): TaskStatus {
  if (task.completed) return "CONCLUIDA";
  const now = new Date();
  const due = new Date(task.dueDate + "T" + task.dueTime);
  const diffMs = due.getTime() - now.getTime();
  const diffDays = diffMs / 86400000;
  if (diffDays < 0) return "ATRASADA";
  if (diffDays < 1) return "HOJE";
  return "PROXIMA";
}

const taskStatusToGroup: Record<TaskStatus, keyof TaskGroups> = {
  ATRASADA: "atrasadas",
  HOJE: "hoje",
  PROXIMA: "proximas",
  CONCLUIDA: "concluidas",
};

export function TaskBoardClient({ groups: initialGroups, clients }: TaskBoardClientProps) {
  const { toast } = useToast();
  const [groups, setGroups] = useState(initialGroups);

  function moveTask(task: Task, newStatus: TaskStatus) {
    const newKey = taskStatusToGroup[newStatus];
    setGroups((prev) => {
      const updated = { ...prev };
      for (const key of Object.values(taskStatusToGroup)) {
        updated[key] = updated[key].filter((t: Task) => t.id !== task.id);
      }
      updated[newKey] = [{ ...task, status: newStatus }, ...updated[newKey]];
      return updated;
    });
  }

  async function handleToggleComplete(task: Task) {
    try {
      const newCompleted = !task.completed;
      const updated = await taskService.update(task.id, { completed: newCompleted });
      const newStatus = recomputeStatus(updated);
      moveTask({ ...updated, status: newStatus }, newStatus);
      toast({ title: newCompleted ? "Tarefa concluída" : "Tarefa reaberta", message: task.title, variant: "success" });
    } catch {
      toast({ title: "Erro", message: "Não foi possível atualizar a tarefa.", variant: "error" });
    }
  }

  async function handleDelete(task: Task) {
    try {
      await taskService.delete(task.id);
      setGroups((prev) => {
        const updated = { ...prev };
        for (const key of Object.values(taskStatusToGroup)) {
          updated[key] = updated[key].filter((t: Task) => t.id !== task.id);
        }
        return updated;
      });
      toast({ title: "Tarefa excluída", message: task.title, variant: "success" });
    } catch {
      toast({ title: "Erro ao excluir", message: "Não foi possível excluir a tarefa.", variant: "error" });
    }
  }

  return (
    <TaskBoard
      groups={groups}
      clients={clients}
      onToggleComplete={handleToggleComplete}
      onDelete={handleDelete}
    />
  );
}
