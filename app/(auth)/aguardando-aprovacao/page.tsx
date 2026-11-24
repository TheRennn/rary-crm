import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";

export default function AguardandoAprovacaoPage() {
  return (
    <AuthShell
      title="Aguardando seu contato"
      description="Seu pedido de acesso ao RARY CRM foi recebido."
      footer={<Link href="/login" className="font-medium text-brand-400 hover:text-brand-300">Voltar para o login</Link>}
    >
      <div className="flex flex-col gap-4 text-center">
        <p className="text-sm leading-6 text-muted">
          Nossa equipe entrará em contato pelo e-mail e WhatsApp informados em até 24 horas. Seu acesso ao dashboard será liberado após a aprovação.
        </p>
      </div>
    </AuthShell>
  );
}
