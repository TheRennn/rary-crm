import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { IconLink, IconChevronRight, IconRobot } from "@/components/icons";

export function SettingsIntegrations() {
  const { toast } = useToast();

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-brand-500/25 bg-brand-500/10 text-brand-300">
            <IconRobot className="h-6 w-6" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold text-foreground">Follow-App</h3>
              <Badge tone="neutral">Planejado</Badge>
            </div>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              Integração de tratativas e relacionamento com clientes. A conexão
              oficial será habilitada em um próximo sprint.
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={() =>
              toast({
                title: "Integração em desenvolvimento",
                message: "A conexão oficial com o Follow-App chega no próximo sprint.",
                variant: "info",
              })
            }
          >
            <IconLink className="h-4 w-4" />
            Conectar
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Link
            href="/configuracoes/integracoes"
            className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-surface-2"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">Central de integrações</p>
              <p className="mt-0.5 text-xs text-muted">
                Visualize todas as integrações disponíveis e suas conexões.
              </p>
            </div>
            <IconChevronRight className="h-4 w-4 shrink-0 text-muted-2" />
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}