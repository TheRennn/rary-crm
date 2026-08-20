import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { ROUTES } from "@/lib/constants";

const navLinks = [
  { label: "Dashboard", href: ROUTES.dashboard },
  { label: "Clientes", href: ROUTES.clientes },
  { label: "Vendas", href: ROUTES.vendas },
  { label: "Follow-up", href: ROUTES.followUp },
  { label: "Calendário", href: ROUTES.calendario },
  { label: "Pendentes", href: ROUTES.pendentes },
  { label: "Pagamentos", href: ROUTES.pagamentos },
];

export function LandingFooter() {
  return (
    <footer className="relative border-t border-brand-500/10 bg-surface-1/60">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-brand-500/40"
      />
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col items-center gap-8 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col items-center gap-3 text-center md:items-start md:text-left">
            <Logo />
            <p className="max-w-xs text-sm leading-relaxed text-muted">
              Seu cliente. Sua operação. Tudo em um só lugar.
            </p>
          </div>
          <nav className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm text-muted sm:grid-cols-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={ROUTES.integracoes}
              className="transition-colors hover:text-foreground"
            >
              Integrações
            </Link>
          </nav>
        </div>
        <div className="mt-10 flex flex-col items-center gap-2 border-t border-border pt-6 text-xs text-muted-2 md:flex-row md:justify-between">
          <span>© {new Date().getFullYear()} RARY CRM. Todos os direitos reservados.</span>
          <Link href="/login" className="transition-colors hover:text-foreground">
            Acessar área de login
          </Link>
        </div>
      </div>
    </footer>
  );
}