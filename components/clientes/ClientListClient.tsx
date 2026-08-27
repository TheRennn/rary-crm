"use client";

import { useState } from "react";
import { ClientList } from "./ClientList";
import { useToast } from "@/components/ui/Toast";
import { clientService } from "@/lib/services";
import type { Client } from "@/types";

export interface ClientListClientProps {
  clients: Client[];
  initialQuery?: string;
}

export function ClientListClient({ clients: initialClients, initialQuery }: ClientListClientProps) {
  const { toast } = useToast();
  const [clients, setClients] = useState(initialClients);

  async function handleDelete(client: Client) {
    try {
      await clientService.delete(client.id);
      setClients((prev) => prev.filter((c) => c.id !== client.id));
      toast({
        title: "Cliente excluído",
        message: `${client.code} — ${client.name} foi removido.`,
        variant: "success",
      });
    } catch {
      toast({
        title: "Erro ao excluir",
        message: "Não foi possível excluir o cliente. Tente novamente.",
        variant: "error",
      });
    }
  }

  return (
    <ClientList
      clients={clients}
      initialQuery={initialQuery}
      onDelete={handleDelete}
    />
  );
}
