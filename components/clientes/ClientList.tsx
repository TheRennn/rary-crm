"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/SearchInput";
import { Filter } from "@/components/ui/Filter";
import { Badge } from "@/components/ui/Badge";
import { DataTable, type TableColumn } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { Dropdown } from "@/components/ui/Dropdown";
import { useToast } from "@/components/ui/Toast";
import type { Client } from "@/types";
import { cn, formatDate, isOverdue } from "@/lib/utils";
import {
  CLIENT_STATUS_LABELS,
  CLIENT_STATUS_TONES,
  SEGMENTS,
} from "@/lib/constants";
import {
  IconPlus,
  IconEye,
  IconEdit,
  IconUsers,
  IconRefresh,
  IconTrash,
} from "@/components/icons";

export interface ClientListProps {
  clients: Client[];
  initialQuery?: string;
  onDelete?: (client: Client) => void;
}

const statusOptions = [
  { value: "NOVO", label: "Novo" },
  { value: "EM_NEGOCIACAO", label: "Em negociação" },
  { value: "CLIENTE_ATIVO", label: "Cliente ativo" },
  { value: "INATIVO", label: "Inativo" },
  { value: "PERDIDO", label: "Perdido" },
];

const segmentOptions = [
  { value: "Tecnologia", label: "Tecnologia" },
  { value: "Varejo", label: "Varejo" },
  { value: "Indústria", label: "Indústria" },
  { value: "Serviços", label: "Serviços" },
  { value: "Saúde", label: "Saúde" },
  { value: "Educação", label: "Educação" },
  { value: "Alimentação", label: "Alimentação" },
  { value: "Logística", label: "Logística" },
  { value: "Construção Civil", label: "Construção Civil" },
  { value: "Agronegócio", label: "Agronegócio" },
  { value: "Automotivo", label: "Automotivo" },
  { value: "Consultoria", label: "Consultoria" },
  { value: "E-commerce", label: "E-commerce" },
  { value: "Energia", label: "Energia" },
  { value: "Financeiro", label: "Financeiro" },
  { value: "Imobiliário", label: "Imobiliário" },
  { value: "Jurídico", label: "Jurídico" },
  { value: "Pet", label: "Pet" },
  { value: "Telecomunicações", label: "Telecomunicações" },
  { value: "Transporte", label: "Transporte" },
  { value: "Turismo", label: "Turismo" },
];

const periodOptions = [
  { value: "TODOS", label: "Todos" },
  { value: "ULTIMOS_7", label: "Últimos 7 dias" },
  { value: "ULTIMOS_30", label: "Últimos 30 dias" },
  { value: "MAIS_30", label: "Mais de 30 dias" },
];

export function ClientList({ clients, initialQuery = "", onDelete }: ClientListProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [query, setQuery] = useState(initialQuery);
  const [status, setStatus] = useState("TODOS");
  const [segment, setSegment] = useState("TODOS");
  const [period, setPeriod] = useState("TODOS");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    // eslint-disable-next-line react-hooks/purity -- filtro por recência usa o relógio do cliente
    const now = Date.now();
    return clients.filter((client) => {
      if (
        q &&
        !client.name.toLowerCase().includes(q) &&
        !client.companyName.toLowerCase().includes(q) &&
        !client.code.toLowerCase().includes(q) &&
        !client.decisor?.name.toLowerCase().includes(q)
      ) {
        return false;
      }
      if (status !== "TODOS" && client.status !== status) return false;
      if (segment !== "TODOS" && client.segment !== segment) return false;
      if (period !== "TODOS") {
        const contact = new Date(client.lastContactAt).getTime();
        const days = (now - contact) / 86400000;
        if (period === "ULTIMOS_7" && days > 7) return false;
        if (period === "ULTIMOS_30" && days > 30) return false;
        if (period === "MAIS_30" && days <= 30) return false;
      }
      return true;
    });
  }, [clients, query, status, segment, period]);

  function handleEdit(client: Client) {
    router.push(`/clientes/${client.id}/editar`);
  }

  const columns: TableColumn<Client>[] = [
    {
      key: "codigo",
      header: "Código",
      render: (client) => (
        <span className="font-mono text-xs text-muted">{client.code}</span>
      ),
    },
    {
      key: "cliente",
      header: "Cliente",
      render: (client) => (
        <Link
          href={`/clientes/${client.id}`}
          className="font-medium text-foreground hover:text-brand-300"
        >
          {client.name}
        </Link>
      ),
    },
    {
      key: "empresa",
      header: "Empresa",
      render: (client) => (
        <div>
          <p className="text-foreground/90">{client.companyName}</p>
          <p className="text-xs text-muted-2">{client.segment}</p>
        </div>
      ),
    },
    {
      key: "decisor",
      header: "Decisor",
      render: (client) => (
        <div>
          <p className="text-foreground/90">{client.decisor.name}</p>
          <p className="text-xs text-muted-2">{client.decisor.role}</p>
        </div>
      ),
    },
    {
      key: "telefone",
      header: "Telefone",
      render: (client) => (
        <span className="text-muted">{client.contacts[0]?.value ?? "—"}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (client) => (
        <Badge tone={CLIENT_STATUS_TONES[client.status]} dot>
          {CLIENT_STATUS_LABELS[client.status]}
        </Badge>
      ),
    },
    {
      key: "ultimo-contato",
      header: "Último contato",
      render: (client) => (
        <span className={cn("text-muted", isOverdue(client.lastContactAt) && "text-danger")}>
          {formatDate(client.lastContactAt)}
        </span>
      ),
    },
    {
      key: "acoes",
      header: "Ações",
      className: "w-14",
      render: (client) => (
        <Dropdown
          align="right"
          triggerClassName="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-surface-3"
          trigger={<span className="text-muted">•••</span>}
          items={[
            {
              label: "Ver detalhes",
              icon: <IconEye className="h-4 w-4" />,
              onClick: () => router.push(`/clientes/${client.id}`),
            },
            {
              label: "Novo follow-up",
              icon: <IconRefresh className="h-4 w-4" />,
              onClick: () => {
                toast({
                  title: "Novo follow-up",
                  message: `Follow-up para ${client.name} — disponível no cliente.`,
                  variant: "info",
                });
              },
            },
            {
              label: "Editar",
              icon: <IconEdit className="h-4 w-4" />,
              onClick: () => handleEdit(client),
            },
            {
              label: "Excluir",
              icon: <IconTrash className="h-4 w-4" />,
              onClick: () => onDelete?.(client),
              danger: true,
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Clientes"
        description={`${clients.length} clientes na base`}
        actions={
          <Link href="/clientes/novo">
            <Button>
              <IconPlus className="h-4 w-4" />
              Novo Cadastro
            </Button>
          </Link>
        }
      />

      <div className="flex flex-col gap-3">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Buscar por nome, empresa, código ou decisor..."
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Filter
            label="Status"
            options={statusOptions}
            value={status}
            onChange={setStatus}
          />
          <Filter
            label="Empresa (segmento)"
            options={segmentOptions}
            value={segment}
            onChange={setSegment}
          />
          <Filter
            label="Período (último contato)"
            options={periodOptions}
            value={period}
            onChange={setPeriod}
          />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface-1">
        <DataTable
          columns={columns}
          data={filtered}
          rowKey={(client) => client.id}
          onRowClick={(client) => router.push(`/clientes/${client.id}`)}
          empty={
            <EmptyState
              icon={<IconUsers className="h-6 w-6" />}
              title="Nenhum cliente encontrado"
              description="Ajuste os filtros ou cadastre um novo cliente para começar."
              action={
                <Link href="/clientes/novo">
                  <Button variant="outline">
                    <IconPlus className="h-4 w-4" />
                    Novo Cadastro
                  </Button>
                </Link>
              }
            />
          }
        />
      </div>

      <p className="text-xs text-muted-2">
        Exibindo {filtered.length} de {clients.length} clientes
      </p>
    </div>
  );
}