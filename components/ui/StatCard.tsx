import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface StatCardProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  trend,
  trendLabel,
  className,
  ...props
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-surface-1 p-5 transition-colors hover:border-border-strong",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[13px] font-medium text-muted">{label}</p>
        {icon && <span className="text-muted-2">{icon}</span>}
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
        {value}
      </p>
      {(hint || trendLabel) && (
        <div className="mt-2 flex items-center gap-2 text-xs">
          {trendLabel && (
            <span
              className={cn(
                "font-medium",
                trend === "up" && "text-success",
                trend === "down" && "text-danger",
                trend === "neutral" && "text-muted"
              )}
            >
              {trend === "up" ? "▲ " : trend === "down" ? "▼ " : ""}
              {trendLabel}
            </span>
          )}
          {hint && <span className="text-muted-2">{hint}</span>}
        </div>
      )}
    </div>
  );
}