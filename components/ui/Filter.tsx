"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterProps {
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  icon?: ReactNode;
  className?: string;
  allLabel?: string;
}

export function Filter({
  options,
  value,
  onChange,
  label,
  icon,
  className,
  allLabel = "Todos",
}: FilterProps) {
  const all = { value: "TODOS", label: allLabel };
  const selected = [all, ...options].find((opt) => opt.value === value);

  return (
    <label className={cn("flex flex-col gap-1.5", className)}>
      {label && <span className="text-[13px] font-medium text-foreground">{label}</span>}
      <div className="relative flex items-center">
        {icon && (
          <span className="pointer-events-none absolute left-3 text-muted-2">{icon}</span>
        )}
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={cn(
            "h-10 w-full appearance-none rounded-lg border border-border bg-surface-1 text-sm text-foreground transition-colors focus:outline-none focus:ring-2 focus:border-brand-500/60 focus:ring-brand-500/25",
            icon ? "pl-10 pr-9" : "px-3 pr-9"
          )}
        >
          <option value={all.value}>{all.label}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <svg
          className="pointer-events-none absolute right-3 h-4 w-4 text-muted-2"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
      <span className="sr-only">{selected?.label}</span>
    </label>
  );
}