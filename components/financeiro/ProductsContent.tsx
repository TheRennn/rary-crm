"use client";

import { useMemo, useState } from "react";
import { Dropdown } from "@/components/ui/Dropdown";
import { StatCard } from "@/components/ui/StatCard";
import { SearchInput } from "@/components/ui/SearchInput";
import { Filter } from "@/components/ui/Filter";
import { Badge } from "@/components/ui/Badge";
import { DataTable, type TableColumn } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Product } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { IconLayers, IconEdit, IconTrash, IconTrendingUp } from "@/components/icons";

export interface ProductsContentProps {
  products: Product[];
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
}

export function ProductsContent({ products, onEdit, onDelete }: ProductsContentProps) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("TODOS");

  const stats = useMemo(() => {
    const active = products.filter((p) => p.active);
    const inactive = products.filter((p) => !p.active);
    return {
      total: products.length,
      activeCount: active.length,
      inactiveCount: inactive.length,
    };
  }, [products]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((product) => {
      if (statusFilter === "ATIVOS" && !product.active) return false;
      if (statusFilter === "INATIVOS" && product.active) return false;
      if (q && !product.code.toLowerCase().includes(q) && !product.name.toLowerCase().includes(q) && !(product.companyName ?? "").toLowerCase().includes(q)) return false;
      return true;
    });
  }, [products, query, statusFilter]);

  const columns: TableColumn<Product>[] = [
    {
      key: "codigo",
      header: "Código",
      render: (p) => <span className="font-mono text-xs font-semibold text-foreground">{p.code}</span>,
    },
    {
      key: "nome",
      header: "Produto",
      render: (p) => (
        <div className="flex flex-col">
          <span className="font-medium text-foreground">{p.name}</span>
          {p.companyName && <span className="text-xs text-muted-2">{p.companyName}</span>}
        </div>
      ),
    },
    {
      key: "valor",
      header: "Valor",
      render: (p) => <span className="font-semibold tabular-nums text-foreground">{formatCurrency(p.unitValue)}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (p) => (
        <Badge tone={p.active ? "success" : "neutral"} dot>
          {p.active ? "Ativo" : "Inativo"}
        </Badge>
      ),
    },
    {
      key: "acoes",
      header: "Ações",
      className: "w-14",
      render: (p) => (
        <Dropdown
          align="right"
          triggerClassName="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-surface-3"
          trigger={<span className="text-muted">•••</span>}
          items={[
            { label: "Editar", icon: <IconEdit className="h-4 w-4" />, onClick: () => onEdit?.(p) },
            { label: "Excluir", icon: <IconTrash className="h-4 w-4" />, danger: true, onClick: () => onDelete?.(p) },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total" value={stats.total} icon={<IconLayers className="h-5 w-5" />} trend="neutral" trendLabel="produtos" />
        <StatCard label="Ativos" value={stats.activeCount} icon={<IconTrendingUp className="h-5 w-5" />} trend="up" trendLabel="em uso" />
        <StatCard label="Inativos" value={stats.inactiveCount} icon={<IconLayers className="h-5 w-5" />} trend="neutral" trendLabel="desativados" />
      </div>

      <div className="rounded-xl border border-border bg-surface-1">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Buscar por código, nome ou empresa..."
            className="w-full sm:max-w-xs"
          />
          <Filter
            options={[
              { value: "TODOS", label: "Todos" },
              { value: "ATIVOS", label: "Ativos" },
              { value: "INATIVOS", label: "Inativos" },
            ]}
            value={statusFilter}
            onChange={setStatusFilter}
            className="w-full sm:w-40"
          />
        </div>
        <DataTable
          columns={columns}
          data={filtered}
          rowKey={(p) => p.id}
          empty={
            <EmptyState
              icon={<IconLayers className="h-6 w-6" />}
              title="Nenhum produto encontrado"
              description="Cadastre um produto para visualizar."
            />
          }
        />
      </div>
    </div>
  );
}
