import { mockDatabase } from "@/lib/db/mock-adapter";
import type { Activity, User } from "@/types";

/**
 * Repository de usuários e atividades.
 *
 * Busca o usuário atual a partir do e-mail da sessão Supabase,
 * fazendo o match com os dados mockados por e-mail.
 */
export class UserRepository {
  async findAll(): Promise<User[]> {
    return mockDatabase.read("users");
  }

  async findCurrent(email?: string): Promise<User | null> {
    const users = await mockDatabase.read("users");

    if (email) {
      return users.find((user) => user.email === email) ?? null;
    }

    return users[0] ?? null;
  }

  async findActivities(): Promise<Activity[]> {
    return mockDatabase.read("activities");
  }
}

export const userRepository = new UserRepository();
