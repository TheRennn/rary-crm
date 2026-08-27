"use client";

import type { Client } from "@/types";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { NewFollowUpModal } from "@/components/followup/NewFollowUpModal";
import { CLIENT_STATUS_LABELS, CLIENT_STATUS_TONES } from "@/lib/constants";
import { formatDocument } from "@/lib/utils";
import { IconEdit, IconRefresh, IconMail, IconPhone } from "@/components/icons";
import { useState } from "react";

export interface ClientHeaderProps {
  client: Client;
  responsibleName: string;
}

export function ClientHeader({ client, responsibleName }: ClientHeaderProps) {
  const router = useRouter();
  const [followUpOpen, setFollowUpOpen] = useState(false);

  const primaryContact =
    client.contacts.find((contact) => contact.primary)?.value ??
    client.contacts[0]?.value ??
    "—";

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface-1 p-5 lg:flex-row lg:items-center">
      <div className="flex items-center gap-4">
        <Avatar name={client.companyName} size="lg" />
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-muted">{client.code}</span>
            <Badge tone={CLIENT_STATUS_TONES[client.status]} dot>
              {CLIENT_STATUS_LABELS[client.status]}
            </Badge>
          </div>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-foreground">
            {client.companyName}
          </h1>
          <p className="mt-0.5 text-sm text-muted">
            {client.decisor.name} — {client.decisor.role}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-2 lg:ml-4">
        <span className="flex items-center gap-1.5">
          <IconPhone className="h-3.5 w-3.5" />
          {primaryContact}
        </span>
        <span className="flex items-center gap-1.5">
          <IconMail className="h-3.5 w-3.5" />
          {client.decisor.email}
        </span>
        <span>{formatDocument(client.cpfCnpj)}</span>
        <span>Resp.: {responsibleName}</span>
      </div>

      <div className="flex items-center gap-2 lg:ml-auto">
        <Button
          variant="secondary"
          onClick={() => router.push(`/clientes/${client.id}/editar`)}
        >
          <IconEdit className="h-4 w-4" />
          Editar
        </Button>
        <Button onClick={() => setFollowUpOpen(true)}>
          <IconRefresh className="h-4 w-4" />
          Novo Follow-up
        </Button>
      </div>

      <NewFollowUpModal
        open={followUpOpen}
        onClose={() => setFollowUpOpen(false)}
        clientId={client.id}
        clientName={client.companyName}
      />
    </div>
  );
}