"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { IconCalendar } from "@/components/icons";
import { DateInput } from "@/components/ui/DateInput";
import type { InputHTMLAttributes } from "react";

export interface DatePickerProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "type"> {
  label?: string;
  error?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export function DatePicker({ id, name, label, error, value, onChange, required, className, ...rest }: DatePickerProps) {
  const [internal, setInternal] = useState(value ?? "");

  useEffect(() => {
    if (value !== undefined) setInternal(value);
  }, [value]);

  function handleChange(iso: string) {
    setInternal(iso);
    onChange?.(iso);
  }

  return (
    <div className={cn("flex w-full flex-col gap-1.5", className)}>
      {label && (
        <label className="text-[13px] font-medium text-foreground" htmlFor={id}>
          {label}
          {required && <span className="ml-0.5 text-danger">*</span>}
        </label>
      )}
      <div className="relative">
        <DateInput
          id={id}
          name={name}
          value={internal}
          onChange={handleChange}
          required={required}
          className={error ? "border-danger/50 focus:border-danger focus:ring-danger/25" : undefined}
          {...rest}
        />
        <IconCalendar className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-2" />
      </div>
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
}

DatePicker.displayName = "DatePicker";
