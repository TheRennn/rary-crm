"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { MaskedInput } from "@/components/ui/MaskedInput";
import { IconPlus } from "@/components/icons";
import { useToast } from "@/components/ui/Toast";
import { productService } from "@/lib/services";
import { PRODUCT_CATEGORY_OPTIONS, PRODUCT_UNIT_OPTIONS } from "@/lib/constants";
import type { Product, ProductCategory, ProductUnit } from "@/types";
import { formatCurrency, cn, parseCurrency } from "@/lib/utils";

export interface RegisterProductModalProps {
  open: boolean;
  onClose: () => void;
  existingCompanies: string[];
  onCreated: (product: Product) => void;
  editProduct?: Product | null;
}

const inputClasses =
  "w-full rounded-lg border border-border-strong bg-surface-1 px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20";

export function RegisterProductModal({
  open,
  onClose,
  existingCompanies,
  onCreated,
  editProduct,
}: RegisterProductModalProps) {
  const { toast } = useToast();
  const isEditing = !!editProduct;
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ProductCategory>("OUTRO");
  const [unit, setUnit] = useState<ProductUnit>("UN");
  const [unitValue, setUnitValue] = useState("");
  const [costValue, setCostValue] = useState("");
  const [discount, setDiscount] = useState("");
  const [minStock, setMinStock] = useState("");
  const [currentStock, setCurrentStock] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editProduct && open) {
      setCode(editProduct.code);
      setName(editProduct.name);
      setDescription(editProduct.description ?? "");
      setCategory(editProduct.category);
      setUnit(editProduct.unit);
      setUnitValue(formatCurrency(editProduct.unitValue));
      setCostValue(editProduct.costValue ? formatCurrency(editProduct.costValue) : "");
      setDiscount(editProduct.discount ? String(editProduct.discount) : "");
      setMinStock(editProduct.minStock ? String(editProduct.minStock) : "");
      setCurrentStock(editProduct.currentStock ? String(editProduct.currentStock) : "");
      setCompanyName(editProduct.companyName ?? "");
      setActive(editProduct.active);
    } else if (!open) {
      reset();
    }
  }, [editProduct, open]);

  const finalValue = parseCurrency(unitValue);
  const discountPercent = Number(discount) || 0;
  const valueWithDiscount = finalValue - (finalValue * discountPercent) / 100;

  function reset() {
    setCode("");
    setName("");
    setDescription("");
    setCategory("OUTRO");
    setUnit("UN");
    setUnitValue("");
    setCostValue("");
    setDiscount("");
    setMinStock("");
    setCurrentStock("");
    setCompanyName("");
    setActive(true);
    setError(null);
  }

  function handleClose() {
    if (saving) return;
    reset();
    onClose();
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const productName = name.trim();
    if (!productName) {
      setError("Informe o nome do produto.");
      return;
    }
    if (!code.trim()) {
      setError("Informe o código do produto.");
      return;
    }
    const unitValueNum = parseCurrency(unitValue);
    if (!Number.isFinite(unitValueNum) || unitValueNum <= 0) {
      setError("Informe um valor unitário válido.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const productData: Omit<Product, "id" | "createdAt"> = {
        code: code.trim().toUpperCase(),
        name: productName,
        description: description.trim() || undefined,
        category,
        unit,
        unitValue: unitValueNum,
        costValue: parseCurrency(costValue) || 0,
        discount: Number(discount) || 0,
        minStock: Number(minStock) || 0,
        currentStock: Number(currentStock) || 0,
        companyName: companyName.trim() || undefined,
        active,
      };

      if (isEditing) {
        const updated = await productService.update(editProduct.id, productData);
        onCreated(updated);
        toast({
          title: "Produto atualizado",
          message: `${updated.code} — ${updated.name}`,
          variant: "success",
        });
      } else {
        const created = await productService.create(productData);
        onCreated(created);
        toast({
          title: "Produto cadastrado",
          message: `${created.code} — ${created.name}`,
          variant: "success",
        });
      }
      reset();
      onClose();
    } catch {
      setError(isEditing ? "Não foi possível atualizar o produto. Tente novamente." : "Não foi possível cadastrar o produto. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isEditing ? "Editar produto" : "Cadastrar produto"}
      description={isEditing ? "Atualize os dados do produto" : "Adicione um novo produto ao catálogo"}
      size="lg"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={handleClose} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" form="product-form" loading={saving}>
            <IconPlus className="h-4 w-4" />
            {isEditing ? "Salvar alterações" : "Cadastrar produto"}
          </Button>
        </>
      }
    >
      <form id="product-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="pr-code" className="text-xs font-medium text-muted">
              Código <span className="text-danger">*</span>
            </label>
            <input
              id="pr-code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="Ex.: PROD-001"
              className={inputClasses}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="pr-name" className="text-xs font-medium text-muted">
              Nome do produto <span className="text-danger">*</span>
            </label>
            <input
              id="pr-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex.: Produto XYZ"
              className={inputClasses}
              required
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="pr-desc" className="text-xs font-medium text-muted">
            Descrição
          </label>
          <textarea
            id="pr-desc"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={2}
            placeholder="Descrição detalhada do produto"
            className={cn(inputClasses, "resize-none")}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="pr-category" className="text-xs font-medium text-muted">
              Categoria <span className="text-danger">*</span>
            </label>
            <select
              id="pr-category"
              value={category}
              onChange={(event) => setCategory(event.target.value as ProductCategory)}
              className={inputClasses}
            >
              {PRODUCT_CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="pr-unit" className="text-xs font-medium text-muted">
              Unidade <span className="text-danger">*</span>
            </label>
            <select
              id="pr-unit"
              value={unit}
              onChange={(event) => setUnit(event.target.value as ProductUnit)}
              className={inputClasses}
            >
              {PRODUCT_UNIT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="pr-unit-value" className="text-xs font-medium text-muted">
              Valor unitário (R$) <span className="text-danger">*</span>
            </label>
            <MaskedInput
              id="pr-unit-value"
              mask="currency"
              value={unitValue}
              onChange={setUnitValue}
              placeholder="0,00"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="pr-cost-value" className="text-xs font-medium text-muted">
              Valor de custo (R$)
            </label>
            <MaskedInput
              id="pr-cost-value"
              mask="currency"
              value={costValue}
              onChange={setCostValue}
              placeholder="0,00"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="pr-discount" className="text-xs font-medium text-muted">
              Desconto (%)
            </label>
            <input
              id="pr-discount"
              type="number"
              min="0"
              max="100"
              step="0.5"
              value={discount}
              onChange={(event) => setDiscount(event.target.value)}
              placeholder="0"
              className={inputClasses}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="pr-min-stock" className="text-xs font-medium text-muted">
              Estoque mínimo
            </label>
            <input
              id="pr-min-stock"
              type="number"
              min="0"
              step="1"
              value={minStock}
              onChange={(event) => setMinStock(event.target.value)}
              placeholder="0"
              className={inputClasses}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="pr-current-stock" className="text-xs font-medium text-muted">
              Estoque atual
            </label>
            <input
              id="pr-current-stock"
              type="number"
              min="0"
              step="1"
              value={currentStock}
              onChange={(event) => setCurrentStock(event.target.value)}
              placeholder="0"
              className={inputClasses}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="pr-company" className="text-xs font-medium text-muted">
              Empresa representada
            </label>
            <input
              id="pr-company"
              list="pr-companies"
              value={companyName}
              onChange={(event) => setCompanyName(event.target.value)}
              placeholder="Opcional"
              className={inputClasses}
            />
            <datalist id="pr-companies">
              {existingCompanies.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={active}
              onChange={(event) => setActive(event.target.checked)}
              className="h-4 w-4 rounded border-border-strong bg-surface-1 text-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
            <span className="text-sm text-foreground">Produto ativo</span>
          </label>
        </div>

        <div className="flex flex-col gap-0.5 rounded-lg border border-border bg-surface-2 px-3 py-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Valor final</span>
            <span className="text-sm font-bold tabular-nums text-foreground">
              {valueWithDiscount > 0 ? formatCurrency(valueWithDiscount) : "—"}
            </span>
          </div>
          {discountPercent > 0 && finalValue > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-muted">Desconto de {discountPercent}%</span>
              <span className="text-xs font-medium tabular-nums text-muted">
                De {formatCurrency(finalValue)} por {formatCurrency(valueWithDiscount)}
              </span>
            </div>
          )}
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
