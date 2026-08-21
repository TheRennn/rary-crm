"use client";

import { useState } from "react";
import { useDashboard } from "./DashboardProvider";
import { cn } from "@/lib/utils";
import { IconChevronDown, IconPlus, IconCheck } from "@/components/icons";
import { useToast } from "@/components/ui/Toast";

export function OrganizationSwitcher() {
  const { preferences, organizations, setOrganization } = useDashboard();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const active =
    organizations.find((org) => org.id === preferences.organizationId) ?? organizations[0];

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-1.5 rounded-lg text-xs font-semibold tracking-wide text-muted transition-colors hover:text-foreground"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-brand-500/15 text-[10px] font-bold text-brand-300">
          {active.name.charAt(0)}
        </span>
        {active.name}
        <IconChevronDown
          className={cn("h-3.5 w-3.5 text-muted-2 transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-0 top-full z-40 mt-2 w-60 overflow-hidden rounded-xl border border-border bg-surface-2 p-1.5 shadow-xl shadow-black/50"
        >
          <p className="px-3 pb-1.5 pt-2 text-[11px] font-semibold uppercase tracking-wider text-muted-2">
            Organizações
          </p>
          {organizations.map((org) => {
            const isActive = org.id === active.id;
            return (
              <button
                key={org.id}
                type="button"
                role="menuitem"
                onClick={() => {
                  setOrganization(org.id);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-colors hover:bg-surface-3",
                  isActive && "bg-brand-500/10"
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                    isActive ? "bg-brand-500/20 text-brand-300" : "bg-surface-3 text-muted"
                  )}
                >
                  {org.name.charAt(0)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-foreground">
                    {org.name}
                  </span>
                  <span className="block truncate text-[11px] text-muted">{org.tagline}</span>
                </span>
                {isActive && <IconCheck className="h-4 w-4 text-brand-400" />}
              </button>
            );
          })}
          <div className="mt-1 border-t border-border pt-1">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                toast({
                  title: "Adicionar organização",
                  message: "Multi-organização visual estará disponível em breve.",
                  variant: "info",
                });
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-brand-300 transition-colors hover:bg-surface-3"
            >
              <IconPlus className="h-4 w-4" />
              Adicionar organização
            </button>
          </div>
        </div>
      )}
    </div>
  );
}