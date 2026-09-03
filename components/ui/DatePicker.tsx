"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { IconCalendar } from "@/components/icons";
import { DateInput } from "@/components/ui/DateInput";

export interface DatePickerProps {
  id?: string;
  name?: string;
  label?: string;
  error?: string;
  value?: string;
  onChange?: (value: string) => void;
  required?: boolean;
  className?: string;
}

export function DatePicker({ id, label, error, value, onChange, required, className }: DatePickerProps) {
  const [internal, setInternal] = useState(value ?? "");

  useEffect(() => {
    if (value !== undefined) setInternal(value);
  }, [value]);

  function handleChange(iso: string) {
    setInternal(iso);
    onChange?.(iso);
  }

  return (
    <label className={cn("flex w-full flex-col gap-1.5", className)} htmlFor={id}>
      {label && (
        <span className="text-[13px] font-medium text-foreground">
          {label}
          {required && <span className="ml-0.5 text-danger">*</span>}
        </span>
      )}
      <div className="relative flex items-center">
        <DateInput
          id={id}
          value={internal}
          onChange={handleChange}
          className={cn(
            "h-10 w-full rounded-lg border border-border bg-surface-1 px-3 pr-9 text-sm text-foreground transition-colors focus:outline-none focus:ring-2",
            error
              ? "border-danger/50 focus:border-danger focus:ring-danger/25"
              : "hover:border-border-strong focus:border-brand-500/60 focus:ring-brand-500/25"
          )}
        />
        <IconCalendar className="pointer-events-none absolute right-3 h-4 w-4 text-muted-2" />
      </div>
      {error && <span className="text-xs text-danger">{error}</span>}
    </label>
  );
}

DatePicker.displayName = "DatePicker";