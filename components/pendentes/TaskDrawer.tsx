"use client";

import { useState, type FormEvent } from "react";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { DatePicker } from "@/components/ui/DatePicker";
import { useToast } from "@/components/ui/Toast";
import type { Task } from "@/types";

export interface TaskDrawerProps {
  open: boolean;
  onClose: () => void;
  task: Task | null;
  clients: { value: string; label: string }[];
  users: { value: string; label: string }[];
}

export function TaskDrawer({ open, onClose, task, clients, users }: TaskDrawerProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState(task?.title ?? "");
  const [dueDate, setDueDate] = useState(task ? task.dueDate.slice(0, 10) : "");
  const [dueTime, setDueTime] = useState(task?.dueTime ?? "");
  const [clientId, setClientId] = useState(task?.clientId ?? "");
  const [responsibleId, setResponsibleId] = useState(task?.responsibleId ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [saving, setSaving] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast({
        title: task ? "Tarefa atualizada" : "Tarefa criada",
        message: title,
        variant: "success",
      });
      onClose();
    }, 600);
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
            onChange={(event) => setDueDate(event.target.value)}
            required
          />
          <Input
            id="task-hora"
            label="Horário"
            type="time"
            value={dueTime}
            onChange={(event) => setDueTime(event.target.value)}
            required
          />
        </div>
        <Select
          id="task-cliente"
          label="Vincular ao cliente"
          options={clients}
          value={clientId}
          onChange={(event) => setClientId(event.target.value)}
          placeholder="Nenhum cliente"
        />
        <Select
          id="task-responsavel"
          label="Responsável"
          options={users}
          value={responsibleId}
          onChange={(event) => setResponsibleId(event.target.value)}
          placeholder="Selecione o responsável"
          required
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