"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { IconCalendar, IconChevronLeft, IconChevronRight } from "@/components/icons";
import { DateInput } from "@/components/ui/DateInput";

export interface DatePickerProps {
  id?: string;
  name?: string;
  label?: string;
  error?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  required?: boolean;
  className?: string;
}

function toISOLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseISO(iso: string): Date | null {
  if (!iso) return null;
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

const WEEKDAYS = ["Se", "Te", "Qa", "Qi", "Se", "Sa", "Do"];
const MONTH_LABELS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

export function DatePicker({ id, name, label, error, value, defaultValue, onChange, required, className }: DatePickerProps) {
  const [internalValue, setInternalValue] = useState(value ?? defaultValue ?? "");
  const resolved = value ?? internalValue;
  const [cursor, setCursor] = useState(() => parseISO(resolved) ?? new Date());
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleChange = useCallback((iso: string) => {
    setInternalValue(iso);
    onChange?.(iso);
    const parsed = parseISO(iso);
    if (parsed) setCursor(parsed);
  }, [onChange]);

  function selectDay(day: number) {
    const selected = new Date(cursor.getFullYear(), cursor.getMonth(), day);
    const iso = toISOLocal(selected);
    setInternalValue(iso);
    onChange?.(iso);
    setOpen(false);
  }

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7;
  const todayISO = toISOLocal(new Date());

  return (
    <div className={cn("flex w-full flex-col gap-1.5 relative", className)} ref={containerRef}>
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
          value={resolved}
          onChange={handleChange}
          required={required}
          className={error ? "border-danger/50 focus:border-danger focus:ring-danger/25" : undefined}
        />
        <button
          type="button"
          aria-label="Abrir calendário"
          onClick={() => { setOpen(!open); if (!open) { const p = parseISO(resolved); if (p) setCursor(p); } }}
          className="absolute right-0 top-0 flex h-full w-10 items-center justify-center cursor-pointer"
        >
          <IconCalendar className="h-4 w-4 text-muted-2" />
        </button>
      </div>
      {error && <span className="text-xs text-danger">{error}</span>}

      {open && (
        <div className="absolute z-50 mt-1 w-72 rounded-xl border border-border bg-surface-1 p-3 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => setCursor(new Date(year, month - 1, 1))}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:bg-surface-2 hover:text-foreground"
            >
              <IconChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-semibold text-foreground">
              {MONTH_LABELS[month]} {year}
            </span>
            <button
              type="button"
              onClick={() => setCursor(new Date(year, month + 1, 1))}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:bg-surface-2 hover:text-foreground"
            >
              <IconChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {WEEKDAYS.map((d) => (
              <div key={d} className="py-1 text-center text-[10px] font-semibold uppercase text-muted-2">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const iso = toISOLocal(new Date(year, month, day));
              const isSelected = iso === resolved;
              const isToday = iso === todayISO;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => selectDay(day)}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition-colors",
                    isSelected && "bg-brand-500 text-white",
                    isToday && !isSelected && "bg-brand-500/15 text-brand-300",
                    !isSelected && !isToday && "text-foreground hover:bg-surface-2"
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

DatePicker.displayName = "DatePicker";
