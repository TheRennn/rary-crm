"use client";

import { useState, useEffect, type FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { MaskedInput } from "@/components/ui/MaskedInput";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { paymentService } from "@/lib/services";
import { formatCurrency, maskCurrency, parseCurrency } from "@/lib/utils";
import { PAYMENT_STATUS_LABELS } from "@/lib/constants";
import type { Payment, PaymentStatus } from "@/types";

export interface RegisterPaymentModalProps {
  open: boolean;
  onClose: () => void;
  existingClients: { id: string; name: string }[];
  onCreated: (payment: Payment) => void;
  editPayment?: Payment | null;
}

const statusOptions = (Object.keys(PAYMENT_STATUS_LABELS) as PaymentStatus[]).map((s) => ({
  value: s,
  label: PAYMENT_STATUS_LABELS[s],
}));

const methodOptions = [
  { value: "PIX", label: "PIX" },
  { value: "Boleto", label: "Boleto" },
  { value: "Cartão", label: "Cartão" },
  { value: "Transferência", label: "Transferência" },
  { value: "Dinheiro", label: "Dinheiro" },
  { value: "Outro", label: "Outro" },
];

export function RegisterPaymentModal({ open, onClose, existingClients, onCreated, editPayment }: RegisterPaymentModalProps) {
  const { toast } = useToast();
  const isEditing = !!editPayment;
  const [clientId, setClientId] = useState("");
  const [description, setDescription] = useState("");
  const [value, setValue] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState<PaymentStatus>("PENDENTE");
  const [method, setMethod] = useState("PIX");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editPayment && open) {
      setClientId(editPayment.clientId);
      setDescription(editPayment.description);
      setValue(formatCurrency(editPayment.value));
      setDueDate(editPayment.dueDate.slice(0, 10));
      setStatus(editPayment.status);
      setMethod(editPayment.method || "PIX");
    } else if (!open) {
      reset();
    }
  }, [editPayment, open]);

  function reset() {
    setClientId("");
    setDescription("");
    setValue("");
    setDueDate("");
    setStatus("PENDENTE");
    setMethod("PIX");
    setError(null);
  }

  const clientOptions = existingClients.map((c) => ({ value: c.id, label: c.name }));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const numericValue = parseCurrency(value);

    try {
      const selectedClient = existingClients.find((c) => c.id === clientId);

      if (isEditing) {
        const updated = await paymentService.update(editPayment.id, {
          clientId,
          clientName: selectedClient?.name ?? "",
          description,
          value: numericValue,
          dueDate,
          status,
          method,
        });
        onCreated(updated);
        toast({ title: "Pagamento atualizado", message: `${updated.description} — ${formatCurrency(updated.value)}`, variant: "success" });
      } else {
        const created = await paymentService.create({
          clientId,
          clientName: selectedClient?.name ?? "",
          description,
          value: numericValue,
          dueDate,
          status,
          method,
        });
        onCreated(created);
        toast({ title: "Pagamento registrado", message: `${created.description} — ${formatCurrency(created.value)}`, variant: "success" });
      }
      reset();
      onClose();
    } catch {
      setError(isEditing ? "Não foi possível atualizar o pagamento." : "Não foi possível registrar o pagamento.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => { reset(); onClose(); }}
      title={isEditing ? "Editar pagamento" : "Novo pagamento"}
      description={isEditing ? "Atualize os dados do pagamento" : "Registre um recebimento de cliente"}
      footer={
        <>
          <Button variant="ghost" onClick={() => { reset(); onClose(); }}>Cancelar</Button>
          <Button type="submit" form="payment-form" loading={saving}>
            {isEditing ? "Salvar alterações" : "Registrar pagamento"}
          </Button>
        </>
      }
    >
      <form id="payment-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
            {error}
          </div>
        )}
        <Select
          id="pay-cliente"
          label="Cliente"
          options={clientOptions}
          placeholder="Selecione o cliente"
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          required
        />
        <Input
          id="pay-descricao"
          label="Descrição"
          placeholder="Ex.: Compra de material"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <div className="grid grid-cols-2 gap-4">
          <MaskedInput
            id="pay-valor"
            label="Valor"
            placeholder="0,00"
            mask="currency"
            value={value}
            onChange={setValue}
            required
          />
          <Input
            id="pay-vencimento"
            label="Data de vencimento"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Select
            id="pay-status"
            label="Status"
            options={statusOptions}
            value={status}
            onChange={(e) => setStatus(e.target.value as PaymentStatus)}
            required
          />
          <Select
            id="pay-metodo"
            label="Forma de pagamento"
            options={methodOptions}
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            required
          />
        </div>
      </form>
    </Modal>
  );
}
