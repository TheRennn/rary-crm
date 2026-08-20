"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";
import {
  IconCheckCircle,
  IconAlertCircle,
  IconX,
} from "@/components/icons";
import { IconHelpCircle } from "@/components/ui/icons-additional";

export type ToastVariant = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: number;
  title: string;
  message?: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (options: {
    title: string;
    message?: string;
    variant?: ToastVariant;
  }) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const variantStyles: Record<ToastVariant, { icon: ReactNode; ring: string }> = {
  success: {
    icon: <IconCheckCircle className="h-5 w-5 text-success" />,
    ring: "border-success/25",
  },
  error: {
    icon: <IconAlertCircle className="h-5 w-5 text-danger" />,
    ring: "border-danger/25",
  },
  warning: {
    icon: <IconAlertCircle className="h-5 w-5 text-warning" />,
    ring: "border-warning/25",
  },
  info: {
    icon: <IconHelpCircle className="h-5 w-5 text-info" />,
    ring: "border-info/25",
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback(
    ({ title, message, variant = "success" }: {
      title: string;
      message?: string;
      variant?: ToastVariant;
    }) => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, title, message, variant }]);
      setTimeout(() => remove(id), 4000);
    },
    [remove]
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[200] flex w-full max-w-sm flex-col gap-2">
        {toasts.map((item) => {
          const styles = variantStyles[item.variant];
          return (
            <div
              key={item.id}
              className={cn(
                "pointer-events-auto flex items-start gap-3 rounded-lg border bg-surface-2/95 p-4 shadow-xl shadow-black/50 backdrop-blur",
                styles.ring
              )}
              role="status"
            >
              <span className="mt-0.5 shrink-0">{styles.icon}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{item.title}</p>
                {item.message && (
                  <p className="mt-0.5 text-xs text-muted">{item.message}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => remove(item.id)}
                aria-label="Fechar notificação"
                className="rounded p-1 text-muted-2 transition-colors hover:text-foreground"
              >
                <IconX className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast deve ser usado dentro de <ToastProvider>");
  }
  return context;
}