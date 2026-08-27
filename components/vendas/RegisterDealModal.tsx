"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { MaskedInput } from "@/components/ui/MaskedInput";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/Toast";
import { dealService, clientService } from "@/lib/services";
import { DEAL_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/constants";
import type { Deal, DealStatus, PaymentStatus } from "@/types";
import { formatCurrency, parseCurrency } from "@/lib/utils";

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
  const [responsibleId, setResponsibleId] = useState("");

  useEffect(() => {
    if (editDeal && open) {
      setClientId(editDeal.clientId);
      const found = clients.find((c) => c.id === editDeal.clientId);
      setClientCode(found?.code ?? "");
      setProduct(editDeal.product);
      setDescription(editDeal.description ?? "");
      setValue(editDeal.value > 0 ? formatCurrency(editDeal.value) : "");
      setStatus(editDeal.status);
      setPaymentStatus(editDeal.paymentStatus);
      setResponsibleId(editDeal.responsibleId);
    } else if (!open) {
      setClientId("");
      setClientCode("");
      setClientError("");
      setProduct("");
      setDescription("");
      setValue("");
      setStatus("ORCAMENTO");
      setPaymentStatus("PENDENTE");
      setResponsibleId("");
    }
  }, [editDeal, open, clients]);

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
        value: parseCurrency(value),
        status,
        paymentStatus,
        responsibleId: responsibleId || currentUserId || "",
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
        </div>

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
