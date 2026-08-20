"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { NAV_SECTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { IconLogout } from "@/components/icons";
import {
  IconDashboard,
  IconUsers,
  IconTrendingUp,
  IconRefresh,
  IconCalendar,
  IconCheckSquare,
  IconCreditCard,
  IconSettings,
  IconChevronRight,
} from "@/components/icons";

const iconMap: Record<string, ComponentType<{ className?: string }>> = {
  dashboard: IconDashboard,
  clientes: IconUsers,
  vendas: IconTrendingUp,
  followup: IconRefresh,
  calendario: IconCalendar,
  pendentes: IconCheckSquare,
  pagamentos: IconCreditCard,
  config: IconSettings,
};

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center border-b border-border px-5">
        <Link href="/dashboard" onClick={onNavigate} aria-label="Ir para o dashboard">
          <Logo />
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {NAV_SECTIONS.map((section, index) => (
          <div key={index} className={cn(index > 0 && "mt-6")}>
            {section.label && (
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-widest text-muted-2">
                {section.label}
              </p>
            )}
            <ul className="flex flex-col gap-0.5">
              {section.items.map((item) => {
                const Icon = iconMap[item.icon];
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      className={cn(
                        "group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-brand-500/10 text-brand-300"
                          : "text-muted hover:bg-surface-2 hover:text-foreground"
                      )}
                    >
                      <span className="flex items-center gap-3">
                        {Icon && <Icon className="h-[18px] w-[18px]" />}
                        {item.label}
                      </span>
                      {isActive && (
                        <IconChevronRight className="h-4 w-4 text-brand-500/70" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-border p-3">
        <Link
          href="/login"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
        >
          <IconLogout className="h-[18px] w-[18px]" />
          Sair da conta
        </Link>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border bg-surface-0 lg:block">
      <SidebarContent />
    </aside>
  );
}