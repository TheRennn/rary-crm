import type { ReactNode } from "react";
import type { Client } from "@/types";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CLIENT_STATUS_LABELS, CLIENT_STATUS_TONES } from "@/lib/constants";
import { formatDate, formatDocument, relativeLabel } from "@/lib/utils";
import {
  IconMail,
  IconPhone,
  IconMessageCircle,
} from "@/components/icons";

export interface ClientOverviewProps {
  client: Client;
  responsibleName: string;
}

function InfoBlock({
  label,
  value,
  sub,
}: {
  label: string;
  value: ReactNode;
  sub?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface-0/60 px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-2">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-muted">{sub}</p>}
    </div>
  );
}

export function ClientOverview({ client, responsibleName }: ClientOverviewProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader title="Empresa" description="Dados cadastrais" />
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            <InfoBlock label="Empresa" value={client.companyName} sub={formatDocument(client.companyCnpj)} />
            <InfoBlock label="Segmento" value={client.segment} />
            <InfoBlock
              label="Localização"
              value={`${client.city || "—"}${client.state ? `, ${client.state}` : ""}`}
            />
            <InfoBlock label="Tipo" value={client.type === "PESSOA_JURIDICA" ? "Pessoa jurídica" : "Pessoa física"} />
            <InfoBlock label="Origem" value={client.origin} />
            <InfoBlock label="Responsável" value={responsibleName} />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader title="Status e interações" />
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Status</span>
              <Badge tone={CLIENT_STATUS_TONES[client.status]} dot>
                {CLIENT_STATUS_LABELS[client.status]}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Última interação</span>
              <span className="text-sm font-medium text-foreground">
                {formatDate(client.lastContactAt)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Próxima interação</span>
              <span className="text-sm font-medium text-foreground">
                {client.nextInteractionAt
                  ? relativeLabel(client.nextInteractionAt)
                  : "—"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="lg:col-span-3">
        <CardHeader title="Decisor" description="Contato de decisão" />
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <InfoBlock label="Nome" value={client.decisor.name} />
            <InfoBlock label="Cargo" value={client.decisor.role} />
            <InfoBlock
              label="Telefone"
              value={client.decisor.phone}
            />
            <InfoBlock
              label="E-mail"
              value={client.decisor.email}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-3">
        <CardHeader title="Contatos" description="Canais de comunicação" />
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            {client.contacts.map((contact, index) => {
              const Icon =
                contact.type === "WHATSAPP"
                  ? IconMessageCircle
                  : contact.type === "EMAIL"
                    ? IconMail
                    : IconPhone;
              return (
                <div
                  key={index}
                  className="flex items-center gap-3 rounded-lg border border-border bg-surface-0/60 px-4 py-3"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand-500/25 bg-brand-500/10 text-brand-300">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-2">
                      {contact.type === "WHATSAPP"
                        ? "WhatsApp"
                        : contact.type.charAt(0) + contact.type.slice(1).toLowerCase()}
                    </p>
                    <p className="truncate text-sm font-medium text-foreground">{contact.value}</p>
                  </div>
                  {contact.primary && (
                    <Badge tone="brand" className="ml-auto">Principal</Badge>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {client.notes && (
        <Card className="lg:col-span-3">
          <CardHeader title="Observações" />
          <CardContent>
            <p className="text-sm leading-relaxed text-muted">{client.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}