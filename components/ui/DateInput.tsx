"use client";

import { useState, useEffect, useCallback } from "react";
import { Input, type InputProps } from "@/components/ui/Input";

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

export interface DateInputProps extends Omit<InputProps, "onChange" | "value" | "type"> {
  value: string;
  onChange: (isoValue: string) => void;
}

export function DateInput({ value, onChange, ...props }: DateInputProps) {
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

  return (
    <Input
      type="text"
      inputMode="numeric"
      placeholder="dd/mm/aaaa"
      maxLength={10}
      value={display}
      onChange={handleChange}
      onBlur={handleBlur}
      {...props}
    />
  );
}
