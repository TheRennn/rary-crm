import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { IconInbox } from "@/components/icons";

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-6 py-14 text-center",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-surface-2 text-muted">
        {icon ?? <IconInbox className="h-6 w-6" />}
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {description && (
          <p className="mx-auto max-w-sm text-xs text-muted">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}