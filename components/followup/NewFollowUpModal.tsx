"use client";

import { useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { DatePicker } from "@/components/ui/DatePicker";
import { useToast } from "@/components/ui/Toast";
import { FOLLOW_UP_TYPE_LABELS, FOLLOW_UP_STATUS_LABELS } from "@/lib/constants";
import type { FollowUpStatus, FollowUpType } from "@/types";

export interface NewFollowUpModalProps {
  open: boolean;
  onClose: () => void;
  clientId?: string;
  clientName?: string;
}

const typeOptions = (Object.keys(FOLLOW_UP_TYPE_LABELS) as FollowUpType[]).map((type) => ({
  value: type,
  label: FOLLOW_UP_TYPE_LABELS[type],
}));

const statusOptions = (Object.keys(FOLLOW_UP_STATUS_LABELS) as FollowUpStatus[]).map((status) => ({
  value: status,
  label: FOLLOW_UP_STATUS_LABELS[status],
}));

export function NewFollowUpModal({ open, onClose, clientId, clientName }: NewFollowUpModalProps) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    // TODO: sprint seguinte — persistência real via backend.
    setTimeout(() => {
      setSaving(false);
      toast({
        title: "Follow-up agendado",
        message: clientName ? `Follow-up com ${clientName}.` : "Follow-up criado.",
        variant: "success",
      });
      onClose();
    }, 600);
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
          <Input id="fu-cliente" label="Cliente" placeholder="Buscar cliente" required />
        )}
        <div className="grid grid-cols-2 gap-4">
          <Select
            id="fu-tipo"
            label="Tipo"
            options={typeOptions}
            placeholder="Selecione"
            required
            defaultValue="LIGACAO"
          />
          <Select
            id="fu-status"
            label="Status"
            options={statusOptions}
            placeholder="Selecione"
            required
            defaultValue="HOJE"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <DatePicker id="fu-data" label="Data" required />
          <Input id="fu-hora" label="Horário" type="time" required />
        </div>
        <Textarea
          id="fu-assunto"
          label="Assunto"
          placeholder="Motivo do contato, pauta..."
          rows={3}
        />
      </form>
    </Modal>
  );
}