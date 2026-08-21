"use client";

import { useState } from "react";
import { useDashboard } from "./DashboardProvider";
import { Drawer } from "@/components/ui/Drawer";
import { Toggle } from "@/components/ui/Toggle";
import { WIDGET_CATALOG } from "@/lib/dashboard/dashboard-config";
import { DASHBOARD_MODE_LABELS } from "@/lib/dashboard/dashboard-modes";
import type { DashboardAppearance, DashboardDensity, DashboardWidgetId } from "@/lib/dashboard/dashboard-types";
import { cn } from "@/lib/utils";
import { IconChevronDown, IconRefresh } from "@/components/icons";

interface DashboardCustomizerProps {
  open: boolean;
  onClose: () => void;
}

const DENSITIES: { key: DashboardDensity; label: string; description: string }[] = [
  { key: "compact", label: "Compacto", description: "Mais informações na tela" },
  { key: "comfortable", label: "Confortável", description: "Equilíbrio padrão" },
  { key: "spacious", label: "Espaçoso", description: "Mais respiro nos cards" },
];

const APPEARANCES: { key: DashboardAppearance; label: string; description: string }[] = [
  { key: "dark", label: "Dark", description: "Padrão RARY" },
  { key: "light", label: "Light", description: "Tema claro" },
  { key: "system", label: "Sistema", description: "Segue o sistema" },
];

export function DashboardCustomizer({ open, onClose }: DashboardCustomizerProps) {
  const {
    preferences,
    widgets,
    toggleWidget,
    moveWidget,
    reorderWidgets,
    setDensity,
    setAppearance,
    resetCustomization,
  } = useDashboard();

  const [dragId, setDragId] = useState<DashboardWidgetId | null>(null);
  const [overId, setOverId] = useState<DashboardWidgetId | null>(null);

  const sorted = [...widgets].sort((a, b) => a.order - b.order);
  const orderIds = sorted.map((widget) => widget.id);

  function handleDrop(targetId: DashboardWidgetId) {
    if (!dragId || dragId === targetId) return;
    const next = [...orderIds];
    const from = next.indexOf(dragId);
    const to = next.indexOf(targetId);
    next.splice(from, 1);
    next.splice(to, 0, dragId);
    reorderWidgets(next);
    setDragId(null);
    setOverId(null);
  }

  return (
    <Drawer open={open} onClose={onClose} title="Personalizar dashboard">
      <div className="flex flex-col gap-8">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Widgets</h3>
            <span className="text-xs text-muted-2">Arraste para reordenar</span>
          </div>
          <div className="flex flex-col gap-1.5">
            {sorted.map((widget) => {
              const meta = WIDGET_CATALOG.find((item) => item.id === widget.id);
              if (!meta) return null;
              return (
                <div
                  key={widget.id}
                  draggable
                  onDragStart={() => setDragId(widget.id)}
                  onDragEnd={() => {
                    setDragId(null);
                    setOverId(null);
                  }}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setOverId(widget.id);
                  }}
                  onDrop={() => handleDrop(widget.id)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border border-border bg-surface-1 p-3 transition-all",
                    overId === widget.id && dragId !== widget.id && "border-brand-500 bg-brand-500/5",
                    dragId === widget.id && "opacity-40"
                  )}
                >
                  <button
                    type="button"
                    className="cursor-grab touch-none text-muted-2 hover:text-foreground"
                    aria-label={`Arrastar ${meta.title}`}
                    title="Arraste para reordenar"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle cx="9" cy="6" r="1.6" fill="currentColor" />
                      <circle cx="15" cy="6" r="1.6" fill="currentColor" />
                      <circle cx="9" cy="12" r="1.6" fill="currentColor" />
                      <circle cx="15" cy="12" r="1.6" fill="currentColor" />
                      <circle cx="9" cy="18" r="1.6" fill="currentColor" />
                      <circle cx="15" cy="18" r="1.6" fill="currentColor" />
                    </svg>
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{meta.title}</p>
                    <p className="truncate text-[11px] text-muted">{meta.description}</p>
                  </div>
                  <div className="flex flex-col items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => moveWidget(widget.id, -1)}
                      aria-label={`Mover ${meta.title} para cima`}
                      className="rounded p-1 text-muted-2 transition-colors hover:bg-surface-2 hover:text-foreground disabled:opacity-30"
                      disabled={widget.order === 0}
                    >
                      <IconChevronDown className="h-3.5 w-3.5 rotate-180" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveWidget(widget.id, 1)}
                      aria-label={`Mover ${meta.title} para baixo`}
                      className="rounded p-1 text-muted-2 transition-colors hover:bg-surface-2 hover:text-foreground disabled:opacity-30"
                      disabled={widget.order === sorted.length - 1}
                    >
                      <IconChevronDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <Toggle
                    checked={widget.enabled}
                    onChange={() => toggleWidget(widget.id)}
                    label={`Exibir ${meta.title}`}
                  />
                </div>
              );
            })}
          </div>
          <button
            type="button"
            onClick={resetCustomization}
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-brand-300 transition-colors hover:text-brand-200"
          >
            <IconRefresh className="h-3.5 w-3.5" />
            Restaurar padrão do modo ({DASHBOARD_MODE_LABELS[preferences.mode]})
          </button>
        </section>

        <section>
          <h3 className="mb-3 text-sm font-semibold text-foreground">Densidade</h3>
          <div className="flex gap-2">
            {DENSITIES.map((density) => (
              <button
                key={density.key}
                type="button"
                onClick={() => setDensity(density.key)}
                className={cn(
                  "flex-1 rounded-xl border p-3 text-left transition-all",
                  preferences.density === density.key
                    ? "border-brand-500/60 bg-brand-500/10"
                    : "border-border bg-surface-1 hover:border-border-strong"
                )}
              >
                <span className="block text-sm font-medium text-foreground">{density.label}</span>
                <span className="mt-0.5 block text-[11px] text-muted">{density.description}</span>
              </button>
            ))}
          </div>
        </section>

        <section>
          <h3 className="mb-3 text-sm font-semibold text-foreground">Aparência</h3>
          <div className="flex gap-2">
            {APPEARANCES.map((appearance) => (
              <button
                key={appearance.key}
                type="button"
                onClick={() => setAppearance(appearance.key)}
                className={cn(
                  "flex-1 rounded-xl border p-3 text-left transition-all",
                  preferences.appearance === appearance.key
                    ? "border-brand-500/60 bg-brand-500/10"
                    : "border-border bg-surface-1 hover:border-border-strong"
                )}
              >
                <span className="block text-sm font-medium text-foreground">{appearance.label}</span>
                <span className="mt-0.5 block text-[11px] text-muted">{appearance.description}</span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </Drawer>
  );
}