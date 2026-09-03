"use client";

import { useState, useEffect, useMemo, type ReactNode } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { MaskedInput } from "@/components/ui/MaskedInput";
import { DateInput } from "@/components/ui/DateInput";
import { IconPlus, IconX } from "@/components/icons";
import { useToast } from "@/components/ui/Toast";
import { orderService } from "@/lib/services";
import { ORDER_TYPE_LABELS, ORDER_SOURCE_LABELS } from "@/lib/constants";
import type { Order, OrderItem, OrderSource, OrderType, PaymentStatus, Product, EntryType } from "@/types";
import { formatCurrency, cn, maskCurrency, parseCurrency } from "@/lib/utils";

export interface RegisterOrderModalProps {
  open: boolean;
  onClose: () => void;
  existingClients: string[];
  existingCompanies: string[];
  products?: Product[];
  onCreated: (order: Order) => void;
  editOrder?: Order | null;
}

const inputClasses =
  "w-full rounded-lg border border-border-strong bg-surface-1 px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20";

type DraftItem = Omit<OrderItem, "id" | "unitValue"> & { key: string; unitValue: string };

const TYPE_OPTIONS: OrderType[] = ["VENDA", "AMOSTRA", "BONIFICACAO"];
const SOURCE_OPTIONS: OrderSource[] = ["REPRESENTANTE", "EMPRESA"];

export function RegisterOrderModal({
  open,
  onClose,
  existingClients,
  existingCompanies,
  products = [],
  onCreated,
  editOrder,
}: RegisterOrderModalProps) {
  const { toast } = useToast();
  const isEditing = !!editOrder;
  const [clientName, setClientName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [period, setPeriod] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [source, setSource] = useState<OrderSource>("REPRESENTANTE");
  const [type, setType] = useState<OrderType>("VENDA");
  const [status, setStatus] = useState<PaymentStatus>("PENDENTE");
  const [items, setItems] = useState<DraftItem[]>([
    { key: "row-1", product: "", productCode: "", quantity: 1, unitValue: "" },
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [entryEnabled, setEntryEnabled] = useState(false);
  const [entryValue, setEntryValue] = useState("");
  const [entryType, setEntryType] = useState<EntryType>("FIXO");
  const [shippingEnabled, setShippingEnabled] = useState(false);
  const [shippingValue, setShippingValue] = useState("");

  useEffect(() => {
    if (editOrder && open) {
      setClientName(editOrder.clientName);
      setCompanyName(editOrder.companyName);
      setPeriod(editOrder.period);
      setDate(editOrder.date?.slice(0, 10) ?? new Date().toISOString().slice(0, 10));
      setSource(editOrder.source);
      setType(editOrder.type);
      setStatus(editOrder.status);
      setItems(editOrder.items.map((item, i) => ({
        key: `row-${i}`,
        product: item.product,
        productCode: item.productCode ?? "",
        quantity: item.quantity,
        unitValue: maskCurrency(String(Math.round(item.unitValue * 100))),
      })));
      setEntryEnabled(!!editOrder.entryValue);
      setEntryValue(editOrder.entryValue ? editOrder.entryValue.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "");
      setEntryType(editOrder.entryType ?? "FIXO");
      setShippingEnabled(!!editOrder.shippingValue);
      setShippingValue(editOrder.shippingValue ? editOrder.shippingValue.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "");
    } else if (!open) {
      reset();
    }
  }, [editOrder, open]);

  const subtotal = items.reduce((acc, item) => {
    const unitVal = typeof item.unitValue === "string" ? parseCurrency(item.unitValue) : (item.unitValue || 0);
    return acc + (item.quantity || 0) * unitVal;
  }, 0);

  const entryAmount = useMemo(() => {
    if (!entryEnabled) return 0;
    const raw = parseCurrency(entryValue);
    if (entryType === "PERCENTUAL") {
      return Math.round((subtotal * raw) / 100 * 100) / 100;
    }
    return raw;
  }, [entryEnabled, entryValue, entryType, subtotal]);
  const shippingAmount = shippingEnabled ? parseCurrency(shippingValue) : 0;
  const total = Math.max(0, subtotal - entryAmount - shippingAmount);

  function updateItem(key: string, patch: Partial<DraftItem>) {
    setItems((prev) => prev.map((item) => (item.key === key ? { ...item, ...patch } : item)));
  }

  function addItem() {
    setItems((prev) => [
      ...prev,
      { key: `row-${Date.now().toString(36)}`, product: "", productCode: "", quantity: 1, unitValue: "" },
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
    setItems([{ key: "row-1", product: "", productCode: "", quantity: 1, unitValue: "" }]);
    setError(null);
    setEntryEnabled(false);
    setEntryValue("");
    setEntryType("FIXO");
    setShippingEnabled(false);
    setShippingValue("");
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
        unitValue: Math.max(0, typeof item.unitValue === "string" ? parseCurrency(item.unitValue) : (item.unitValue || 0)),
      }));

      if (isEditing) {
        const updated = await orderService.update(editOrder.id, {
          clientName: client,
          companyName: company,
          period,
          date,
          source,
          type,
          status,
          items: fullItems,
          entryValue: entryEnabled ? entryAmount : undefined,
          entryType: entryEnabled ? entryType : undefined,
          shippingValue: shippingAmount > 0 ? shippingAmount : undefined,
        });
        onCreated(updated);
        toast({
          title: "Pedido atualizado",
          message: `${updated.code} · ${updated.clientName} — ${ORDER_TYPE_LABELS[updated.type]}`,
          variant: "success",
        });
      } else {
        const created = await orderService.create({
          clientName: client,
          companyName: company,
          period,
          date,
          source,
          type,
          status,
          items: fullItems,
          entryValue: entryEnabled ? entryAmount : undefined,
          entryType: entryEnabled ? entryType : undefined,
          shippingValue: shippingAmount > 0 ? shippingAmount : undefined,
        });
        onCreated(created);
        toast({
          title: "Pedido adicionado",
          message: `${created.code} · ${created.clientName} — ${ORDER_TYPE_LABELS[created.type]}`,
          variant: "success",
        });
      }
      reset();
      onClose();
    } catch {
      setError(isEditing ? "Não foi possível atualizar o pedido. Tente novamente." : "Não foi possível registrar o pedido. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isEditing ? "Editar pedido" : "Adicionar pedido"}
      description={isEditing ? "Atualize os dados do pedido" : "Pedido do cliente com os produtos da empresa representada"}
      size="lg"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={handleClose} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" form="order-form" loading={saving}>
            <IconPlus className="h-4 w-4" />
            {isEditing ? "Salvar alterações" : total > 0 ? `Salvar ${formatCurrency(total)}` : "Salvar"}
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
            <DateInput
              id="od-date"
              value={date}
              onChange={setDate}
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
                  {productCatalogSuggestions(products, items)}
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
                <MaskedInput
                  mask="currency"
                  value={typeof item.unitValue === "string" ? item.unitValue : String(item.unitValue || "")}
                  onChange={(val) => updateItem(item.key, { unitValue: val })}
                  placeholder="0,00"
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
            Subtotal
            {type === "AMOSTRA" || type === "BONIFICACAO" ? (
              <span className="ml-1 text-muted-2">({ORDER_TYPE_LABELS[type]})</span>
            ) : null}
          </span>
          <span className="text-sm font-bold tabular-nums text-foreground">
            {formatCurrency(subtotal)}
          </span>
        </div>

        <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface-2 p-4">
          <div className="flex items-center gap-3">
            <input
              id="od-entry-toggle"
              type="checkbox"
              checked={entryEnabled}
              onChange={(e) => { setEntryEnabled(e.target.checked); setEntryValue(""); }}
              className="h-4 w-4 rounded border-border-strong bg-surface-1 text-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
            <label htmlFor="od-entry-toggle" className="text-sm font-medium text-foreground">
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
                id="od-entry-value"
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
              id="od-shipping-toggle"
              type="checkbox"
              checked={shippingEnabled}
              onChange={(e) => { setShippingEnabled(e.target.checked); setShippingValue(""); }}
              className="h-4 w-4 rounded border-border-strong bg-surface-1 text-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
            <label htmlFor="od-shipping-toggle" className="text-sm font-medium text-foreground">
              Possui embarque
            </label>
          </div>
          {shippingEnabled && (
            <MaskedInput
              id="od-shipping"
              mask="currency"
              label="Embarque (R$)"
              placeholder="0,00"
              value={shippingValue}
              onChange={setShippingValue}
            />
          )}
        </div>

        {(entryEnabled || shippingAmount > 0) && subtotal > 0 && (
          <div className="flex flex-col gap-1 rounded-lg border border-info/25 bg-info/10 p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted">Subtotal</span>
              <span className="font-medium text-foreground">{formatCurrency(subtotal)}</span>
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
              <span className="font-bold text-foreground">{formatCurrency(total)}</span>
            </div>
          </div>
        )}

        {error && (
          <p className="rounded-lg border border-danger/25 bg-danger/10 px-3 py-2 text-xs font-medium text-danger">
            {error}
          </p>
        )}
      </form>
    </Modal>
  );
}

function productCatalogSuggestions(products: Product[], items: DraftItem[]): ReactNode {
  const catalogOptions = products
    .filter((p) => p.active)
    .map((p) => ({
      name: p.name,
      label: p.code ? `${p.name} (${p.code})` : p.name,
      value: p.unitValue,
    }));

  const typedProducts = items
    .map((item) => item.product)
    .filter((product): product is string => Boolean(product && product.trim()));

  const allSuggestions = [...catalogOptions, ...typedProducts.map((p) => ({ name: p, label: p, value: undefined }))];

  const seen = new Set<string>();
  const unique = allSuggestions.filter((s) => {
    if (seen.has(s.name)) return false;
    seen.add(s.name);
    return true;
  });

  return (
    <>
      {unique.map((suggestion, index) => (
        <option key={`sug-${index}-${suggestion.name}`} value={suggestion.name} />
      ))}
    </>
  );
}