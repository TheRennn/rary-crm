"use client";

import { cn } from "@/lib/utils";
import { IconSearch, IconX } from "@/components/icons";

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Buscar...",
  className,
}: SearchInputProps) {
  return (
    <div className={cn("relative", className)}>
      <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-2" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-lg border border-border bg-surface-1 pl-10 pr-9 text-sm text-foreground placeholder:text-muted-2 transition-colors focus:outline-none focus:ring-2 focus:border-brand-500/60 focus:ring-brand-500/25"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Limpar busca"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-2 transition-colors hover:text-foreground"
        >
          <IconX className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}