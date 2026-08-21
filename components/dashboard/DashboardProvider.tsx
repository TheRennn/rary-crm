"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { MODE_PRIORITY } from "@/lib/dashboard/dashboard-modes";
import { buildDefaultWidgets } from "@/lib/dashboard/dashboard-config";
import { dashboardStorage } from "@/lib/dashboard/dashboard-persistence";
import { configForMode, reorderWidgets, toggleWidget, moveWidget } from "@/lib/dashboard/dashboard-widgets";
import type {
  DashboardAppearance,
  DashboardDensity,
  DashboardMode,
  DashboardOrganization,
  DashboardPeriod,
  DashboardPreferences,
  DashboardWidgetConfig,
  DashboardWidgetId,
} from "@/lib/dashboard/dashboard-types";

export const DEFAULT_PREFERENCES: DashboardPreferences = {
  mode: "overview",
  period: "30d",
  customRange: null,
  density: "comfortable",
  appearance: "dark",
  organizationId: "org-rary",
  customized: false,
};

interface DashboardContextValue {
  preferences: DashboardPreferences;
  widgets: DashboardWidgetConfig[];
  organizations: DashboardOrganization[];
  enabledWidgets: DashboardWidgetConfig[];
  setMode: (mode: DashboardMode) => void;
  setPeriod: (period: DashboardPeriod) => void;
  setCustomRange: (from: string, to: string | null) => void;
  setDensity: (density: DashboardDensity) => void;
  setAppearance: (appearance: DashboardAppearance) => void;
  setOrganization: (organizationId: string) => void;
  toggleWidget: (id: DashboardWidgetId) => void;
  moveWidget: (id: DashboardWidgetId, direction: -1 | 1) => void;
  reorderWidgets: (ids: DashboardWidgetId[]) => void;
  resetCustomization: () => void;
  resolvedAppearance: "dark" | "light";
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

function resolveAppearance(
  appearance: DashboardAppearance,
  systemTheme: "dark" | "light"
): "dark" | "light" {
  if (appearance !== "system") return appearance;
  return systemTheme;
}

export function DashboardProvider({
  organizations,
  children,
}: {
  organizations: DashboardOrganization[];
  children: ReactNode;
}) {
  const [preferences, setPreferences] = useState<DashboardPreferences>(DEFAULT_PREFERENCES);
  const [widgets, setWidgets] = useState<DashboardWidgetConfig[]>(() =>
    buildDefaultWidgets(MODE_PRIORITY[DEFAULT_PREFERENCES.mode])
  );
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const storedPreferences = dashboardStorage.loadPreferences();
    const storedWidgets = dashboardStorage.loadWidgets();
    if (storedPreferences) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hidratação de preferências persistidas
      setPreferences({ ...DEFAULT_PREFERENCES, ...storedPreferences });
    }
    if (storedWidgets && storedWidgets.length > 0) {
      setWidgets(storedWidgets);
    }
    setHydrated(true);
  }, []);

  const [systemTheme, setSystemTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(prefers-color-scheme: light)");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resolução inicial do tema do sistema
    setSystemTheme(media.matches ? "light" : "dark");
    const handler = (event: MediaQueryListEvent) => setSystemTheme(event.matches ? "light" : "dark");
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);

  const resolvedAppearance = useMemo(
    () => resolveAppearance(preferences.appearance, systemTheme),
    [preferences.appearance, systemTheme]
  );

  const persistPrefs = useRef(false);
  useEffect(() => {
    if (!hydrated) return;
    if (!persistPrefs.current) {
      persistPrefs.current = true;
      return;
    }
    dashboardStorage.savePreferences(preferences);
  }, [preferences, hydrated]);

  const persistWidgets = useRef(false);
  useEffect(() => {
    if (!hydrated) return;
    if (!persistWidgets.current) {
      persistWidgets.current = true;
      return;
    }
    dashboardStorage.saveWidgets(widgets);
  }, [widgets, hydrated]);

  const setMode = useCallback((mode: DashboardMode) => {
    setPreferences((prev) => {
      const next = { ...prev, mode };
      if (!prev.customized) {
        setWidgets(configForMode(mode, null));
      }
      return next;
    });
  }, []);

  const setPeriod = useCallback((period: DashboardPeriod) => {
    setPreferences((prev) => ({
      ...prev,
      period,
      customRange: period === "custom" ? prev.customRange : null,
    }));
  }, []);

  const setCustomRange = useCallback((from: string, to: string | null) => {
    setPreferences((prev) => ({
      ...prev,
      customRange: { from, to: to ?? from },
    }));
  }, []);

  const setDensity = useCallback((density: DashboardDensity) => {
    setPreferences((prev) => ({ ...prev, density }));
  }, []);

  const setAppearance = useCallback((appearance: DashboardAppearance) => {
    setPreferences((prev) => ({ ...prev, appearance }));
  }, []);

  const setOrganization = useCallback((organizationId: string) => {
    setPreferences((prev) => ({ ...prev, organizationId }));
  }, []);

  const toggleWidgetCb = useCallback((id: DashboardWidgetId) => {
    setWidgets((prev) => {
      setPreferences((preferencesPrev) =>
        preferencesPrev.customized ? preferencesPrev : { ...preferencesPrev, customized: true }
      );
      return toggleWidget(prev, id);
    });
  }, []);

  const moveWidgetCb = useCallback((id: DashboardWidgetId, direction: -1 | 1) => {
    setWidgets((prev) => {
      setPreferences((preferencesPrev) =>
        preferencesPrev.customized ? preferencesPrev : { ...preferencesPrev, customized: true }
      );
      return moveWidget(prev, id, direction);
    });
  }, []);

  const reorderWidgetsCb = useCallback((ids: DashboardWidgetId[]) => {
    setWidgets((prev) => {
      setPreferences((preferencesPrev) =>
        preferencesPrev.customized ? preferencesPrev : { ...preferencesPrev, customized: true }
      );
      return reorderWidgets(prev, ids);
    });
  }, []);

  const resetCustomization = useCallback(() => {
    setPreferences((prev) => {
      const next = { ...prev, customized: false };
      setWidgets(configForMode(prev.mode, null));
      return next;
    });
  }, []);

  const enabledWidgets = useMemo(
    () =>
      widgets
        .filter((widget) => widget.enabled)
        .sort((a, b) => a.order - b.order),
    [widgets]
  );

  const value = useMemo<DashboardContextValue>(
    () => ({
      preferences,
      widgets,
      organizations,
      enabledWidgets,
      setMode,
      setPeriod,
      setCustomRange,
      setDensity,
      setAppearance,
      setOrganization,
      toggleWidget: toggleWidgetCb,
      moveWidget: moveWidgetCb,
      reorderWidgets: reorderWidgetsCb,
      resetCustomization,
      resolvedAppearance,
    }),
    [
      preferences,
      widgets,
      organizations,
      enabledWidgets,
      setMode,
      setPeriod,
      setCustomRange,
      setDensity,
      setAppearance,
      setOrganization,
      toggleWidgetCb,
      moveWidgetCb,
      reorderWidgetsCb,
      resetCustomization,
      resolvedAppearance,
    ]
  );

  return (
    <DashboardContext.Provider value={value}>
      <div data-appearance={resolvedAppearance} data-density={preferences.density} className="contents">
        {children}
      </div>
    </DashboardContext.Provider>
  );
}

export function useDashboard(): DashboardContextValue {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard deve ser usado dentro de <DashboardProvider>");
  }
  return context;
}