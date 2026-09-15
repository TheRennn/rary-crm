"use client";

import { useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { TimeInput } from "@/components/ui/TimeInput";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { DatePicker } from "@/components/ui/DatePicker";
import { useToast } from "@/components/ui/Toast";
import { followUpService } from "@/lib/services";
import { FOLLOW_UP_TYPE_LABELS } from "@/lib/constants";
import type { FollowUpType } from "@/types";

export interface NewFollowUpModalProps {
  open: boolean;
  onClose: () => void;
  clientId?: string;
  clientName?: string;
  clients?: { id: string; name: string; code: string }[];
  onCreated?: () => void;
}

const typeOptions = (Object.keys(FOLLOW_UP_TYPE_LABELS) as FollowUpType[]).map((type) => ({
  value: type,
  label: FOLLOW_UP_TYPE_LABELS[type],
}));

export function NewFollowUpModal({ open, onClose, clientId, clientName, clients = [], onCreated }: NewFollowUpModalProps) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState(clientId ?? "");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const type = (formData.get("fu-tipo") as FollowUpType) || "LIGACAO";
    const date = formData.get("fu-data") as string;
    const time = formData.get("fu-hora") as string;
    const subject = formData.get("fu-assunto") as string;
    const finalClientId = clientId || selectedClientId;
    const selectedClient = clients.find((c) => c.id === finalClientId);
    const clientNameStr = clientName || selectedClient?.name || "";

    try {
      await followUpService.create({
        clientId: finalClientId,
        clientName: clientNameStr,
        responsibleId: "",
        type,
        date,
        time,
        status: "PROXIMO",
        subject: subject || undefined,
      });
      toast({
        title: "Follow-up agendado",
        message: clientNameStr ? `Follow-up com ${clientNameStr}.` : "Follow-up criado.",
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
        <Select
          id="fu-cliente"
          name="fu-cliente"
          label="Cliente"
          options={clients.map((c) => ({ value: c.id, label: `${c.code} — ${c.name}` }))}
          placeholder="Selecione o cliente"
          value={selectedClientId}
          onChange={(e) => setSelectedClientId(e.target.value)}
          required
        />
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
          <div />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <DatePicker id="fu-data" name="fu-data" label="Data" required />
          <TimeInput id="fu-hora" name="fu-hora" label="Horário" required />
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