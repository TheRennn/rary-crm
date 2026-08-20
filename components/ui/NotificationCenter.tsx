"use client";

import { useEffect, useRef, useState } from "react";
import { notificationService } from "@/lib/services";
import type { Notification } from "@/types";
import { IconBell } from "@/components/icons";
import { NotificationItem } from "./Notification";
import { EmptyState } from "./EmptyState";

/**
 * Central de notificações (sino na topbar).
 *
 * Estrutura preparada para notificações reais: hoje consome o serviço de
 * notificações (mock repository). Futuramente serão alimentadas por banco/push.
 */
export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    notificationService.getAll().then(setNotifications);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unread = notifications.filter((n) => !n.read).length;

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function markRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={`Notificações (${unread} não lidas)`}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
      >
        <IconBell className="h-[18px] w-[18px]" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-bold text-white">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[min(92vw,360px)] overflow-hidden rounded-xl border border-border bg-surface-1 shadow-2xl shadow-black/50">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-foreground">Notificações</p>
            {unread > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-xs font-medium text-brand-400 transition-colors hover:text-brand-300"
              >
                Marcar todas como lidas
              </button>
            )}
          </div>
          <div className="max-h-[380px] overflow-y-auto">
            {notifications.length === 0 ? (
              <EmptyState title="Nenhuma notificação" description="Você está em dia." />
            ) : (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onRead={() => markRead(notification.id)}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}