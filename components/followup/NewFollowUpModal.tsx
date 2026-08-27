"use client";

import { useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { DatePicker } from "@/components/ui/DatePicker";
import { useToast } from "@/components/ui/Toast";
import { followUpService } from "@/lib/services";
import { FOLLOW_UP_TYPE_LABELS, FOLLOW_UP_STATUS_LABELS } from "@/lib/constants";
import type { FollowUpStatus, FollowUpType } from "@/types";

export interface NewFollowUpModalProps {
  open: boolean;
  onClose: () => void;
  clientId?: string;
  clientName?: string;
  onCreated?: () => void;
}

const typeOptions = (Object.keys(FOLLOW_UP_TYPE_LABELS) as FollowUpType[]).map((type) => ({
  value: type,
  label: FOLLOW_UP_TYPE_LABELS[type],
}));

const statusOptions = (Object.keys(FOLLOW_UP_STATUS_LABELS) as FollowUpStatus[]).map((status) => ({
  value: status,
  label: FOLLOW_UP_STATUS_LABELS[status],
}));

export function NewFollowUpModal({ open, onClose, clientId, clientName, onCreated }: NewFollowUpModalProps) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const type = (formData.get("fu-tipo") as FollowUpType) || "LIGACAO";
    const status = (formData.get("fu-status") as FollowUpStatus) || "HOJE";
    const date = formData.get("fu-data") as string;
    const time = formData.get("fu-hora") as string;
    const subject = formData.get("fu-assunto") as string;

    try {
      await followUpService.create({
        clientId: clientId ?? "",
        clientName: clientName ?? "",
        responsibleId: "",
        type,
        date,
        time,
        status,
        subject: subject || undefined,
      });
      toast({
        title: "Follow-up agendado",
        message: clientName ? `Follow-up com ${clientName}.` : "Follow-up criado.",
        variant: "success",
      });
      onCreated?.();
      onClose();
    } catch {
      toast({
        title: "Erro ao salvar",
        message: "Não foi possível agendar o follow-up. Tente novamente.",
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Novo follow-up"
      description={clientName ? `Cliente: ${clientName}` : "Agende o próximo contato com o cliente"}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit" form="followup-form" loading={saving}>
            Agendar follow-up
          </Button>
        </>
      }
    >
      <form id="followup-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        {!clientId && (
          <Input id="fu-cliente" name="fu-cliente" label="Cliente" placeholder="Buscar cliente" required />
        )}
        <div className="grid grid-cols-2 gap-4">
          <Select
            id="fu-tipo"
            name="fu-tipo"
            label="Tipo"
            options={typeOptions}
            placeholder="Selecione"
            required
            defaultValue="LIGACAO"
          />
          <Select
            id="fu-status"
            name="fu-status"
            label="Status"
            options={statusOptions}
            placeholder="Selecione"
            required
            defaultValue="HOJE"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <DatePicker id="fu-data" name="fu-data" label="Data" required />
          <Input id="fu-hora" name="fu-hora" label="Horário" type="time" required />
        </div>
        <Textarea
          id="fu-assunto"
          name="fu-assunto"
          label="Assunto"
          placeholder="Motivo do contato, pauta..."
          rows={3}
        />
      </form>
    </Modal>
  );
}