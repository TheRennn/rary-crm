import type { TimelineEntry } from "@/types";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDateShort } from "@/lib/utils";

const typeLabel: Record<TimelineEntry["type"], string> = {
  LIGACAO: "Ligação",
  WHATSAPP: "WhatsApp",
  EMAIL: "E-mail",
  REUNIAO: "Reunião",
  PROPOSTA: "Proposta",
  NOTA: "Registro",
};

export function ClientTimeline({ entries }: { entries: TimelineEntry[] }) {
  const sorted = [...entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <Card>
      <CardHeader title="Tratativas" description="Histórico de interações com o cliente" />
      <CardContent className="px-2 py-4">
        {sorted.length === 0 ? (
          <EmptyState
            title="Nenhuma tratativa"
            description="As interações com este cliente aparecerão aqui."
          />
        ) : (
          <ol className="relative ml-3 border-l border-border pl-6">
            {sorted.map((entry) => (
              <li key={entry.id} className="relative pb-6 last:pb-0">
                <span className="absolute -left-[31px] top-0 flex h-5 w-5 items-center justify-center rounded-full border border-border-strong bg-surface-2 text-brand-400">
                  <span className="h-2 w-2 rounded-full bg-brand-500" />
                </span>
                <div className="flex items-center gap-2">
                  <span className="rounded-md border border-border bg-surface-2 px-2 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wide text-foreground">
                    {formatDateShort(entry.date).replace("/", " ")}
                  </span>
                  <span className="text-xs font-medium text-muted-2">{typeLabel[entry.type]}</span>
                </div>
                <p className="mt-1.5 text-sm font-medium text-foreground">{entry.title}</p>
                {entry.description && (
                  <p className="mt-0.5 text-xs leading-relaxed text-muted">{entry.description}</p>
                )}
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}