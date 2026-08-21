"use client";

import { useState, type ReactNode } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { IconPlus, IconX } from "@/components/icons";
import { useToast } from "@/components/ui/Toast";
import { orderService } from "@/lib/services";
import { ORDER_TYPE_LABELS, ORDER_SOURCE_LABELS } from "@/lib/constants";
import type { Order, OrderItem, OrderSource, OrderType, PaymentStatus } from "@/types";
import { formatCurrency, cn } from "@/lib/utils";

export interface RegisterOrderModalProps {
  open: boolean;
  onClose: () => void;
  existingClients: string[];
  existingCompanies: string[];
  onCreated: (order: Order) => void;
}

const inputClasses =
  "w-full rounded-lg border border-border-strong bg-surface-1 px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20";

type DraftItem = Omit<OrderItem, "id"> & { key: string };

const TYPE_OPTIONS: OrderType[] = ["VENDA", "AMOSTRA", "BONIFICACAO"];
const SOURCE_OPTIONS: OrderSource[] = ["REPRESENTANTE", "EMPRESA"];

export function RegisterOrderModal({
  open,
  onClose,
  existingClients,
  existingCompanies,
  onCreated,
}: RegisterOrderModalProps) {
  const { toast } = useToast();
  const [clientName, setClientName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [period, setPeriod] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [source, setSource] = useState<OrderSource>("REPRESENTANTE");
  const [type, setType] = useState<OrderType>("VENDA");
  const [status, setStatus] = useState<PaymentStatus>("PENDENTE");
  const [items, setItems] = useState<DraftItem[]>([
    { key: "row-1", product: "", productCode: "", quantity: 1, unitValue: 0 },
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = items.reduce((acc, item) => acc + (item.quantity || 0) * (item.unitValue || 0), 0);

  function updateItem(key: string, patch: Partial<DraftItem>) {
    setItems((prev) => prev.map((item) => (item.key === key ? { ...item, ...patch } : item)));
  }

  function addItem() {
    setItems((prev) => [
      ...prev,
      { key: `row-${Date.now().toString(36)}`, product: "", productCode: "", quantity: 1, unitValue: 0 },
    ]);
  }

  function removeItem(key: string) {
    setItems((prev) => prev.filter((item) => item.key !== key));
  }

  function reset() {
    setClientName("");
    setCompanyName("");
    setPeriod("");
    setDate(new Date().toISOString().slice(0, 10));
    setSource("REPRESENTANTE");
    setType("VENDA");
    setStatus("PENDENTE");
    setItems([{ key: "row-1", product: "", productCode: "", quantity: 1, unitValue: 0 }]);
    setError(null);
  }

  function handleClose() {
    if (saving) return;
    reset();
    onClose();
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const client = clientName.trim();
    const company = companyName.trim();
    if (!client) {
      setError("Informe o cliente do pedido.");
      return;
    }
    if (!company) {
      setError("Informe a empresa representada.");
      return;
    }
    if (!period) {
      setError("Informe a competência (mês/ano).");
      return;
    }
    const validItems = items.filter((item) => (item.product || item.productCode) && (item.quantity || 0) > 0);
    if (validItems.length === 0) {
      setError("Adicione pelo menos um produto com quantidade.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const fullItems: Omit<OrderItem, "id">[] = validItems.map((item) => ({
        product: item.product.trim() || item.productCode || "Produto",
        productCode: item.productCode?.trim() || undefined,
        quantity: Math.max(1, item.quantity || 1),
        unitValue: Math.max(0, item.unitValue || 0),
      }));
      const created = await orderService.create({
        clientName: client,
        companyName: company,
        period,
        date,
        source,
        type,
        status,
        items: fullItems,
      });
      onCreated(created);
      toast({
        title: "Pedido adicionado",
        message: `${created.code} · ${created.clientName} — ${ORDER_TYPE_LABELS[created.type]}`,
        variant: "success",
      });
      reset();
      onClose();
    } catch {
      setError("Não foi possível registrar o pedido. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Adicionar pedido"
      description="Pedido do cliente com os produtos da empresa representada"
      size="lg"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={handleClose} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" form="order-form" loading={saving}>
            <IconPlus className="h-4 w-4" />
            {total > 0 ? `Salvar ${formatCurrency(total)}` : "Salvar"}
          </Button>
        </>
      }
    >
      <form id="order-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="od-client" className="text-xs font-medium text-muted">
              Cliente <span className="text-danger">*</span>
            </label>
            <input
              id="od-client"
              list="od-clients"
              value={clientName}
              onChange={(event) => setClientName(event.target.value)}
              placeholder="Digite o cliente"
              className={inputClasses}
              required
            />
            <datalist id="od-clients">
              {existingClients.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="od-company" className="text-xs font-medium text-muted">
              Empresa representada <span className="text-danger">*</span>
            </label>
            <input
              id="od-company"
              list="od-companies"
              value={companyName}
              onChange={(event) => setCompanyName(event.target.value)}
              placeholder="Ex.: Eletro Sul"
              className={inputClasses}
              required
            />
            <datalist id="od-companies">
              {existingCompanies.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="od-period" className="text-xs font-medium text-muted">
              Competência <span className="text-danger">*</span>
            </label>
            <input
              id="od-period"
              type="month"
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
              className={inputClasses}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="od-date" className="text-xs font-medium text-muted">
              Data
            </label>
            <input
              id="od-date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className={inputClasses}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted">Tipo</span>
            <div className="flex items-center gap-1 rounded-lg border border-border bg-surface-2 p-1">
              {TYPE_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setType(option)}
                  className={cn(
                    "flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                    type === option ? "bg-brand-500/15 text-brand-300" : "text-muted hover:text-foreground"
                  )}
                >
                  {ORDER_TYPE_LABELS[option]}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted">Origem</span>
            <div className="flex items-center gap-1 rounded-lg border border-border bg-surface-2 p-1">
              {SOURCE_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSource(option)}
                  className={cn(
                    "flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                    source === option ? "bg-brand-500/15 text-brand-300" : "text-muted hover:text-foreground"
                  )}
                >
                  {ORDER_SOURCE_LABELS[option]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5 sm:col-span-1">
            <label htmlFor="od-status" className="text-xs font-medium text-muted">
              Status
            </label>
            <select
              id="od-status"
              value={status}
              onChange={(event) => setStatus(event.target.value as PaymentStatus)}
              className={inputClasses}
            >
              <option value="PENDENTE">Pendente</option>
              <option value="PAGO">Pago</option>
              <option value="ATRASADO">Em atraso</option>
              <option value="CANCELADO">Cancelado</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Produtos</span>
            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-brand-300 transition-colors hover:bg-brand-500/10"
            >
              <IconPlus className="h-3.5 w-3.5" />
              Adicionar produto
            </button>
          </div>

          {items.map((item, index) => (
            <div
              key={item.key}
              className="flex flex-col gap-2 rounded-lg border border-border bg-surface-2 p-2.5 sm:flex-row sm:flex-wrap sm:items-end"
            >
              <div className="flex flex-1 flex-col gap-1">
                <span className="text-[10px] uppercase tracking-wide text-muted-2">Produto {index + 1}</span>
                <input
                  list="od-products"
                  value={item.product}
                  onChange={(event) => updateItem(item.key, { product: event.target.value })}
                  placeholder="Nome do produto"
                  className={inputClasses}
                />
                <datalist id="od-products">
                  {existingProductsSuggestions(items)}
                </datalist>
              </div>
              <div className="flex flex-col gap-1 sm:w-24">
                <span className="text-[10px] uppercase tracking-wide text-muted-2">Código</span>
                <input
                  value={item.productCode ?? ""}
                  onChange={(event) => updateItem(item.key, { productCode: event.target.value })}
                  placeholder="Código"
                  className={inputClasses}
                />
              </div>
              <div className="flex flex-col gap-1 sm:w-20">
                <span className="text-[10px] uppercase tracking-wide text-muted-2">Qtd</span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={item.quantity}
                  onChange={(event) => updateItem(item.key, { quantity: Number(event.target.value) })}
                  className={inputClasses}
                />
              </div>
              <div className="flex flex-col gap-1 sm:w-28">
                <span className="text-[10px] uppercase tracking-wide text-muted-2">Valor un. (R$)</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.unitValue}
                  onChange={(event) => updateItem(item.key, { unitValue: Number(event.target.value) })}
                  className={inputClasses}
                />
              </div>
              <button
                type="button"
                onClick={() => removeItem(item.key)}
                disabled={items.length === 1}
                aria-label="Remover produto"
                className="flex h-9 w-9 items-center justify-center self-start rounded-lg border border-border-strong/60 text-muted-2 transition-colors hover:border-danger/40 hover:text-danger disabled:pointer-events-none disabled:opacity-40 sm:self-end"
              >
                <IconX className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border bg-surface-2 px-3 py-2.5">
          <span className="text-xs font-medium text-muted">
            Total do pedido
            {type === "AMOSTRA" || type === "BONIFICACAO" ? (
              <span className="ml-1 text-muted-2">({ORDER_TYPE_LABELS[type]})</span>
            ) : null}
          </span>
          <span className="text-sm font-bold tabular-nums text-foreground">
            {formatCurrency(total)}
          </span>
        </div>

        {error && (
          <p className="rounded-lg border border-danger/25 bg-danger/10 px-3 py-2 text-xs font-medium text-danger">
            {error}
          </p>
        )}
      </form>
    </Modal>
  );
}

function existingProductsSuggestions(items: DraftItem[]): ReactNode {
  const known = items
    .map((item) => item.product)
    .filter((product): product is string => Boolean(product && product.trim()));
  return (
    <>
      {known.map((product, index) => (
        <option key={`sug-${index}-${product}`} value={product} />
      ))}
    </>
  );
}