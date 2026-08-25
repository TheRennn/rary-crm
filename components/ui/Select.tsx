"use client";

import {
  forwardRef,
  type ReactNode,
  type SelectHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";
import { IconChevronDown } from "@/components/icons";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: ReactNode;
}

export interface SelectGroup {
  label: string;
  options: SelectOption[];
}

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
  options: (SelectOption | SelectGroup)[];
  placeholder?: string;
  emptyMessage?: string;
}

function isGroup(opt: SelectOption | SelectGroup): opt is SelectGroup {
  return "options" in opt;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      hint,
      icon,
      options,
      placeholder,
      emptyMessage,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const hasOptions = options.length > 0;

    return (
      <label className={cn("flex w-full flex-col gap-1.5", className)} htmlFor={id}>
        {label && (
          <span className={cn("text-[13px] font-medium text-foreground", disabled && "opacity-60")}>
            {label}
          </span>
        )}
        <div className="relative flex items-center">
          {icon && (
            <span className="pointer-events-none absolute left-3 text-muted-2">
              {icon}
            </span>
          )}
          <select
            ref={ref}
            id={id}
            disabled={disabled || !hasOptions}
            className={cn(
              "h-11 w-full appearance-none rounded-xl border bg-surface-1 px-3 pr-9 text-sm text-foreground transition-all",
              "focus:outline-none focus:ring-2",
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface-2",
              icon && "pl-10",
              error
                ? "border-danger/50 focus:border-danger focus:ring-danger/25"
                : "border-border hover:border-border-strong focus:border-brand-500/60 focus:ring-brand-500/25 focus:shadow-lg focus:shadow-brand-600/5"
            )}
            {...props}
          >
            {placeholder !== undefined && (
              <option value="">{placeholder}</option>
            )}
            {!hasOptions && emptyMessage && (
              <option value="" disabled>{emptyMessage}</option>
            )}
            {options.map((opt) => {
              if (isGroup(opt)) {
                return (
                  <optgroup key={opt.label} label={opt.label}>
                    {opt.options.map((child) => (
                      <option key={child.value} value={child.value} disabled={child.disabled}>
                        {child.label}
                      </option>
                    ))}
                  </optgroup>
                );
              }
              return (
                <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </option>
              );
            })}
          </select>
          <IconChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-muted-2" />
        </div>
        {error && <span className="text-xs text-danger">{error}</span>}
        {hint && !error && (
          <span className="text-xs text-muted-2">{hint}</span>
        )}
      </label>
    );
  }
);

Select.displayName = "Select";
