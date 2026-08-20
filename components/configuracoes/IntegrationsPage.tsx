"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { IconLink, IconRobot, IconGlobe, IconArrowLeft } from "@/components/icons";
import Link from "next/link";

export interface IntegrationsPageProps {
  followAppConnected: boolean;
}

export function IntegrationsPage({ followAppConnected }: IntegrationsPageProps) {
  const { toast } = useToast();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Integrações"
        description="Conecte o RARY CRM com as ferramentas da sua operação"
        actions={
          <Link href="/configuracoes">
            <Button variant="ghost">
              <IconArrowLeft className="h-4 w-4" />
              Voltar para configurações
            </Button>
          </Link>
        }
      />

      <Card>
        <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-brand-500/25 bg-brand-500/10 text-brand-300">
            <IconRobot className="h-7 w-7" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-foreground">Follow-App</h2>
              <Badge tone={followAppConnected ? "success" : "neutral"} dot>
                {followAppConnected ? "Conectado" : "Não conectado"}
              </Badge>
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              Integração de tratativas e relacionamento com clientes. Sincronize
              follow-ups e mantenha o histórico comercial sempre atualizado.
            </p>
            <p className="mt-2 text-xs text-muted-2">
              Arquitetura preparada em{" "}
              <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono">
                lib/integrations/follow-app.ts
              </code>{" "}
              — conexão oficial será implementada no próximo sprint.
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
          <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">Como funciona a integração</p>
              <p className="mt-0.5 text-xs text-muted">
                Fluxo planejado: autenticação OAuth → sincronização de tratativas → webhooks.
              </p>
            </div>
            <IconGlobe className="h-5 w-5 shrink-0 text-muted-2" />
          </div>
          <ol className="flex flex-col gap-3 px-5 py-4 text-sm">
            {[
              "Conectar a conta do Follow-App com a autorização do usuário.",
              "Importar tratativas e sincronizar follow-ups do CRM.",
              "Receber atualizações em tempo real via webhooks.",
            ].map((step, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border-strong bg-surface-2 text-xs font-semibold text-brand-300">
                  {index + 1}
                </span>
                <span className="text-muted">{step}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}