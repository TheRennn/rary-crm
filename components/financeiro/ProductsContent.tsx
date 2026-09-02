"use client";

import { useMemo, useState } from "react";
import { Dropdown } from "@/components/ui/Dropdown";
import { StatCard } from "@/components/ui/StatCard";
import { Filter } from "@/components/ui/Filter";
import { Badge } from "@/components/ui/Badge";
import { DataTable, type TableColumn } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Product } from "@/types";
import { cn, formatCurrency } from "@/lib/utils";
import {
  PRODUCT_CATEGORY_LABELS,
  PRODUCT_UNIT_LABELS,
} from "@/lib/constants";
import {
  IconLayers,
  IconCheckCircle,
  IconAlertCircle,
  IconTrendingUp,
  IconSearch,
  IconX,
  IconEdit,
  IconTrash,
} from "@/components/icons";

export interface ProductsContentProps {
  products: Product[];
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
}

const categoryOptions = Object.entries(PRODUCT_CATEGORY_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export function ProductsContent({ products, onEdit, onDelete }: ProductsContentProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("TODOS");
  const [statusFilter, setStatusFilter] = useState("TODOS");

  const stats = useMemo(() => {
    const active = products.filter((p) => p.active);
    const inactive = products.filter((p) => !p.active);
    const totalValue = active.reduce((acc, p) => acc + p.unitValue * (p.currentStock ?? 0), 0);
    const lowStock = active.filter((p) => p.minStock && (p.currentStock ?? 0) <= p.minStock);
    return {
      total: products.length,
      activeCount: active.length,
      inactiveCount: inactive.length,
      totalValue,
      lowStockCount: lowStock.length,
    };
  }, [products]);

  const searchTerms = useMemo(
    () => query.trim().toLowerCase().split(/\s+/).filter(Boolean),
    [query]
  );

  const filtered = useMemo(() => {
    return products.filter((product) => {
      if (category !== "TODOS" && product.category !== category) return false;
      if (statusFilter === "ATIVOS" && !product.active) return false;
      if (statusFilter === "INATIVOS" && product.active) return false;
      if (searchTerms.length > 0) {
        const haystack = [product.code, product.name, product.description ?? "", product.companyName ?? ""]
          .join(" ")
          .toLowerCase();
        if (!searchTerms.every((term) => haystack.includes(term))) return false;
      }
      return true;
    });
  }, [products, category, statusFilter, searchTerms]);

  const hasActiveFilters = category !== "TODOS" || statusFilter !== "TODOS" || query.trim() !== "";

  function clearFilters() {
    setQuery("");
    setCategory("TODOS");
    setStatusFilter("TODOS");
  }

  const columns: TableColumn<Product>[] = [
    {
      key: "codigo",
      header: "Código",
      render: (product) => (
        <span className="font-mono text-xs font-semibold text-foreground">{product.code}</span>
      ),
    },
    {
      key: "nome",
      header: "Produto",
      render: (product) => (
        <div className="flex flex-col">
          <span className="font-medium text-foreground">{product.name}</span>
          {product.companyName && (
            <span className="text-xs text-muted-2">{product.companyName}</span>
          )}
        </div>
      ),
    },
    {
      key: "categoria",
      header: "Categoria",
      render: (product) => (
        <Badge tone="info">
          {PRODUCT_CATEGORY_LABELS[product.category]}
        </Badge>
      ),
    },
    {
      key: "unidade",
      header: "Unidade",
      render: (product) => <span className="text-muted">{PRODUCT_UNIT_LABELS[product.unit]}</span>,
    },
    {
      key: "valor",
      header: "Valor unit.",
      render: (product) => (
        <span className="font-semibold tabular-nums text-foreground">
          {formatCurrency(product.unitValue)}
        </span>
      ),
    },
    {
      key: "desconto",
      header: "Desconto",
      render: (product) =>
        product.discount ? (
          <Badge tone="warning">{product.discount}%</Badge>
        ) : (
          <span className="text-muted-2">—</span>
        ),
    },
    {
      key: "estoque",
      header: "Estoque",
      render: (product) => {
        const isLow = product.minStock && (product.currentStock ?? 0) <= product.minStock;
        return (
          <span className={cn("tabular-nums", isLow ? "font-semibold text-danger" : "text-muted")}>
            {product.currentStock ?? 0}
            {product.minStock ? ` / ${product.minStock} min` : ""}
          </span>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      render: (product) => (
        <Badge tone={product.active ? "success" : "neutral"} dot>
          {product.active ? "Ativo" : "Inativo"}
        </Badge>
      ),
    },
    {
      key: "acoes",
      header: "Ações",
      className: "w-14",
      render: (product) => (
        <Dropdown
          align="right"
          triggerClassName="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-surface-3"
          trigger={<span className="text-muted">•••</span>}
          items={[
            {
              label: "Editar",
              icon: <IconEdit className="h-4 w-4" />,
              onClick: () => onEdit?.(product),
            },
            {
              label: "Excluir",
              icon: <IconTrash className="h-4 w-4" />,
              danger: true,
              onClick: () => onDelete?.(product),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total de produtos"
          value={stats.total}
          icon={<IconLayers className="h-5 w-5" />}
          trend="neutral"
          trendLabel={`${stats.activeCount} ativos`}
        />
        <StatCard
          label="Valor em estoque"
          value={formatCurrency(stats.totalValue)}
          icon={<IconTrendingUp className="h-5 w-5" />}
          trend="up"
          trendLabel="custo total"
        />
        <StatCard
          label="Estoque baixo"
          value={stats.lowStockCount}
          icon={<IconAlertCircle className="h-5 w-5" />}
          trend={stats.lowStockCount > 0 ? "down" : "neutral"}
          trendLabel="abaixo do mínimo"
        />
        <StatCard
          label="Inativos"
          value={stats.inactiveCount}
          icon={<IconCheckCircle className="h-5 w-5" />}
          trend="neutral"
          trendLabel="produtos desativados"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface-1">
        <div className="flex flex-col gap-3 border-b border-border p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-0 flex-1">
              <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-2" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar por código, nome, descrição ou empresa…"
                className="h-10 w-full rounded-lg border border-border bg-surface-1 pl-9 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-2 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                aria-label="Buscar produtos"
              />
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-muted transition-colors hover:text-danger"
              >
                <IconX className="h-3.5 w-3.5" />
                Limpar filtros
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            <Filter
              options={categoryOptions}
              value={category}
              onChange={setCategory}
              className="col-span-2 sm:col-span-1"
            />
            <Filter
              options={[
                { value: "ATIVOS", label: "Ativos" },
                { value: "INATIVOS", label: "Inativos" },
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
              className="col-span-2 sm:col-span-1"
            />
          </div>
        </div>
        <DataTable
          columns={columns}
          data={filtered}
          rowKey={(product) => product.id}
          empty={
            <EmptyState
              icon={<IconLayers className="h-6 w-6" />}
              title="Nenhum produto encontrado"
              description="Ajuste a busca ou os filtros para encontrar o produto."
            />
          }
        />
      </div>
    </div>
  );
}
