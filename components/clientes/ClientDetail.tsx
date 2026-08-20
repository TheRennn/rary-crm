import { ClientHeader } from "./ClientHeader";
import { ClientOverview } from "./ClientOverview";
import { ClientTimeline } from "./ClientTimeline";
import { ClientPurchases } from "./ClientPurchases";
import { ClientPayments } from "./ClientPayments";
import { ClientActivities, type ClientActivityItem } from "./ClientActivities";
import { ClientPending } from "./ClientPending";
import { Tabs } from "@/components/ui/Tabs";
import type {
  Client,
  FollowUp,
  Payment,
  Purchase,
  Task,
  TimelineEntry,
} from "@/types";

export interface ClientDetailProps {
  client: Client;
  responsibleName: string;
  timeline: TimelineEntry[];
  purchases: Purchase[];
  payments: Payment[];
  tasks: Task[];
  followUps: FollowUp[];
}

function buildActivities(
  client: Client,
  timeline: TimelineEntry[],
  purchases: Purchase[],
  payments: Payment[]
): ClientActivityItem[] {
  const activities: ClientActivityItem[] = [];

  for (const entry of timeline) {
    activities.push({
      id: `tl-${entry.id}`,
      date: entry.date,
      title: entry.title,
      detail: entry.description,
      tone: "brand",
    });
  }
  for (const purchase of purchases) {
    activities.push({
      id: `pch-${purchase.id}`,
      date: purchase.date,
      title: `Compra: ${purchase.product}`,
      detail: `${purchase.quantity} unidade(s)`,
      tone: "success",
    });
  }
  for (const payment of payments) {
    activities.push({
      id: `pay-${payment.id}`,
      date: payment.dueDate,
      title: `Pagamento: ${payment.description}`,
      detail: `Status: ${payment.status}`,
      tone: payment.status === "PAGO" ? "success" : payment.status === "ATRASADO" ? "danger" : "neutral",
    });
  }
  return activities;
}

export function ClientDetail(props: ClientDetailProps) {
  const { client, timeline, purchases, payments, tasks, followUps } = props;
  const activities = buildActivities(client, timeline, purchases, payments);

  const tabs = [
    {
      id: "visao-geral",
      label: "Visão geral",
      content: <ClientOverview client={client} responsibleName={props.responsibleName} />,
    },
    {
      id: "tratativas",
      label: "Tratativas",
      badge: timeline.length,
      content: <ClientTimeline entries={timeline} />,
    },
    {
      id: "compras",
      label: "Compras",
      badge: purchases.length,
      content: <ClientPurchases purchases={purchases} />,
    },
    {
      id: "pagamentos",
      label: "Pagamentos",
      badge: payments.length,
      content: <ClientPayments payments={payments} />,
    },
    {
      id: "atividades",
      label: "Atividades",
      badge: activities.length,
      content: <ClientActivities activities={activities} />,
    },
    {
      id: "pendencias",
      label: "Pendências",
      badge: tasks.length,
      content: (
        <ClientPending
          tasks={tasks}
          followUps={followUps}
          clientName={client.companyName}
          clientId={client.id}
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <ClientHeader client={client} responsibleName={props.responsibleName} />
      <Tabs tabs={tabs} />
    </div>
  );
}