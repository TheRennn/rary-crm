"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { MaskedInput } from "@/components/ui/MaskedInput";
import { useToast } from "@/components/ui/Toast";
import { productService } from "@/lib/services";
import type { Product } from "@/types";
import { formatCurrency, parseCurrency } from "@/lib/utils";

export interface RegisterProductModalProps {
  open: boolean;
  onClose: () => void;
  existingCompanies: string[];
  onCreated: (product: Product) => void;
  editProduct?: Product | null;
}

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
  const [companyName, setCompanyName] = useState("");
  const [unitValue, setUnitValue] = useState("");
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editProduct && open) {
      setCode(editProduct.code);
      setName(editProduct.name);
      setCompanyName(editProduct.companyName ?? "");
      setUnitValue(editProduct.unitValue > 0 ? editProduct.unitValue.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "");
      setActive(editProduct.active);
    } else if (!open) {
      reset();
    }
  }, [editProduct, open]);

  function reset() {
    setCode("");
    setName("");
    setCompanyName("");
    setUnitValue("");
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
        category: "OUTRO",
        unit: "UN",
        unitValue: unitValueNum,
        costValue: 0,
        discount: 0,
        minStock: 0,
        currentStock: 0,
        companyName: companyName.trim() || undefined,
        active,
      };

      if (isEditing) {
        const updated = await productService.update(editProduct.id, productData);
        onCreated(updated);
        toast({ title: "Produto atualizado", message: `${updated.code} — ${updated.name}`, variant: "success" });
      } else {
        const created = await productService.create(productData);
        onCreated(created);
        toast({ title: "Produto cadastrado", message: `${created.code} — ${created.name}`, variant: "success" });
      }
      reset();
      onClose();
    } catch {
      setError(isEditing ? "Não foi possível atualizar o produto." : "Não foi possível cadastrar o produto.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isEditing ? "Editar produto" : "Cadastrar produto"}
      description={isEditing ? "Atualize os dados do produto" : "Adicione um produto ao catálogo"}
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" form="product-form" loading={saving}>
            {isEditing ? "Salvar" : "Cadastrar"}
          </Button>
        </>
      }
    >
      <form id="product-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            id="pr-code"
            label="Código"
            placeholder="PROD-001"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
          <Input
            id="pr-name"
            label="Nome do produto"
            placeholder="Nome do produto"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            id="pr-company"
            label="Empresa representada"
            placeholder="Opcional"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            list="pr-companies"
          />
          <datalist id="pr-companies">
            {existingCompanies.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>

          <MaskedInput
            id="pr-unit-value"
            mask="currency"
            label="Valor unitário (R$)"
            placeholder="0,00"
            value={unitValue}
            onChange={setUnitValue}
            required
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="h-4 w-4 rounded border-border-strong bg-surface-1 text-brand-500 focus:ring-2 focus:ring-brand-500/20"
          />
          <span className="text-sm text-foreground">Produto ativo</span>
        </label>

        {error && (
          <p className="rounded-lg border border-danger/25 bg-danger/10 px-3 py-2 text-xs font-medium text-danger">
            {error}
          </p>
        )}
      </form>
    </Modal>
  );
}
