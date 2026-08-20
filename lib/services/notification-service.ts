import { notificationRepository } from "@/lib/repositories";
import type { Notification } from "@/types";

export interface NotificationSummary {
  unread: number;
  byType: Partial<Record<Notification["type"], number>>;
}

/**
 * Service de notificações — estrutura preparada para notificações reais
 * (banco, push, e-mail) futuramente. Hoje consome o repositório de mock.
 */
export class NotificationService {
  async getAll(): Promise<Notification[]> {
    return notificationRepository.findAll();
  }

  async getUnread(): Promise<Notification[]> {
    const all = await this.getAll();
    return all.filter((n) => !n.read);
  }

  async getSummary(): Promise<NotificationSummary> {
    const unread = await this.getUnread();
    const byType: NotificationSummary["byType"] = {};
    for (const n of unread) {
      byType[n.type] = (byType[n.type] ?? 0) + 1;
    }
    return { unread: unread.length, byType };
  }
}

export const notificationService = new NotificationService();