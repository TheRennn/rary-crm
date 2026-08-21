import { buildDefaultWidgets } from "./dashboard-config";
import { MODE_PRIORITY } from "./dashboard-modes";
import type {
  DashboardMode,
  DashboardWidgetConfig,
  DashboardWidgetId,
} from "./dashboard-types";

export function configForMode(
  mode: DashboardMode,
  existing: DashboardWidgetConfig[] | null
): DashboardWidgetConfig[] {
  const defaults = buildDefaultWidgets(MODE_PRIORITY[mode]);

  if (!existing || existing.length === 0) return defaults;

  const byId = new Map(existing.map((widget) => [widget.id, widget]));
  const merged = defaults.map((widget) => ({
    ...widget,
    ...(byId.get(widget.id) ?? {}),
  }));

  const extra = existing.filter((widget) => !MODE_PRIORITY[mode].includes(widget.id));
  return [...merged, ...extra];
}

export function getEnabledWidgets(config: DashboardWidgetConfig[]): DashboardWidgetConfig[] {
  return config
    .filter((widget) => widget.enabled)
    .sort((a, b) => a.order - b.order);
}

export function toggleWidget(
  config: DashboardWidgetConfig[],
  id: DashboardWidgetId
): DashboardWidgetConfig[] {
  return config.map((widget) =>
    widget.id === id ? { ...widget, enabled: !widget.enabled } : widget
  );
}

export function moveWidget(
  config: DashboardWidgetConfig[],
  id: DashboardWidgetId,
  direction: -1 | 1
): DashboardWidgetConfig[] {
  const sorted = [...config].sort((a, b) => a.order - b.order);
  const index = sorted.findIndex((widget) => widget.id === id);
  if (index < 0) return config;

  const target = index + direction;
  if (target < 0 || target >= sorted.length) return config;

  const next = [...sorted];
  const [moved] = next.splice(index, 1);
  next.splice(target, 0, moved);

  return next.map((widget, order) => ({ ...widget, order }));
}

export function reorderWidgets(config: DashboardWidgetConfig[], ids: DashboardWidgetId[]): DashboardWidgetConfig[] {
  const byId = new Map(config.map((widget) => [widget.id, widget]));
  return ids
    .map((id, order) => byId.get(id) && { ...byId.get(id)!, order })
    .filter(Boolean) as DashboardWidgetConfig[];
}