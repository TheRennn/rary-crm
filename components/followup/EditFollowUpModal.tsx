"use client";

import { useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { TimeInput } from "@/components/ui/TimeInput";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { DatePicker } from "@/components/ui/DatePicker";
import { useToast } from "@/components/ui/Toast";
import { followUpService } from "@/lib/services";
import { FOLLOW_UP_TYPE_LABELS } from "@/lib/constants";
import type { FollowUp, FollowUpType } from "@/types";

export interface EditFollowUpModalProps {
  open: boolean;
  followUp: FollowUp | null;
  onClose: () => void;
  onUpdated?: () => void;
}

const typeOptions = (Object.keys(FOLLOW_UP_TYPE_LABELS) as FollowUpType[]).map((type) => ({
  value: type,
  label: FOLLOW_UP_TYPE_LABELS[type],
}));

function initFromFollowUp(fu: FollowUp) {
  return {
    tipo: fu.type,
    date: fu.date.slice(0, 10),
    time: fu.time,
    subject: fu.subject ?? "",
  };
}

export function EditFollowUpModal({ open, followUp, onClose, onUpdated }: EditFollowUpModalProps) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [tipo, setTipo] = useState<FollowUpType>(followUp?.type ?? "LIGACAO");
  const [date, setDate] = useState(followUp?.date.slice(0, 10) ?? "");
  const [time, setTime] = useState(followUp?.time ?? "");
  const [subject, setSubject] = useState(followUp?.subject ?? "");
  const [prevFollowUp, setPrevFollowUp] = useState(followUp);

  if (followUp && prevFollowUp !== followUp) {
    setPrevFollowUp(followUp);
    const init = initFromFollowUp(followUp);
    setTipo(init.tipo);
    setDate(init.date);
    setTime(init.time);
    setSubject(init.subject);
  }

  if (!followUp) return null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!followUp) return;
    setSaving(true);

    try {
      await followUpService.update(followUp.id, {
        type: tipo,
        date,
        time,
        subject: subject || undefined,
      });
      toast({
        title: "Follow-up atualizado",
        message: followUp.clientName,
        variant: "success",
      });
      onUpdated?.();
      onClose();
    } catch {
      toast({
        title: "Erro ao atualizar",
        message: "Não foi possível atualizar o follow-up.",
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
      title="Editar follow-up"
      description={followUp.clientName}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit" form="edit-followup-form" loading={saving}>
            Salvar alterações
          </Button>
        </>
      }
    >
      <form id="edit-followup-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Select
          id="edit-tipo"
          name="edit-tipo"
          label="Tipo"
          options={typeOptions}
          placeholder="Selecione"
          required
          value={tipo}
          onChange={(e) => setTipo(e.target.value as FollowUpType)}
        />
        <div className="grid grid-cols-2 gap-4">
          <DatePicker id="edit-data" name="edit-data" label="Data" required value={date} onChange={setDate} />
          <TimeInput id="edit-hora" name="edit-hora" label="Horário" required value={time} onChange={setTime} />
        </div>
        <Input
          id="edit-assunto"
          name="edit-assunto"
          label="Assunto"
          placeholder="Motivo do contato, pauta..."
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
      </form>
    </Modal>
  );
}
