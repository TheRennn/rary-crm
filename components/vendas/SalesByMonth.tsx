import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { cn, formatCurrency } from "@/lib/utils";

export interface SalesByMonthData {
  byMonth: Record<string, number>;
}

export function SalesByMonth({ byMonth }: SalesByMonthData) {
  const entries = Object.entries(byMonth).sort(([a], [b]) => a.localeCompare(b));
  const max = Math.max(...entries.map(([, value]) => value), 1);

  return (
    <Card>
      <CardHeader title="Vendas por período" description="Valor concluído por mês" />
      <CardContent>
        {entries.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted">
            Nenhuma venda concluída ainda.
          </p>
        ) : (
          <div className="flex h-40 items-end gap-3">
            {entries.map(([month, value]) => (
              <div key={month} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                <span className="text-[11px] font-medium text-muted">
                  {formatCurrency(value)}
                </span>
                <div
                  className={cn(
                    "w-full max-w-[56px] rounded-t-md bg-gradient-to-t from-brand-700 to-brand-500 transition-all",
                    value === 0 && "h-1 bg-surface-3"
                  )}
                  style={{ height: `${Math.max((value / max) * 100, 4)}%` }}
                />
                <span className="text-[11px] text-muted-2">{month}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}