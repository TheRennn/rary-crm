"use client";

import { useState, useEffect, useRef, type FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { MaskedInput } from "@/components/ui/MaskedInput";
import { Select } from "@/components/ui/Select";
import { DateInput } from "@/components/ui/DateInput";
import { useToast } from "@/components/ui/Toast";
import { paymentService } from "@/lib/services";
import { formatCurrency, parseCurrency } from "@/lib/utils";
import { PAYMENT_STATUS_LABELS, PAYMENT_DIRECTION_LABELS } from "@/lib/constants";
import { createUniversalClient } from "@/lib/supabase/universal";
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

const directionOptions = (Object.keys(PAYMENT_DIRECTION_LABELS) as ("ENTRADA" | "SAIDA")[]).map((d) => ({
  value: d,
  label: PAYMENT_DIRECTION_LABELS[d],
}));

export function RegisterPaymentModal({ open, onClose, existingClients, onCreated, editPayment }: RegisterPaymentModalProps) {
  const { toast } = useToast();
  const isEditing = !!editPayment;
  const [clientId, setClientId] = useState("");
  const [description, setDescription] = useState("");
  const [value, setValue] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState<PaymentStatus>("PENDENTE");
  const [method, setMethod] = useState("PIX");
  const [direction, setDirection] = useState<"ENTRADA" | "SAIDA">("ENTRADA");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [attachmentName, setAttachmentName] = useState("");
  const [recurrent, setRecurrent] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editPayment && open) {
      setClientId(editPayment.clientId);
      setDescription(editPayment.description);
      setValue(formatCurrency(editPayment.value));
      setDueDate(editPayment.dueDate.slice(0, 10));
      setStatus(editPayment.status);
      setMethod(editPayment.method || "PIX");
      setDirection(editPayment.direction || "ENTRADA");
      setRecurrent(editPayment.recurrent ?? false);
      setAttachmentUrl(editPayment.attachmentUrl ?? "");
      setAttachmentName(editPayment.attachmentName ?? "");
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
    setDirection("ENTRADA");
    setRecurrent(false);
    setError(null);
    setAttachmentFile(null);
    setAttachmentUrl("");
    setAttachmentName("");
  }

  const clientOptions = existingClients.map((c) => ({ value: c.id, label: c.name }));

  async function uploadAttachment(): Promise<{ url: string; name: string } | null> {
    if (!attachmentFile) return null;
    try {
      const supabase = await createUniversalClient();
      const ext = attachmentFile.name.split(".").pop() ?? "bin";
      const path = `attachments/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("payments")
        .upload(path, attachmentFile);
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from("payments").getPublicUrl(path);
      return { url: urlData.publicUrl, name: attachmentFile.name };
    } catch {
      return null;
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const numericValue = parseCurrency(value);

    try {
      const selectedClient = existingClients.find((c) => c.id === clientId);

      let finalAttachmentUrl = attachmentUrl;
      let finalAttachmentName = attachmentName;

      if (attachmentFile) {
        const uploaded = await uploadAttachment();
        if (uploaded) {
          finalAttachmentUrl = uploaded.url;
          finalAttachmentName = uploaded.name;
        }
      }

      if (isEditing) {
        const updated = await paymentService.update(editPayment.id, {
          clientId,
          clientName: selectedClient?.name ?? "",
          description,
          value: numericValue,
          dueDate,
          status,
          method,
          direction,
          recurrent,
          attachmentUrl: finalAttachmentUrl || undefined,
          attachmentName: finalAttachmentName || undefined,
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
          direction,
          recurrent,
          attachmentUrl: finalAttachmentUrl || undefined,
          attachmentName: finalAttachmentName || undefined,
        });
        onCreated(created);
        toast({ title: "Pagamento registrado", message: `${created.description} — ${formatCurrency(created.value)}`, variant: "success" });

        // Auto-create next month's payment if recurrent
        if (recurrent && dueDate) {
          try {
            const nextMonth = new Date(dueDate + "T00:00:00");
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            const nextDueDate = nextMonth.toISOString().slice(0, 10);
            await paymentService.create({
              clientId,
              clientName: selectedClient?.name ?? "",
              description,
              value: numericValue,
              dueDate: nextDueDate,
              status: "PENDENTE",
              method,
              direction,
              recurrent: true,
            });
            toast({ title: "Próximo lançamento criado", message: `Vencimento: ${new Date(nextDueDate + "T00:00:00").toLocaleDateString("pt-BR")}`, variant: "info" });
          } catch {
            // Silent fail for auto-create
          }
        }
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
      title={isEditing
        ? "Editar pagamento"
        : direction === "ENTRADA" ? "Novo recebimento" : "Novo pagamento"
      }
      description={isEditing
        ? "Atualize os dados do pagamento"
        : direction === "ENTRADA" ? "Registre um recebimento de cliente" : "Registre um pagamento a ser realizado"
      }
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
          <DateInput
            id="pay-vencimento"
            label="Data de vencimento"
            value={dueDate}
            onChange={setDueDate}
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
          <Select
            id="pay-direcao"
            label="Direção"
            options={directionOptions}
            value={direction}
            onChange={(e) => setDirection(e.target.value as "ENTRADA" | "SAIDA")}
            required
          />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={recurrent}
            onChange={(e) => setRecurrent(e.target.checked)}
            className="h-4 w-4 rounded border-border-strong bg-surface-1 text-brand-500 focus:ring-2 focus:ring-brand-500/20"
          />
          <span className="text-sm text-foreground">Conta recorrente (gera lançamento automaticamente no próximo mês)</span>
        </label>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-foreground">
            Nota / Recibo / Comprovante (PDF ou imagem)
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              setAttachmentFile(file);
              if (file) setAttachmentName(file.name);
            }}
          />
          {attachmentName ? (
            <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2">
              <span className="truncate text-sm text-foreground">{attachmentName}</span>
              <button
                type="button"
                onClick={() => {
                  setAttachmentFile(null);
                  setAttachmentUrl("");
                  setAttachmentName("");
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="ml-auto text-xs text-danger hover:underline"
              >
                Remover
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full rounded-lg border border-dashed border-border bg-surface-2 px-4 py-3 text-sm text-muted transition-colors hover:border-brand-500/40 hover:text-foreground"
            >
              Clique para anexar arquivo (PDF, JPG ou PNG)
            </button>
          )}
        </div>
      </form>
    </Modal>
  );
}
