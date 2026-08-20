"use client";

import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, rows = 4, ...props }, ref) => {
    return (
      <label className={cn("flex w-full flex-col gap-1.5", className)} htmlFor={id}>
        {label && (
          <span className="text-[13px] font-medium text-foreground">{label}</span>
        )}
        <textarea
          ref={ref}
          id={id}
          rows={rows}
          className={cn(
            "w-full resize-y rounded-lg border bg-surface-1 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-2 transition-colors focus:outline-none focus:ring-2",
            error
              ? "border-danger/50 focus:border-danger focus:ring-danger/25"
              : "border-border hover:border-border-strong focus:border-brand-500/60 focus:ring-brand-500/25"
          )}
          {...props}
        />
        {error && <span className="text-xs text-danger">{error}</span>}
        {hint && !error && (
          <span className="text-xs text-muted-2">{hint}</span>
        )}
      </label>
    );
  }
);

Textarea.displayName = "Textarea";