"use client";

import { useState, type FormEvent } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { DataTable, type TableColumn } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { MaskedInput } from "@/components/ui/MaskedInput";
import { Select } from "@/components/ui/Select";
import { DatePicker } from "@/components/ui/DatePicker";
import { useToast } from "@/components/ui/Toast";
import type { Purchase } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DEAL_STATUS_LABELS, DEAL_STATUS_TONES, PAYMENT_STATUS_LABELS, PAYMENT_STATUS_TONES } from "@/lib/constants";
import { IconPlus, IconTrendingUp } from "@/components/icons";

export interface ClientPurchasesProps {
  purchases: Purchase[];
}

const purchaseStatusOptions = (Object.keys(DEAL_STATUS_LABELS) as Array<keyof typeof DEAL_STATUS_LABELS>).map(
  (status) => ({ value: status, label: DEAL_STATUS_LABELS[status] })
);

const paymentStatusOptions = (Object.keys(PAYMENT_STATUS_LABELS) as Array<keyof typeof PAYMENT_STATUS_LABELS>).map(
  (status) => ({ value: status, label: PAYMENT_STATUS_LABELS[status] })
);

export function ClientPurchases({ purchases }: ClientPurchasesProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setOpen(false);
      toast({
        title: "Compra registrada",
        message: "A compra foi adicionada ao histórico (mock).",
        variant: "success",
      });
    }, 600);
  }

  const columns: TableColumn<Purchase>[] = [
    {
      key: "produto",
      header: "Produto/Serviço",
      render: (purchase) => <span className="font-medium text-foreground">{purchase.product}</span>,
    },
    {
      key: "data",
      header: "Data",
      render: (purchase) => <span className="text-muted">{formatDate(purchase.date)}</span>,
    },
    {
      key: "qtd",
      header: "Quantidade",
      render: (purchase) => <span className="text-muted">{purchase.quantity}</span>,
    },
    {
      key: "valor",
      header: "Valor",
      render: (purchase) => <span className="font-medium text-foreground">{formatCurrency(purchase.value)}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (purchase) => (
        <Badge tone={DEAL_STATUS_TONES[purchase.status]} dot>
          {DEAL_STATUS_LABELS[purchase.status]}
        </Badge>
      ),
    },
    {
      key: "pagamento",
      header: "Pagamento",
      render: (purchase) => (
        <Badge tone={PAYMENT_STATUS_TONES[purchase.paymentStatus]}>
          {PAYMENT_STATUS_LABELS[purchase.paymentStatus]}
        </Badge>
      ),
    },
  ];

  return (
    <Card>
      <CardHeader
        title="Compras"
        description="Histórico de compras do cliente"
        action={
          <Button size="sm" onClick={() => setOpen(true)}>
            <IconPlus className="h-4 w-4" />
            Registrar compra
          </Button>
        }
      />
      <CardContent className="pt-2">
        <DataTable
          columns={columns}
          data={purchases}
          rowKey={(purchase) => purchase.id}
          empty={
            <EmptyState
              icon={<IconTrendingUp className="h-6 w-6" />}
              title="Nenhuma compra registrada"
              description="Registre a primeira compra deste cliente."
            />
          }
        />
      </CardContent>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Registrar compra"
        description="Adicione uma compra ao histórico do cliente"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" form="purchase-form" loading={saving}>
              Registrar
            </Button>
          </>
        }
      >
        <form id="purchase-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input id="pch-produto" label="Produto/Serviço" placeholder="Nome do produto" required />
          <div className="grid grid-cols-2 gap-4">
            <DatePicker id="pch-data" label="Data" required />
            <Input id="pch-qtd" label="Quantidade" type="number" min={1} defaultValue={1} required />
          </div>
          <MaskedInput id="pch-valor" mask="currency" label="Valor (R$)" placeholder="0,00" required />
          <div className="grid grid-cols-2 gap-4">
            <Select id="pch-status" label="Status" options={purchaseStatusOptions} placeholder="Selecione" required defaultValue="APROVADA" />
            <Select id="pch-pagamento" label="Pagamento" options={paymentStatusOptions} placeholder="Selecione" required defaultValue="PENDENTE" />
          </div>
        </form>
      </Modal>
    </Card>
  );
}