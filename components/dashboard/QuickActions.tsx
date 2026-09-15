"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { IconZap, IconRefresh, IconCheckSquare, IconCreditCard } from "@/components/icons";
import { IconUserPlus } from "@/components/ui/icons-additional";

const ACTIONS = [
  {
    id: "client",
    label: "Novo cliente",
    href: "/clientes/novo?kind=CLIENTE",
    icon: IconUserPlus,
    tone: "text-brand-300 bg-brand-500/10 border-brand-500/25",
  },
  {
    id: "venda",
    label: "Nova venda",
    href: "/vendas",
    icon: IconZap,
    tone: "text-success bg-success/10 border-success/25",
  },
  {
    id: "followup",
    label: "Novo follow-up",
    href: "/follow-up",
    icon: IconRefresh,
    tone: "text-info bg-info/10 border-info/25",
  },
  {
    id: "tarefa",
    label: "Nova tarefa",
    href: "/pendentes",
    icon: IconCheckSquare,
    tone: "text-warning bg-warning/10 border-warning/25",
  },
  {
    id: "financeiro",
    label: "Ver financeiro",
    href: "/financeiro",
    icon: IconCreditCard,
    tone: "text-brand-300 bg-brand-500/10 border-brand-500/25",
  },
];

export function QuickActions() {
  return (
    <div className="flex flex-wrap gap-2">
      {ACTIONS.map((action) => (
        <Link
          key={action.id}
          href={action.href}
          className={cn(
            "group flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-all hover:-translate-y-0.5",
            action.tone
          )}
        >
          <action.icon className="h-4 w-4 transition-transform group-hover:scale-110" />
          {action.label}
        </Link>
      ))}
    </div>
  );
}