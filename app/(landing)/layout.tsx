import type { ReactNode } from "react";
import type { Metadata } from "next";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingFooter } from "@/components/landing/LandingFooter";

export const metadata: Metadata = {
  title: "RARY CRM — Seu cliente. Sua operação. Tudo em um só lugar.",
  description:
    "Organize clientes, vendas, pagamentos, tarefas e follow-ups em uma única plataforma.",
};

export default function LandingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <LandingNav />
      <main className="flex-1">{children}</main>
      <LandingFooter />
    </div>
  );
}