import type { ReactNode } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import type { Activity } from "@/types";
import { cn, formatDate } from "@/lib/utils";
import {
  IconUsers,
  IconTrendingUp,
  IconRefresh,
  IconCreditCard,
  IconCheckSquare,
} from "@/components/icons";

const typeIcon: Record<Activity["type"], ReactNode> = {
  CLIENTE: <IconUsers className="h-4 w-4" />,
  VENDA: <IconTrendingUp className="h-4 w-4" />,
  FOLLOW_UP: <IconRefresh className="h-4 w-4" />,
  PAGAMENTO: <IconCreditCard className="h-4 w-4" />,
  TAREFA: <IconCheckSquare className="h-4 w-4" />,
};

const typeTone: Record<Activity["type"], string> = {
  CLIENTE: "text-info",
  VENDA: "text-success",
  FOLLOW_UP: "text-brand-300",
  PAGAMENTO: "text-warning",
  TAREFA: "text-muted",
};

export function RecentActivity({ activities }: { activities: Activity[] }) {
  return (
    <Card>
      <CardHeader title="Atividades recentes" description="O que aconteceu na operação" />
      <CardContent className="px-2 py-2">
        <ul className="divide-y divide-border/60">
          {activities.map((activity) => (
            <li key={activity.id} className="flex items-start gap-3 px-3 py-3">
              <span
                className={cn(
                  "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-2",
                  typeTone[activity.type]
                )}
              >
                {typeIcon[activity.type]}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{activity.title}</p>
                <p className="mt-0.5 truncate text-xs text-muted">{activity.detail}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[11px] text-muted-2">{formatDate(activity.createdAt)}</p>
                <p className="text-[11px] text-muted-2">{activity.actor}</p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}