import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import type { BadgeTone } from "@/lib/constants";

export type { BadgeTone };

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  dot?: boolean;
}

const toneClasses: Record<BadgeTone, { badge: string; dot: string }> = {
  neutral: { badge: "bg-white/5 text-muted border border-white/10", dot: "bg-muted" },
  brand: {
    badge: "bg-brand-500/10 text-brand-300 border border-brand-500/25",
    dot: "bg-brand-400",
  },
  success: {
    badge: "bg-success/10 text-success border border-success/25",
    dot: "bg-success",
  },
  warning: {
    badge: "bg-warning/10 text-warning border border-warning/25",
    dot: "bg-warning",
  },
  danger: {
    badge: "bg-danger/10 text-danger border border-danger/25",
    dot: "bg-danger",
  },
  info: {
    badge: "bg-info/10 text-info border border-info/25",
    dot: "bg-info",
  },
};

export function Badge({ tone = "neutral", dot, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        toneClasses[tone].badge,
        className
      )}
      {...props}
    >
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", toneClasses[tone].dot)} />}
      {children}
    </span>
  );
}