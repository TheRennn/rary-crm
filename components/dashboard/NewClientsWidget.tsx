"use client";

import { DashboardWidget } from "./DashboardWidget";
import { DonutChart } from "./charts/DonutChart";
import { IconUserPlus } from "@/components/ui/icons-additional";
import type { Client } from "@/types";
import { CLIENT_STATUS_LABELS, CLIENT_STATUS_TONES } from "@/lib/constants";
import { Badge } from "@/components/ui/Badge";

interface NewClientsWidgetProps {
  clients: Client[];
}

export function NewClientsWidget({ clients }: NewClientsWidgetProps) {
  const novos = clients.filter((client) => client.status === "NOVO").length;
  const ativos = clients.filter((client) => client.status === "CLIENTE_ATIVO").length;
  const inativos = clients.filter(
    (client) => client.status === "INATIVO" || client.status === "PERDIDO"
  ).length;

  const total = Math.max(novos + ativos + inativos, 1);

  return (
    <DashboardWidget
      title="Novos clientes"
      subtitle="Distribuição da carteira"
      action={<IconUserPlus className="h-4 w-4 text-brand-400" />}
    >
      <DonutChart
        data={[
          { label: "Novos", value: novos, color: "var(--brand-primary)" },
          { label: "Ativos", value: ativos, color: "var(--success)" },
          { label: "Inativos", value: inativos, color: "var(--muted-2)" },
        ]}
        formatValue={(value) => value.toLocaleString("pt-BR")}
        centerValue={String(total)}
        centerLabel="clientes"
        size={150}
        strokeWidth={16}
      />
      <div className="mt-2 border-t border-border pt-2">
        <div className="flex flex-wrap gap-1.5">
          {(["NOVO", "CLIENTE_ATIVO", "INATIVO"] as const).map((status) => (
            <Badge key={status} tone={CLIENT_STATUS_TONES[status] as "info" | "success" | "neutral"}>
              {CLIENT_STATUS_LABELS[status]}
            </Badge>
          ))}
        </div>
      </div>
    </DashboardWidget>
  );
}