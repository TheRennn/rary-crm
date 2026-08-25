import { IntegrationsPage } from "@/components/configuracoes/IntegrationsPage";
import { getFollowAppStatus } from "@/lib/integrations/follow-app";

export const dynamic = "force-dynamic";

export default async function IntegracoesPage() {
  const status = await getFollowAppStatus();

  return <IntegrationsPage followAppConnected={status.connected} />;
}