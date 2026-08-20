import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/brand/Logo";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 text-center">
      <Logo size="lg" />
      <div>
        <p className="text-6xl font-bold tracking-tight text-foreground">404</p>
        <h1 className="mt-2 text-lg font-semibold text-foreground">
          Página não encontrada
        </h1>
        <p className="mx-auto mt-1 max-w-sm text-sm text-muted">
          O endereço que você acessou não existe ou foi movido.
        </p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Link href="/dashboard">
          <Button>Ir para o dashboard</Button>
        </Link>
        <Link href="/">
          <Button variant="outline">Voltar ao início</Button>
        </Link>
      </div>
    </div>
  );
}