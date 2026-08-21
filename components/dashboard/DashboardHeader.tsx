"use client";

import { useState } from "react";
import { useDashboard } from "./DashboardProvider";
import { OrganizationSwitcher } from "./OrganizationSwitcher";
import { DashboardModeSelector } from "./DashboardModeSelector";
import { NotificationCenter } from "@/components/ui/NotificationCenter";
import { PERIOD_OPTIONS } from "@/lib/dashboard/dashboard-config";
import type { DashboardPeriod } from "@/lib/dashboard/dashboard-types";
import { cn } from "@/lib/utils";
import { IconSearch, IconSliders } from "@/components/icons";

interface DashboardHeaderProps {
  userName: string;
  greeting: string;
  subtitle: string;
  onOpenCustomizer: () => void;
  onOpenPalette: () => void;
}

export function DashboardHeader({
  userName,
  greeting,
  subtitle,
  onOpenCustomizer,
  onOpenPalette,
}: DashboardHeaderProps) {
  const { preferences, setPeriod, setCustomRange } = useDashboard();
  const [customOpen, setCustomOpen] = useState(false);
  const [from, setFrom] = useState("2026-07-22");
  const [to, setTo] = useState("2026-08-20");

  function selectPeriod(period: DashboardPeriod) {
    setPeriod(period);
    if (period !== "custom") setCustomOpen(false);
  }

  function applyCustom() {
    if (!from) return;
    setCustomRange(from, to || null);
    setPeriod("custom");
    setCustomOpen(false);
  }

  return (
    <header className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <OrganizationSwitcher />
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {greeting}, <span className="text-brand-400">{userName}.</span>
          </h1>
          <p className="mt-1 text-sm text-muted">{subtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenPalette}
            className="animate-kb-pulse hidden h-9 items-center gap-2 rounded-lg border border-border bg-surface-1 px-3 text-xs text-muted transition-colors hover:border-border-strong hover:text-foreground sm:inline-flex"
            aria-label="Abrir busca rápida"
          >
            <IconSearch className="h-3.5 w-3.5" />
            <span>Buscar…</span>
            <kbd className="rounded border border-border bg-surface-3 px-1.5 py-0.5 font-mono text-[10px] text-muted-2">
              Ctrl K
            </kbd>
          </button>

          <NotificationCenter />

          <button
            type="button"
            onClick={onOpenCustomizer}
            className="flex h-9 items-center gap-1.5 rounded-lg border border-border bg-surface-1 px-3 text-xs font-medium text-foreground transition-colors hover:border-border-strong"
            aria-label="Preferências do dashboard"
          >
            <IconSliders className="h-3.5 w-3.5 text-brand-400" />
            <span className="hidden sm:inline">Preferências</span>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex items-center gap-1 rounded-xl border border-border bg-surface-1 p-1">
          {PERIOD_OPTIONS.map((option) => {
            const isActive = preferences.period === option.key;
            return (
              <button
                key={option.key}
                type="button"
                onClick={() => {
                  if (option.key === "custom") {
                    setCustomOpen((prev) => !prev);
                  } else {
                    selectPeriod(option.key);
                  }
                }}
                className={cn(
                  "relative rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                  isActive
                    ? "bg-brand-500/15 text-brand-300"
                    : "text-muted hover:text-foreground"
                )}
              >
                {option.label}
              </button>
            );
          })}

          {customOpen && (
            <div className="absolute left-0 top-full z-30 mt-2 w-56 rounded-xl border border-border bg-surface-2 p-3 shadow-xl shadow-black/50">
              <label className="mb-1 block text-[11px] font-medium text-muted">De</label>
              <input
                type="date"
                value={from}
                onChange={(event) => setFrom(event.target.value)}
                className="mb-2 block rounded-lg border border-border-strong bg-surface-1 px-2 py-1.5 text-sm text-foreground outline-none focus:border-brand-500"
              />
              <label className="mb-1 block text-[11px] font-medium text-muted">Até</label>
              <input
                type="date"
                value={to}
                onChange={(event) => setTo(event.target.value)}
                className="mb-3 block rounded-lg border border-border-strong bg-surface-1 px-2 py-1.5 text-sm text-foreground outline-none focus:border-brand-500"
              />
              <button
                type="button"
                onClick={applyCustom}
                className="w-full rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-600"
              >
                Aplicar período
              </button>
            </div>
          )}
        </div>
        <DashboardModeSelector />
      </div>
    </header>
  );
}