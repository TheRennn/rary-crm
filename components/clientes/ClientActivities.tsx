import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate, relativeLabel } from "@/lib/utils";
import { IconActivity } from "@/components/ui/icons-additional";

export interface ClientActivityItem {
  id: string;
  date: string;
  title: string;
  detail?: string;
  tone?: BadgeTone;
}

export function ClientActivities({ activities }: { activities: ClientActivityItem[] }) {
  const sorted = [...activities].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <Card>
      <CardHeader title="Atividades" description="Tudo que aconteceu com este cliente" />
      <CardContent className="px-2 py-2">
        {sorted.length === 0 ? (
          <EmptyState
            icon={<IconActivity className="h-6 w-6" />}
            title="Sem atividades"
            description="Registros de interações, compras e pagamentos aparecerão aqui."
          />
        ) : (
          <ul className="divide-y divide-border/60">
            {sorted.map((activity) => (
              <li key={activity.id} className="flex items-start gap-3 px-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{activity.title}</p>
                  {activity.detail && (
                    <p className="mt-0.5 text-xs text-muted">{activity.detail}</p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-[11px] text-muted-2">{relativeLabel(activity.date)}</span>
                  {activity.tone && <Badge tone={activity.tone}>{formatDate(activity.date, { day: "2-digit", month: "2-digit" })}</Badge>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}