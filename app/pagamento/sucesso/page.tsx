"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { IconCheckCircle } from "@/components/icons";

export default function PagamentoSucessoPage() {
  const router = useRouter();

  return (
    <div className="flex h-screen flex-col items-center justify-center p-6 bg-background">
      <Card className="border-success">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 mb-4">
            <IconCheckCircle className="h-8 w-8" />
          </div>
          <h3 className="text-2xl font-bold text-center">Pagamento em processamento</h3>
          <p className="text-muted text-center">
            Estamos aguardando a confirmação segura do pagamento. Assim que ela for recebida, você poderá entrar no CRM.
          </p>
        </CardHeader>
        <CardContent className="p-8 text-center">
          <Button
            onClick={() => router.push("/login")}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white"
          >
            Verificar acesso no login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
