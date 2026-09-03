"use client";

import { useState, useEffect, useMemo, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { MaskedInput } from "@/components/ui/MaskedInput";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { DateInput } from "@/components/ui/DateInput";
import { useToast } from "@/components/ui/Toast";
import { recebimentoService } from "@/lib/services";
import { PAYMENT_STATUS_LABELS } from "@/lib/constants";
import type { Recebimento, PaymentStatus, EntryType } from "@/types";
import { parseCurrency, formatCurrency, cn } from "@/lib/utils";

export interface RegisterRecebimentoModalProps {
  open: boolean;
  onClose: () => void;
  clients: { id: string; name: string }[];
  existingCompanies: string[];
  currentUserId?: string;
  editRecebimento?: Recebimento | null;
}

const paymentOptions = (Object.keys(PAYMENT_STATUS_LABELS) as PaymentStatus[]).map((s) => ({
  value: s,
  label: PAYMENT_STATUS_LABELS[s],
}));

export function RegisterRecebimentoModal({
  open,
  onClose,
  clients,
  existingCompanies,
  currentUserId,
  editRecebimento,
}: RegisterRecebimentoModalProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const isEditing = !!editRecebimento;

  const [clientId, setClientId] = useState("");
  const [clientName, setClientName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [product, setProduct] = useState("");
  const [description, setDescription] = useState("");
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<PaymentStatus>("PENDENTE");
  const [date, setDate] = useState("");

  const [entryEnabled, setEntryEnabled] = useState(false);
  const [entryValue, setEntryValue] = useState("");
  const [entryType, setEntryType] = useState<EntryType>("FIXO");
  const [shippingEnabled, setShippingEnabled] = useState(false);
  const [shippingValue, setShippingValue] = useState("");
  const [installments, setInstallments] = useState(1);

  useEffect(() => {
    if (editRecebimento && open) {
      setClientId(editRecebimento.clientId ?? "");
      setClientName(editRecebimento.clientName);
      setCompanyName(editRecebimento.companyName);
      setProduct(editRecebimento.product);
      setDescription(editRecebimento.description ?? "");
      setValue(editRecebimento.value > 0 ? editRecebimento.value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "");
      setStatus(editRecebimento.status);
      setDate(editRecebimento.date ?? "");
      setEntryEnabled(editRecebimento.entryEnabled);
      setEntryValue(editRecebimento.entryValue ? editRecebimento.entryValue.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "");
      setEntryType(editRecebimento.entryType ?? "FIXO");
      setShippingEnabled(editRecebimento.shippingEnabled);
      setShippingValue(editRecebimento.shippingValue ? editRecebimento.shippingValue.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "");
      setInstallments(editRecebimento.installments ?? 1);
    } else if (!open) {
      setClientId("");
      setClientName("");
      setCompanyName("");
      setProduct("");
      setDescription("");
      setValue("");
      setStatus("PENDENTE");
      setDate("");
      setEntryEnabled(false);
      setEntryValue("");
      setEntryType("FIXO");
      setShippingEnabled(false);
      setShippingValue("");
      setInstallments(1);
    }
  }, [editRecebimento, open]);

  const totalValue = parseCurrency(value);
  const entryAmount = useMemo(() => {
    if (!entryEnabled) return 0;
    const raw = parseCurrency(entryValue);
    if (entryType === "PERCENTUAL") {
      return Math.round((totalValue * raw) / 100 * 100) / 100;
    }
    return raw;
  }, [entryEnabled, entryValue, entryType, totalValue]);
  const shippingAmount = shippingEnabled ? parseCurrency(shippingValue) : 0;
  const finalValue = Math.max(0, totalValue - entryAmount - shippingAmount);
  const installmentValue = installments > 1 ? Math.round((finalValue / installments) * 100) / 100 : finalValue;

  const clientOptions = clients.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const data = {
        clientId: clientId || undefined,
        clientName,
        responsibleId: currentUserId || undefined,
        companyName,
        product,
        description: description || undefined,
        value: totalValue,
        entryEnabled,
        entryType: entryEnabled ? entryType : undefined,
        entryValue: entryEnabled ? entryAmount : undefined,
        shippingEnabled,
        shippingValue: shippingEnabled ? shippingAmount : undefined,
        installments,
        installmentValue,
        finalValue,
        status,
        date: date || undefined,
      };

      if (isEditing) {
        await recebimentoService.update(editRecebimento.id, data);
        toast({
          title: "Recebimento atualizado",
          message: `${product} atualizado com sucesso.`,
          variant: "success",
        });
      } else {
        await recebimentoService.create(data);
        toast({
          title: "Recebimento registrado",
          message: `${product} cadastrado com sucesso.`,
          variant: "success",
        });
      }
      router.refresh();
      handleClose();
    } catch (err) {
      console.error("Erro ao salvar recebimento:", err);
      toast({
        title: "Erro ao salvar",
        message: isEditing
          ? "Não foi possível atualizar o recebimento. Tente novamente."
          : "Não foi possível registrar o recebimento. Tente novamente.",
        variant: "error",
      });
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    setClientId("");
    setClientName("");
    setCompanyName("");
    setProduct("");
    setDescription("");
    setValue("");
    setStatus("PENDENTE");
    setDate("");
    setEntryEnabled(false);
    setEntryValue("");
    setEntryType("FIXO");
    setShippingEnabled(false);
    setShippingValue("");
    setInstallments(1);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isEditing ? "Editar recebimento" : "Novo recebimento"}
      description={isEditing ? "Atualize os dados do recebimento" : "Registre um novo recebimento"}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={submitting} form="recebimento-form">
            {isEditing ? "Salvar alterações" : "Salvar recebimento"}
          </Button>
        </>
      }
    >
      <form id="recebimento-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            id="rec-empresa"
            label="Empresa representada"
            placeholder="Nome da empresa"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
            list="rec-empresa-list"
          />
          <datalist id="rec-empresa-list">
            {existingCompanies.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>

          <Input
            id="rec-cliente-nome"
            label="Cliente"
            placeholder="Nome do cliente"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            id="rec-produto"
            label="Produto / Serviço"
            placeholder="Nome do produto ou serviço"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            required
          />
          <DateInput
            id="rec-data"
            label="Data"
            value={date}
            onChange={setDate}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <MaskedInput
            id="rec-valor"
            mask="currency"
            label="Valor (R$)"
            placeholder="0,00"
            value={value}
            onChange={setValue}
            required
          />
          <Select
            id="rec-status"
            label="Status"
            options={paymentOptions}
            value={status}
            onChange={(e) => setStatus(e.target.value as PaymentStatus)}
            required
          />
        </div>

        <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface-2 p-4">
          <div className="flex items-center gap-3">
            <input
              id="rec-entry-toggle"
              type="checkbox"
              checked={entryEnabled}
              onChange={(e) => { setEntryEnabled(e.target.checked); setEntryValue(""); }}
              className="h-4 w-4 rounded border-border-strong bg-surface-1 text-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
            <label htmlFor="rec-entry-toggle" className="text-sm font-medium text-foreground">
              Possui entrada
            </label>
          </div>
          {entryEnabled && (
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted">Tipo de entrada</label>
                <div className="flex items-center gap-1 rounded-lg border border-border bg-surface-1 p-1">
                  <button
                    type="button"
                    onClick={() => setEntryType("FIXO")}
                    className={cn(
                      "flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                      entryType === "FIXO" ? "bg-brand-500/15 text-brand-300" : "text-muted hover:text-foreground"
                    )}
                  >
                    Valor fixo
                  </button>
                  <button
                    type="button"
                    onClick={() => setEntryType("PERCENTUAL")}
                    className={cn(
                      "flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                      entryType === "PERCENTUAL" ? "bg-brand-500/15 text-brand-300" : "text-muted hover:text-foreground"
                    )}
                  >
                    Porcentagem
                  </button>
                </div>
              </div>
              <MaskedInput
                id="rec-entry-value"
                mask={entryType === "PERCENTUAL" ? "percentage" : "currency"}
                label={entryType === "PERCENTUAL" ? "Entrada (%)" : "Entrada (R$)"}
                placeholder={entryType === "PERCENTUAL" ? "0" : "0,00"}
                value={entryValue}
                onChange={setEntryValue}
              />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface-2 p-4">
          <div className="flex items-center gap-3">
            <input
              id="rec-shipping-toggle"
              type="checkbox"
              checked={shippingEnabled}
              onChange={(e) => { setShippingEnabled(e.target.checked); setShippingValue(""); }}
              className="h-4 w-4 rounded border-border-strong bg-surface-1 text-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
            <label htmlFor="rec-shipping-toggle" className="text-sm font-medium text-foreground">
              Possui embarque
            </label>
          </div>
          {shippingEnabled && (
            <MaskedInput
              id="rec-shipping"
              mask="currency"
              label="Embarque (R$)"
              placeholder="0,00"
              value={shippingValue}
              onChange={setShippingValue}
            />
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted">Condição de pagamento</label>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="rec-installments" className="text-[11px] text-muted">Parcelas</label>
              <input
                id="rec-installments"
                type="number"
                min="1"
                max="24"
                step="1"
                value={installments}
                onChange={(e) => setInstallments(Math.max(1, Number(e.target.value) || 1))}
                className="w-full rounded-lg border border-border-strong bg-surface-1 px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] text-muted">Valor da parcela</label>
              <div className="flex h-[38px] items-center rounded-lg border border-border bg-surface-2 px-3 text-sm font-medium tabular-nums text-foreground">
                {installments > 1 ? formatCurrency(installmentValue) : formatCurrency(finalValue)}
              </div>
            </div>
          </div>
        </div>

        {(entryEnabled || shippingAmount > 0) && totalValue > 0 && (
          <div className="flex flex-col gap-1 rounded-lg border border-info/25 bg-info/10 p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted">Valor total</span>
              <span className="font-medium text-foreground">{formatCurrency(totalValue)}</span>
            </div>
            {entryEnabled && entryAmount > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted">Entrada ({entryType === "PERCENTUAL" ? `${parseCurrency(entryValue)}%` : "fixo"})</span>
                <span className="font-medium text-danger">- {formatCurrency(entryAmount)}</span>
              </div>
            )}
            {shippingAmount > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted">Embarque</span>
                <span className="font-medium text-danger">- {formatCurrency(shippingAmount)}</span>
              </div>
            )}
            <div className="flex items-center justify-between border-t border-info/20 pt-1 text-xs">
              <span className="font-semibold text-foreground">Valor final</span>
              <span className="font-bold text-foreground">{formatCurrency(finalValue)}</span>
            </div>
            {installments > 1 && (
              <div className="flex items-center justify-between text-[11px] text-muted">
                <span>{installments}x de {formatCurrency(installmentValue)}</span>
                <span>Total: {formatCurrency(installmentValue * installments)}</span>
              </div>
            )}
          </div>
        )}

        <Textarea
          id="rec-descricao"
          label="Descrição / Observações"
          placeholder="Detalhes sobre o recebimento..."
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </form>
    </Modal>
  );
}
