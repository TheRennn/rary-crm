"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ClientList } from "./ClientList";
import { ProductsContent } from "@/components/financeiro/ProductsContent";
import { RegisterProductModal } from "@/components/financeiro/RegisterProductModal";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { clientService, productService } from "@/lib/services";
import type { Client, Product } from "@/types";
import { cn } from "@/lib/utils";
import { IconPlus } from "@/components/icons";

export interface ClientListClientProps {
  clients: Client[];
  products?: Product[];
  initialQuery?: string;
  initialTab?: string;
}

const tabs = [
  { id: "clientes", label: "Clientes" },
  { id: "fornecedores", label: "Fornecedores" },
  { id: "produtos", label: "Produtos" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function ClientListClient({ clients: initialClients, products: initialProducts = [], initialQuery, initialTab = "clientes" }: ClientListClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [clients, setClients] = useState(initialClients);
  const [products, setProducts] = useState(initialProducts);
  const [activeTab, setActiveTab] = useState<TabId>(initialTab as TabId);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  const existingCompanies = [...new Set(products.map((p) => p.companyName).filter(Boolean))] as string[];

  function handleTabChange(tabId: TabId) {
    setActiveTab(tabId);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tabId);
    router.push(`/clientes?${params.toString()}`);
  }

  async function handleDeleteProduct(product: Product) {
    try {
      await productService.delete(product.id);
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      toast({
        title: "Produto excluído",
        message: `${product.code} — ${product.name} foi removido.`,
        variant: "success",
      });
    } catch {
      toast({
        title: "Erro ao excluir",
        message: "Não foi possível excluir o produto. Tente novamente.",
        variant: "error",
      });
    }
  }

  async function handleDeleteClient(client: Client) {
    try {
      await clientService.delete(client.id);
      setClients((prev) => prev.filter((item) => item.id !== client.id));
      toast({ title: "Cadastro excluído", message: `${client.code} — ${client.name} foi removido.`, variant: "success" });
    } catch (error) {
      console.error("Erro ao excluir cadastro:", error);
      toast({ title: "Erro ao excluir", message: "O cadastro continua salvo. Verifique se há pedidos ou vendas vinculados e tente novamente.", variant: "error" });
    }
  }

  function handleProductCreated(product: Product) {
    setProducts((prev) => {
      const exists = prev.findIndex((p) => p.id === product.id);
      if (exists >= 0) {
        const updated = [...prev];
        updated[exists] = product;
        return updated;
      }
      return [...prev, product];
    });
    setEditProduct(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <div
        className="flex items-center gap-1 rounded-xl border border-border bg-surface-1 p-1 self-start"
        role="tablist"
        aria-label="Tipo de cadastro"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-all",
                isActive
                  ? "bg-brand-500/15 text-brand-300"
                  : "text-muted hover:bg-surface-2 hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "produtos" ? (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted">
              {products.length} produto(s) cadastrado(s)
            </p>
            <Button onClick={() => { setEditProduct(null); setProductModalOpen(true); }}>
              <IconPlus className="h-4 w-4" />
              Novo produto
            </Button>
          </div>
          <ProductsContent
            products={products}
            onEdit={(product) => { setEditProduct(product); setProductModalOpen(true); }}
            onDelete={handleDeleteProduct}
          />
          <RegisterProductModal
            open={productModalOpen}
            onClose={() => { setProductModalOpen(false); setEditProduct(null); }}
            existingCompanies={existingCompanies}
            onCreated={handleProductCreated}
            editProduct={editProduct}
          />
        </>
      ) : (
        <ClientList
          clients={clients}
          initialQuery={initialQuery}
          kindFilter={activeTab === "fornecedores" ? "FORNECEDOR" : "CLIENTE"}
          onDelete={handleDeleteClient}
        />
      )}
    </div>
  );
}
