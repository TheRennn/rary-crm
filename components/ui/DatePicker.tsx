"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { IconCalendar } from "@/components/icons";

export interface DatePickerProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
}

/**
 * DatePicker — input de data estilizado (nativo) com ícone de calendário.
 * Em um próximo sprint pode evoluir para um calendário popover customizado.
 */
export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <label className={cn("flex w-full flex-col gap-1.5", className)} htmlFor={id}>
        {label && (
          <span className="text-[13px] font-medium text-foreground">{label}</span>
        )}
        <div className="relative flex items-center">
          <input
            ref={ref}
            id={id}
            type="date"
            className={cn(
              "h-10 w-full rounded-lg border border-border bg-surface-1 px-3 pr-9 text-sm text-foreground transition-colors focus:outline-none focus:ring-2 [color-scheme:dark]",
              error
                ? "border-danger/50 focus:border-danger focus:ring-danger/25"
                : "hover:border-border-strong focus:border-brand-500/60 focus:ring-brand-500/25"
            )}
            {...props}
          />
          <IconCalendar className="pointer-events-none absolute right-3 h-4 w-4 text-muted-2" />
        </div>
        {error && <span className="text-xs text-danger">{error}</span>}
      </label>
    );
  }
);

DatePicker.displayName = "DatePicker";