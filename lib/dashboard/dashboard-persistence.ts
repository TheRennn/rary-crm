import type { DashboardPreferences, DashboardWidgetConfig } from "./dashboard-types";

export const DASHBOARD_PREFERENCES_KEY = "rary-dashboard-preferences";
export const DASHBOARD_WIDGETS_KEY = "rary-dashboard-widgets";

export interface DashboardPreferenceStorage {
  loadPreferences(): DashboardPreferences | null;
  savePreferences(preferences: DashboardPreferences): void;
  loadWidgets(): DashboardWidgetConfig[] | null;
  saveWidgets(widgets: DashboardWidgetConfig[]): void;
  clear(): void;
}

/**
 * Persistência das preferências do dashboard.
 *
 * Neste sprint usa localStorage. O contrato está isolado nesta interface para que,
 * futuramente, seja trocado por chamadas de API/banco sem reescrever os componentes.
 */
class LocalPreferenceStorage implements DashboardPreferenceStorage {
  private read<T>(key: string): T | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }

  private write(key: string, value: unknown): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignora falhas de storage (modo privado / quota)
    }
  }

  loadPreferences(): DashboardPreferences | null {
    return this.read<DashboardPreferences>(DASHBOARD_PREFERENCES_KEY);
  }

  savePreferences(preferences: DashboardPreferences): void {
    this.write(DASHBOARD_PREFERENCES_KEY, preferences);
  }

  loadWidgets(): DashboardWidgetConfig[] | null {
    return this.read<DashboardWidgetConfig[]>(DASHBOARD_WIDGETS_KEY);
  }

  saveWidgets(widgets: DashboardWidgetConfig[]): void {
    this.write(DASHBOARD_WIDGETS_KEY, widgets);
  }

  clear(): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(DASHBOARD_PREFERENCES_KEY);
      window.localStorage.removeItem(DASHBOARD_WIDGETS_KEY);
    } catch {
      // ignora
    }
  }
}

export const dashboardStorage: DashboardPreferenceStorage = new LocalPreferenceStorage();