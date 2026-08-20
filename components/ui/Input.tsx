"use client";

import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightIcon, id, ...props }, ref) => {
    return (
      <label className={cn("flex w-full flex-col gap-1.5", className)} htmlFor={id}>
        {label && (
          <span className="text-[13px] font-medium text-foreground">{label}</span>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="pointer-events-none absolute left-3 text-muted-2">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={id}
            className={cn(
              "h-11 w-full rounded-xl border bg-surface-1 px-3 text-sm text-foreground placeholder:text-muted-2 transition-all focus:outline-none focus:ring-2",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              error
                ? "border-danger/50 focus:border-danger focus:ring-danger/25"
                : "border-border hover:border-border-strong focus:border-brand-500/60 focus:ring-brand-500/25 focus:shadow-lg focus:shadow-brand-600/5"
            )}
            {...props}
          />
          {rightIcon && <span className="absolute right-3 text-muted-2">{rightIcon}</span>}
        </div>
        {error && <span className="text-xs text-danger">{error}</span>}
        {hint && !error && (
          <span className="text-xs text-muted-2">{hint}</span>
        )}
      </label>
    );
  }
);

Input.displayName = "Input";