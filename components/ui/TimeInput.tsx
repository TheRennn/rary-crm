"use client";

import { useState, useEffect, useCallback, forwardRef } from "react";
import { cn } from "@/lib/utils";

function maskTime(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length === 0) return "";
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

function isValidTime(display: string): boolean {
  if (!/^\d{2}:\d{2}$/.test(display)) return false;
  const [h, m] = display.split(":").map(Number);
  return h >= 0 && h <= 23 && m >= 0 && m <= 59;
}

export interface TimeInputProps {
  id?: string;
  name?: string;
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  required?: boolean;
  className?: string;
}

export const TimeInput = forwardRef<HTMLInputElement, TimeInputProps>(
  ({ value, onChange, className, id, name, label, required }, ref) => {
    const [display, setDisplay] = useState(value ?? "");

    useEffect(() => {
      if (value !== undefined) setDisplay(value);
    }, [value]);

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const masked = maskTime(e.target.value);
        setDisplay(masked);
        if (isValidTime(masked)) {
          onChange?.(masked);
        }
      },
      [onChange]
    );

    const handleBlur = useCallback(() => {
      if (isValidTime(display)) {
        onChange?.(display);
      }
    }, [display, onChange]);

    const input = (
      <input
        ref={ref}
        id={id}
        name={name}
        type="text"
        inputMode="numeric"
        placeholder="HH:MM"
        maxLength={5}
        required={required}
        value={display}
        onChange={handleChange}
        onBlur={handleBlur}
        className={cn(
          "h-11 w-full rounded-xl border border-border bg-surface-1 px-3 text-sm text-foreground font-mono placeholder:text-muted-2 transition-all focus:outline-none focus:ring-2",
          "hover:border-border-strong focus:border-brand-500/60 focus:ring-brand-500/25 focus:shadow-lg focus:shadow-brand-600/5",
          className
        )}
      />
    );

    if (label) {
      return (
        <div className="flex w-full flex-col gap-1.5">
          <label className="text-[13px] font-medium text-foreground" htmlFor={id}>
            {label}
            {required && <span className="ml-0.5 text-danger">*</span>}
          </label>
          {input}
        </div>
      );
    }

    return input;
  }
);

TimeInput.displayName = "TimeInput";
