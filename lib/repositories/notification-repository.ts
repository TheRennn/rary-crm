import { mockDatabase } from "@/lib/db/mock-adapter";
import type { Notification } from "@/types";

/**
 * Repository de notificações.
 *
 * TODO: substituir por consultas reais (notificações via banco/push já prontas
 * para consumo no NotificationCenter).
 */
export class NotificationRepository {
  async findAll(): Promise<Notification[]> {
    return mockDatabase.read("notifications");
  }
}

export const notificationRepository = new NotificationRepository();