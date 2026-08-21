"use client";

import Link from "next/link";
import { DashboardWidget } from "./DashboardWidget";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import type { RecentClientItem } from "@/lib/dashboard/dashboard-types";
import type { Client } from "@/types";
import { CLIENT_STATUS_LABELS } from "@/lib/constants";

interface RecentClientsProps {
  clients: RecentClientItem[];
}

const STATUS_TONE: Record<Client["status"], Parameters<typeof Badge>[0]["tone"]> = {
  NOVO: "info",
  EM_NEGOCIACAO: "brand",
  CLIENTE_ATIVO: "success",
  INATIVO: "neutral",
  PERDIDO: "danger",
};

export function RecentClients({ clients }: RecentClientsProps) {
  return (
    <DashboardWidget
      title="Clientes recentes"
      subtitle="Últimos cadastrados"
      action={
        <Link href="/clientes" className="text-xs font-medium text-brand-300 hover:text-brand-200">
          Ver todos
        </Link>
      }
    >
      <ul className="flex flex-col gap-2">
        {clients.map((client) => (
          <li key={client.id}>
            <Link
              href={`/clientes/${client.id}`}
              className="group flex items-center gap-3 rounded-lg border border-border px-3 py-2.5 transition-all hover:border-brand-500/40 hover:bg-surface-2/50"
            >
              <Avatar name={client.name} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{client.name}</p>
                <p className="truncate text-xs text-muted">{client.company}</p>
              </div>
              <div className="shrink-0 text-right">
                <Badge tone={STATUS_TONE[client.status]}>{CLIENT_STATUS_LABELS[client.status]}</Badge>
                <p className="mt-1 text-[11px] text-muted-2">{client.timeLabel}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </DashboardWidget>
  );
}