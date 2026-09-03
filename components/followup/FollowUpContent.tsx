"use client";

import Link from "next/link";
import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { DataTable, type TableColumn } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { Dropdown } from "@/components/ui/Dropdown";
import { Tabs } from "@/components/ui/Tabs";
import { useToast } from "@/components/ui/Toast";
import { NewFollowUpModal } from "./NewFollowUpModal";
import type { FollowUp } from "@/types";
import { formatDate } from "@/lib/utils";
import {
  FOLLOW_UP_STATUS_LABELS,
  FOLLOW_UP_STATUS_TONES,
  FOLLOW_UP_TYPE_LABELS,
} from "@/lib/constants";
import { IconPlus, IconRefresh, IconEdit, IconTrash, IconCheck } from "@/components/icons";

export interface FollowUpContentProps {
  groups: {
    hoje: FollowUp[];
    atrasados: FollowUp[];
    proximos: FollowUp[];
    concluidos: FollowUp[];
  };
  onDelete?: (followUp: FollowUp) => void;
  onComplete?: (followUp: FollowUp) => void;
  onEdit?: (followUp: FollowUp) => void;
  onRefresh?: () => void;
}

export function FollowUpContent({ groups, onDelete, onComplete, onEdit, onRefresh }: FollowUpContentProps) {
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);

  function columns(): TableColumn<FollowUp>[] {
    return [
      {
        key: "cliente",
        header: "Cliente",
        render: (followUp) => (
          <Link href={`/clientes/${followUp.clientId}`} className="font-medium text-foreground hover:text-brand-300">
            {followUp.clientName || "Sem cliente"}
          </Link>
        ),
      },
      {
        key: "tipo",
        header: "Tipo",
        render: (followUp) => (
          <Badge tone={FOLLOW_UP_STATUS_TONES[followUp.status]} dot>
            {FOLLOW_UP_TYPE_LABELS[followUp.type]}
          </Badge>
        ),
      },
      {
        key: "data",
        header: "Data",
        render: (followUp) => (
          <span className="text-muted">
            {formatDate(followUp.date, { day: "2-digit", month: "2-digit", year: "numeric" })}
          </span>
        ),
      },
      {
        key: "horario",
        header: "Horário",
        render: (followUp) => (
          <span className="font-mono text-sm text-foreground/90">{followUp.time}</span>
        ),
      },
      {
        key: "assunto",
        header: "Assunto",
        render: (followUp) => (
          <span className="max-w-[200px] truncate text-muted">{followUp.subject || "—"}</span>
        ),
      },
      {
        key: "status",
        header: "Status",
        render: (followUp) => (
          <Badge tone={FOLLOW_UP_STATUS_TONES[followUp.status]} dot>
            {FOLLOW_UP_STATUS_LABELS[followUp.status]}
          </Badge>
        ),
      },
      {
        key: "acao",
        header: "",
        className: "w-10",
        render: (followUp) => (
          <Dropdown
            align="right"
            triggerClassName="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-surface-3"
            trigger={<span className="text-muted">•••</span>}
            items={[
              {
                label: "Concluir",
                icon: <IconCheck className="h-4 w-4" />,
                onClick: () => onComplete?.(followUp),
              },
              {
                label: "Editar",
                icon: <IconEdit className="h-4 w-4" />,
                onClick: () => onEdit?.(followUp),
              },
              {
                label: "Excluir",
                icon: <IconTrash className="h-4 w-4" />,
                onClick: () => onDelete?.(followUp),
                danger: true,
              },
            ]}
          />
        ),
      },
    ];
  }

  const renderTable = (items: FollowUp[]) => (
    <div className="rounded-xl border border-border bg-surface-1">
      <DataTable
        columns={columns()}
        data={items}
        rowKey={(followUp) => followUp.id}
        empty={
          <EmptyState
            icon={<IconRefresh className="h-6 w-6" />}
            title="Nada por aqui"
            description="Não há follow-ups nesta categoria."
          />
        }
      />
    </div>
  );

  const tabs = [
    { id: "hoje", label: "Hoje", badge: groups.hoje.length, content: renderTable(groups.hoje) },
    { id: "atrasados", label: "Atrasados", badge: groups.atrasados.length, content: renderTable(groups.atrasados) },
    { id: "proximos", label: "Próximos", badge: groups.proximos.length, content: renderTable(groups.proximos) },
    { id: "concluidos", label: "Concluídos", badge: groups.concluidos.length, content: renderTable(groups.concluidos) },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Follow-up"
        description="Rotina comercial: ligações, mensagens, reuniões e propostas"
        actions={
          <Button onClick={() => setModalOpen(true)}>
            <IconPlus className="h-4 w-4" />
            Novo follow-up
          </Button>
        }
      />

      <Tabs tabs={tabs} />

      <NewFollowUpModal open={modalOpen} onClose={() => setModalOpen(false)} onCreated={onRefresh} />
    </div>
  );
}