"use client";

import { Button } from "@/components/ui/Button";
import { IconAlertCircle } from "@/components/icons";

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-danger/30 bg-danger/10 text-danger">
        <IconAlertCircle className="h-7 w-7" />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Não conseguimos carregar os dados
        </h2>
        <p className="mx-auto mt-1 max-w-sm text-sm text-muted">
          Ocorreu um erro ao montar o seu centro de comando. Tente novamente em instantes.
        </p>
      </div>
      <Button variant="outline" onClick={reset}>
        Tentar novamente
      </Button>
    </div>
  );
}