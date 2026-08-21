"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Dropdown } from "@/components/ui/Dropdown";
import { NotificationCenter } from "@/components/ui/NotificationCenter";
import { IconMenu, IconSearch, IconLogout, IconUser, IconSettings } from "@/components/icons";
import type { User } from "@/types";
import { ROUTES } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";

export interface TopbarProps {
  user: User | null;
  companyName: string;
  onOpenMobileNav: () => void;
}

export function Topbar({ user, companyName, onOpenMobileNav }: TopbarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSearch(event: FormEvent) {
    event.preventDefault();
    router.push(`/clientes?q=${encodeURIComponent(query)}`);
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-border bg-black/70 px-4 backdrop-blur-md sm:px-6">
      <button
        type="button"
        onClick={onOpenMobileNav}
        aria-label="Abrir menu"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-foreground lg:hidden"
      >
        <IconMenu className="h-5 w-5" />
      </button>

      <form onSubmit={handleSearch} className="relative hidden md:block md:w-64 lg:w-80">
        <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-2" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar clientes..."
          className="h-9 w-full rounded-lg border border-border bg-surface-1 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-2 transition-colors focus:outline-none focus:ring-2 focus:border-brand-500/60 focus:ring-brand-500/25"
        />
      </form>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <NotificationCenter />

        <div className="hidden h-6 w-px bg-border sm:block" />

        <Dropdown
          align="right"
          triggerClassName="gap-2.5 rounded-lg pl-1 pr-2 py-1 hover:bg-surface-2"
          trigger={
            <span className="flex items-center gap-2.5">
              <Avatar name={user?.name ?? "?"} size="sm" />
              <span className="hidden text-left sm:block">
                <span className="block text-[13px] font-medium leading-tight text-foreground">
                  {user?.name ?? "—"}
                </span>
                <span className="block text-[11px] leading-tight text-muted">
                  {companyName}
                </span>
              </span>
            </span>
          }
          items={[
            {
              label: "Meu perfil",
              icon: <IconUser className="h-4 w-4" />,
              onClick: () => router.push("/configuracoes"),
            },
            {
              label: "Configurações",
              icon: <IconSettings className="h-4 w-4" />,
              onClick: () => router.push(ROUTES.configuracoes),
            },
            {
              label: "Sair da conta",
              icon: <IconLogout className="h-4 w-4" />,
              onClick: async () => {
                const supabase = createClient();
                await supabase.auth.signOut();
                router.push("/login");
              },
              danger: true,
            },
          ]}
        />
      </div>
    </header>
  );
}