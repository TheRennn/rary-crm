"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { DEFAULT_THEME } from "@/lib/constants";
import type { ThemeSettings } from "@/types";

const STORAGE_KEY = "rary-theme";

interface ThemeContextValue {
  settings: ThemeSettings;
  updateSettings: (next: Partial<ThemeSettings>) => void;
  resetSettings: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyThemeVars(settings: ThemeSettings) {
  const root = document.documentElement;
  root.style.setProperty("--brand-primary", settings.brandPrimary);
  root.style.setProperty("--brand-primary-dark", settings.brandPrimaryDark);
  root.style.setProperty("--brand-primary-light", settings.brandPrimaryLight);
}

function loadSettings(): ThemeSettings {
  if (typeof window === "undefined") return DEFAULT_THEME;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<ThemeSettings>;
      return { ...DEFAULT_THEME, ...parsed };
    }
  } catch {
    // ignora storage corrompido
  }
  return DEFAULT_THEME;
}

/**
 * Provider de personalização (white-label).
 *
 * Aplica as cores de marca via CSS variables em runtime, permitindo
 * trocar identidade visual sem recompilar. O padrão inicial é o roxo RARY.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ThemeSettings>(DEFAULT_THEME);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const initial = loadSettings();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- padrão de hidratação para tema persistido
    setSettings(initial);
    applyThemeVars(initial);
  }, []);

  const updateSettings = useCallback((next: Partial<ThemeSettings>) => {
    setSettings((prev) => {
      const merged = { ...prev, ...next };
      applyThemeVars(merged);
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      } catch {
        // ignora falhas de storage
      }
      return merged;
    });
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_THEME);
    applyThemeVars(DEFAULT_THEME);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignora falhas de storage
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme deve ser usado dentro de <ThemeProvider>");
  }
  return context;
}