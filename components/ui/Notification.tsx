import type { ReactNode } from "react";
import type { Notification } from "@/types";
import { cn, relativeLabel } from "@/lib/utils";
import { NOTIFICATION_TYPE_LABELS } from "@/lib/constants";
import {
  IconAlertCircle,
  IconCheckCircle,
  IconBell,
  IconTrendingUp,
  IconRefresh,
} from "@/components/icons";
import { IconUserPlus } from "@/components/ui/icons-additional";

const typeIcon: Record<Notification["type"], ReactNode> = {
  FOLLOW_UP: <IconRefresh className="h-4 w-4" />,
  PAGAMENTO: <IconAlertCircle className="h-4 w-4" />,
  TAREFA: <IconCheckCircle className="h-4 w-4" />,
  NOVO_CLIENTE: <IconUserPlus className="h-4 w-4" />,
  NOVA_VENDA: <IconTrendingUp className="h-4 w-4" />,
};

export interface NotificationItemProps {
  notification: Notification;
  onRead?: () => void;
}

export function NotificationItem({ notification, onRead }: NotificationItemProps) {
  const unread = !notification.read;
  return (
    <button
      type="button"
      onClick={onRead}
      className={cn(
        "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-2",
        unread && "bg-brand-500/[0.04]"
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
          unread
            ? "border-brand-500/30 bg-brand-500/10 text-brand-300"
            : "border-border bg-surface-2 text-muted"
        )}
      >
        {typeIcon[notification.type] ?? <IconBell className="h-4 w-4" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className={cn("flex items-center gap-2", unread ? "text-foreground" : "text-foreground/70")}>
          <span className="text-[13px] font-medium">{notification.title}</span>
          {unread && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />}
        </span>
        <span className="mt-0.5 block text-xs text-muted">{notification.message}</span>
        <span className="mt-1 block text-[11px] text-muted-2">
          {NOTIFICATION_TYPE_LABELS[notification.type]} · {relativeLabel(notification.createdAt)}
        </span>
      </span>
    </button>
  );
}