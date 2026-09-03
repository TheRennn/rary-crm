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
import { dealService, clientService } from "@/lib/services";
import { DEAL_STATUS_LABELS, PAYMENT_STATUS_LABELS, PAYMENT_METHODS } from "@/lib/constants";
import type { Deal, DealStatus, PaymentStatus, EntryType } from "@/types";
import { parseCurrency, formatCurrency, cn } from "@/lib/utils";

export interface RegisterDealModalProps {
  open: boolean;
  onClose: () => void;
  clients: { id: string; name: string; code: string }[];
  currentUserId?: string;
  editDeal?: Deal | null;
}

const statusOptions = (Object.keys(DEAL_STATUS_LABELS) as DealStatus[]).map((s) => ({
  value: s,
  label: DEAL_STATUS_LABELS[s],
}));

const paymentOptions = (Object.keys(PAYMENT_STATUS_LABELS) as PaymentStatus[]).map((s) => ({
  value: s,
  label: PAYMENT_STATUS_LABELS[s],
}));

const paymentMethodOptions = PAYMENT_METHODS.map((method) => ({
  value: method,
  label: method,
}));

export function RegisterDealModal({
  open,
  onClose,
  clients,
  currentUserId,
  editDeal,
}: RegisterDealModalProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const isEditing = !!editDeal;

  const [clientId, setClientId] = useState("");
  const [clientCode, setClientCode] = useState("");
  const [clientError, setClientError] = useState("");
  const [lookingUp, setLookingUp] = useState(false);

  const [product, setProduct] = useState("");
  const [description, setDescription] = useState("");
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<DealStatus>("ORCAMENTO");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("PENDENTE");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [responsibleId, setResponsibleId] = useState("");
  const [deliveryDeadline, setDeliveryDeadline] = useState("");

  const [entryEnabled, setEntryEnabled] = useState(false);
  const [entryValue, setEntryValue] = useState("");
  const [entryType, setEntryType] = useState<EntryType>("FIXO");
  const [shippingEnabled, setShippingEnabled] = useState(false);
  const [shippingValue, setShippingValue] = useState("");
  const [installments, setInstallments] = useState(1);

  useEffect(() => {
    if (editDeal && open) {
      setClientId(editDeal.clientId);
      const found = clients.find((c) => c.id === editDeal.clientId);
      setClientCode(found?.code ?? "");
      setProduct(editDeal.product);
      setDescription(editDeal.description ?? "");
      setValue(editDeal.value > 0 ? editDeal.value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "");
      setStatus(editDeal.status);
      setPaymentStatus(editDeal.paymentStatus);
      setPaymentMethod(editDeal.paymentMethod ?? "");
      setResponsibleId(editDeal.responsibleId);
      setDeliveryDeadline(editDeal.deliveryDeadline ?? "");
      setEntryEnabled(!!editDeal.entryValue);
      setEntryValue(editDeal.entryValue ? editDeal.entryValue.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "");
      setEntryType(editDeal.entryType ?? "FIXO");
      setShippingEnabled(!!editDeal.shippingValue);
      setShippingValue(editDeal.shippingValue ? editDeal.shippingValue.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "");
      setInstallments(editDeal.installments ?? 1);
    } else if (!open) {
      setClientId("");
      setClientCode("");
      setClientError("");
      setProduct("");
      setDescription("");
      setValue("");
      setStatus("ORCAMENTO");
      setPaymentStatus("PENDENTE");
      setPaymentMethod("");
      setResponsibleId("");
      setDeliveryDeadline("");
      setEntryEnabled(false);
      setEntryValue("");
      setEntryType("FIXO");
      setShippingEnabled(false);
      setShippingValue("");
      setInstallments(1);
    }
  }, [editDeal, open, clients]);

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
    label: `${c.code} — ${c.name}`,
  }));

  function handleClientSelect(selectedId: string) {
    setClientId(selectedId);
    setClientError("");
    const found = clients.find((c) => c.id === selectedId);
    if (found) {
      setClientCode(found.code);
    } else {
      setClientCode("");
    }
  }

  async function handleCodeBlur(code: string) {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setClientId("");
      setClientError("");
      return;
    }

    setLookingUp(true);
    setClientError("");
    try {
      const client = await clientService.getByCode(trimmed);
      if (client) {
        setClientId(client.id);
        setClientCode(client.code);
        setClientError("");
      } else {
        setClientId("");
        setClientError("Cliente não encontrado");
      }
    } catch {
      setClientId("");
      setClientError("Erro ao buscar cliente");
    } finally {
      setLookingUp(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!clientId) {
      setClientError("Selecione ou busque um cliente válido");
      return;
    }

    setSubmitting(true);

    try {
      const data = {
        clientId,
        product,
        description: description || undefined,
        value: totalValue,
        status,
        paymentStatus,
        paymentMethod: paymentMethod || undefined,
        responsibleId: responsibleId || currentUserId || "",
        deliveryDeadline: deliveryDeadline || undefined,
        entryValue: entryEnabled ? entryAmount : undefined,
        entryType: entryEnabled ? entryType : undefined,
        shippingValue: shippingAmount > 0 ? shippingAmount : undefined,
        installments: installments > 1 ? installments : undefined,
        installmentValue: installments > 1 ? installmentValue : undefined,
      };

      if (isEditing) {
        await dealService.update(editDeal.id, data);
        toast({
          title: "Venda atualizada",
          message: `${product} atualizada com sucesso.`,
          variant: "success",
        });
      } else {
        await dealService.create(data);
        toast({
          title: "Venda registrada",
          message: `${product} cadastrada com sucesso.`,
          variant: "success",
        });
      }
      router.refresh();
      handleClose();
    } catch (err) {
      console.error("Erro ao salvar venda:", err);
      toast({
        title: "Erro ao salvar",
        message: isEditing
          ? "Não foi possível atualizar a venda. Tente novamente."
          : "Não foi possível registrar a venda. Tente novamente.",
        variant: "error",
      });
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    setClientId("");
    setClientCode("");
    setClientError("");
    setProduct("");
    setDescription("");
    setValue("");
    setStatus("ORCAMENTO");
    setPaymentStatus("PENDENTE");
    setResponsibleId("");
    setDeliveryDeadline("");
    setEntryEnabled(false);
    setEntryValue("");
    setEntryType("FIXO");
    setShippingValue("");
    setInstallments(1);
    onClose();
  }

  const selectedClientName = clientId
    ? clients.find((c) => c.id === clientId)?.name ?? ""
    : "";

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isEditing ? "Editar venda" : "Nova venda"}
      description={isEditing ? "Atualize os dados da venda" : "Registre uma nova oportunidade de venda"}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={submitting} form="deal-form" disabled={!clientId}>
            {isEditing ? "Salvar alterações" : "Salvar venda"}
          </Button>
        </>
      }
    >
      <form id="deal-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            id="deal-cliente"
            label="Cliente"
            options={clientOptions}
            placeholder="Selecione o cliente"
            value={clientId}
            onChange={(e) => handleClientSelect(e.target.value)}
            required
          />
          <Input
            id="deal-cliente-codigo"
            label="Código do cliente"
            placeholder="CLT-000001"
            value={clientCode}
            onChange={(e) => setClientCode(e.target.value.toUpperCase())}
            onBlur={() => handleCodeBlur(clientCode)}
            error={clientError}
            hint={lookingUp ? "Buscando..." : selectedClientName ? `✓ ${selectedClientName}` : "Digite o código e pressione Tab"}
          />
        </div>

        <Select
          id="deal-responsavel"
          label="Responsável"
          options={currentUserId ? [{ value: currentUserId, label: "Eu mesmo" }] : []}
          placeholder="Selecione o responsável"
          value={responsibleId}
          onChange={(e) => setResponsibleId(e.target.value)}
          required
        />

        <Input
          id="deal-produto"
          label="Produto / Serviço"
          placeholder="Nome do produto ou serviço"
          value={product}
          onChange={(e) => setProduct(e.target.value)}
          required
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <MaskedInput
            id="deal-valor"
            mask="currency"
            label="Valor (R$)"
            placeholder="0,00"
            value={value}
            onChange={setValue}
            required
          />
          <Select
            id="deal-status"
            label="Status da venda"
            options={statusOptions}
            value={status}
            onChange={(e) => setStatus(e.target.value as DealStatus)}
            required
          />
          <Select
            id="deal-pagamento"
            label="Status do pagamento"
            options={paymentOptions}
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
            required
          />
          <Select
            id="deal-forma-pagamento"
            label="Forma de pagamento"
            options={paymentMethodOptions}
            placeholder="Selecione"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
          <DateInput
            id="deal-prazo-entrega"
            label="Prazo de entrega"
            value={deliveryDeadline}
            onChange={setDeliveryDeadline}
          />
        </div>

        <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface-2 p-4">
          <div className="flex items-center gap-3">
            <input
              id="deal-entry-toggle"
              type="checkbox"
              checked={entryEnabled}
              onChange={(e) => { setEntryEnabled(e.target.checked); setEntryValue(""); }}
              className="h-4 w-4 rounded border-border-strong bg-surface-1 text-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
            <label htmlFor="deal-entry-toggle" className="text-sm font-medium text-foreground">
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
                id="deal-entry-value"
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
              id="deal-shipping-toggle"
              type="checkbox"
              checked={shippingEnabled}
              onChange={(e) => { setShippingEnabled(e.target.checked); setShippingValue(""); }}
              className="h-4 w-4 rounded border-border-strong bg-surface-1 text-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
            <label htmlFor="deal-shipping-toggle" className="text-sm font-medium text-foreground">
              Possui embarque
            </label>
          </div>
          {shippingEnabled && (
            <MaskedInput
              id="deal-shipping"
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
              <label htmlFor="deal-installments" className="text-[11px] text-muted">Parcelas</label>
              <input
                id="deal-installments"
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
          id="deal-descricao"
          label="Descrição / Observações"
          placeholder="Detalhes sobre a venda..."
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </form>
    </Modal>
  );
}
