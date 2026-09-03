"use client";

import { useState, useEffect, useCallback, forwardRef } from "react";
import { cn } from "@/lib/utils";

function isValidDate(d: Date): boolean {
  return d instanceof Date && !isNaN(d.getTime());
}

function parseFromISO(iso: string): string {
  if (!iso) return "";
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return "";
  return `${match[3]}/${match[2]}/${match[1]}`;
}

function toISO(display: string): string {
  const digits = display.replace(/\D/g, "");
  if (digits.length !== 8) return "";
  const day = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const year = digits.slice(4, 8);
  const d = new Date(Number(year), Number(month) - 1, Number(day));
  if (!isValidDate(d)) return "";
  if (d.getDate() !== Number(day) || d.getMonth() !== Number(month) - 1) return "";
  return `${year}-${month}-${day}`;
}

function maskDateInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length === 0) return "";
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export interface DateInputProps {
  id?: string;
  name?: string;
  label?: string;
  value: string;
  onChange: (isoValue: string) => void;
  required?: boolean;
  placeholder?: string;
  className?: string;
}

export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  ({ value, onChange, className, id, name, label, required, placeholder, ...props }, ref) => {
    const [display, setDisplay] = useState(() => parseFromISO(value));

    useEffect(() => {
      setDisplay(parseFromISO(value));
    }, [value]);

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const masked = maskDateInput(e.target.value);
        setDisplay(masked);
        const iso = toISO(masked);
        if (iso) {
          onChange(iso);
        }
      },
      [onChange]
    );

    const handleBlur = useCallback(() => {
      const iso = toISO(display);
      if (iso) {
        onChange(iso);
      }
    }, [display, onChange]);

    const input = (
      <input
        ref={ref}
        id={id}
        name={name}
        type="text"
        inputMode="numeric"
        placeholder={placeholder ?? "dd/mm/aaaa"}
        maxLength={10}
        required={required}
        value={display}
        onChange={handleChange}
        onBlur={handleBlur}
        className={cn(
          "h-11 w-full rounded-xl border border-border bg-surface-1 px-3 text-sm text-foreground placeholder:text-muted-2 transition-all focus:outline-none focus:ring-2",
          "hover:border-border-strong focus:border-brand-500/60 focus:ring-brand-500/25 focus:shadow-lg focus:shadow-brand-600/5",
          className
        )}
        {...props}
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

DateInput.displayName = "DateInput";
