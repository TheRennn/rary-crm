import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DashboardWidgetProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  highlighted?: boolean;
}

export function DashboardWidget({
  title,
  subtitle,
  action,
  children,
  className,
  highlighted,
}: DashboardWidgetProps) {
  return (
    <section
      className={cn(
        "dash-widget flex h-full flex-col gap-3 rounded-xl border bg-surface-1",
        highlighted
          ? "border-brand-500/40 shadow-[inset_0_1px_0_rgba(124,58,237,0.12)]"
          : "border-border",
        "dash-widget-hover",
        className
      )}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="dash-widget-title font-semibold tracking-tight text-foreground">
            {title}
          </h2>
          {subtitle && (
            <p className="dash-widget-sub mt-0.5 text-muted">{subtitle}</p>
          )}
        </div>
        {action}
      </header>
      <div className="min-w-0 flex-1">{children}</div>
    </section>
  );
}