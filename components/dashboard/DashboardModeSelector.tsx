"use client";

import { useDashboard } from "./DashboardProvider";
import { DASHBOARD_MODES } from "@/lib/dashboard/dashboard-modes";
import { cn } from "@/lib/utils";

export function DashboardModeSelector() {
  const { preferences, setMode } = useDashboard();
  const active = preferences.mode;

  return (
    <div
      className="flex items-center gap-1 overflow-x-auto rounded-xl border border-border bg-surface-1 p-1 no-scrollbar"
      role="tablist"
      aria-label="Modo de trabalho"
    >
      {DASHBOARD_MODES.map((mode) => {
        const isActive = mode.key === active;
        return (
          <button
            key={mode.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => setMode(mode.key)}
            title={mode.description}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
              isActive
                ? "bg-brand-500/15 text-brand-300"
                : "text-muted hover:bg-surface-2 hover:text-foreground"
            )}
          >
            <span className={cn("text-[13px] leading-none", isActive ? "text-brand-300" : "text-muted-2")}>
              {mode.emoji}
            </span>
            {mode.label}
          </button>
        );
      })}
    </div>
  );
}