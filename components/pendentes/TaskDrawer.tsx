"use client";

import { useState, type FormEvent } from "react";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TimeInput } from "@/components/ui/TimeInput";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { DatePicker } from "@/components/ui/DatePicker";
import { useToast } from "@/components/ui/Toast";
import { taskService } from "@/lib/services";
import type { Task, TaskStatus } from "@/types";

export interface TaskDrawerProps {
  open: boolean;
  onClose: () => void;
  task: Task | null;
  clients: { value: string; label: string }[];
  onSaved?: (task: Task) => void;
}

function computeStatus(dueDate: string, dueTime: string, completed: boolean): TaskStatus {
  if (completed) return "CONCLUIDA";
  const now = new Date();
  const due = new Date(dueDate + "T" + dueTime);
  const diffMs = due.getTime() - now.getTime();
  const diffDays = diffMs / 86400000;
  if (diffDays < 0) return "ATRASADA";
  if (diffDays < 1) return "HOJE";
  return "PROXIMA";
}

export function TaskDrawer({ open, onClose, task, clients, onSaved }: TaskDrawerProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState(task?.title ?? "");
  const [dueDate, setDueDate] = useState(task ? task.dueDate.slice(0, 10) : "");
  const [dueTime, setDueTime] = useState(task?.dueTime ?? "");
  const [clientId, setClientId] = useState(task?.clientId ?? "");
  const [responsibleId, setResponsibleId] = useState(task?.responsibleId ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    try {
      if (task) {
        const updated = await taskService.update(task.id, {
          title,
          dueDate,
          dueTime,
          clientId: clientId || undefined,
          responsibleId,
          description: description || undefined,
          status: computeStatus(dueDate, dueTime, task.completed),
        });
        toast({ title: "Tarefa atualizada", message: updated.title, variant: "success" });
        onSaved?.(updated);
      } else {
        const status = computeStatus(dueDate, dueTime, false);
        const selectedClient = clients.find((c) => c.value === clientId);
        const created = await taskService.create({
          title,
          dueDate,
          dueTime,
          clientId: clientId || undefined,
          clientName: selectedClient?.label,
          responsibleId,
          description: description || undefined,
          status,
          completed: false,
        });
        toast({ title: "Tarefa criada", message: created.title, variant: "success" });
        onSaved?.(created);
      }
      onClose();
    } catch {
      toast({ title: "Erro ao salvar", message: "Não foi possível salvar a tarefa.", variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={task ? "Editar tarefa" : "Nova tarefa"}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit" form="task-form" loading={saving}>
            {task ? "Salvar alterações" : "Criar tarefa"}
          </Button>
        </>
      }
    >
      <form id="task-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          id="task-titulo"
          label="Título"
          placeholder="O que precisa ser feito?"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
        />
        <div className="grid grid-cols-2 gap-4">
          <DatePicker
            id="task-prazo"
            label="Prazo"
            value={dueDate}
            onChange={setDueDate}
            required
          />
          <TimeInput
            id="task-hora"
            label="Horário"
            value={dueTime}
            onChange={setDueTime}
            required
          />
        </div>
        <Select
          id="task-cliente"
          label="Vincular a cliente/fornecedor"
          options={clients}
          value={clientId}
          onChange={(event) => setClientId(event.target.value)}
          placeholder="Selecione um cliente ou fornecedor"
        />
        <Input
          id="task-responsavel"
          label="Responsável"
          value={responsibleId}
          onChange={(event) => setResponsibleId(event.target.value)}
          placeholder="Responsável"
        />
        <Textarea
          id="task-desc"
          label="Descrição"
          placeholder="Detalhes da tarefa..."
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={3}
        />
      </form>
    </Drawer>
  );
}