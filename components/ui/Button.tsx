"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { IconLoader } from "./icons-additional";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "outline"
  | "danger"
  | "success";

export type ButtonSize = "sm" | "md" | "lg" | "xl" | "icon";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "group/btn relative overflow-hidden bg-brand-500 text-white shadow-lg shadow-brand-600/30 hover:shadow-xl hover:shadow-brand-500/40 hover:brightness-110 focus-visible:ring-brand-400/50 border border-brand-400/30",
  secondary:
    "bg-surface-2 text-foreground border border-border hover:bg-surface-3 hover:border-border-strong focus-visible:ring-border shadow-sm shadow-surface-0/50",
  ghost: "text-muted hover:text-foreground hover:bg-surface-2 focus-visible:ring-border",
  outline:
    "border border-border-strong/70 text-foreground hover:border-brand-500/60 hover:text-brand-300 hover:bg-brand-500/5 hover:shadow-md hover:shadow-brand-600/10 focus-visible:ring-border",
  danger:
    "bg-danger/10 text-danger border border-danger/25 hover:bg-danger/20 hover:shadow-lg hover:shadow-danger/10 focus-visible:ring-danger/30",
  success:
    "bg-success/10 text-success border border-success/25 hover:bg-success/20 hover:shadow-lg hover:shadow-success/10 focus-visible:ring-success/30",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-xs gap-1.5",
  md: "h-11 px-5 text-sm gap-2",
  lg: "h-13 px-8 text-base gap-2",
  xl: "h-16 px-10 text-lg gap-2.5",
  icon: "h-11 w-11",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", loading, disabled, children, ...props },
    ref
  ) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "group inline-flex items-center justify-center whitespace-nowrap rounded-xl font-semibold tracking-tight transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {variant === "primary" && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-500 ease-out group-hover/btn:translate-x-full"
        />
      )}
      {loading && <IconLoader className="h-4 w-4 animate-spin" />}
      <span className="relative z-10 inline-flex items-center justify-center gap-1.5">
        {children}
      </span>
    </button>
  )
);

Button.displayName = "Button";