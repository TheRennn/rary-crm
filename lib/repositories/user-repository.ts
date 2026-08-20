import { mockDatabase } from "@/lib/db/mock-adapter";
import type { Activity, User } from "@/types";

/**
 * Repository de usuários e atividades.
 *
 * TODO: substituir por consultas reais ao banco (PostgreSQL/Supabase).
 */
export class UserRepository {
  async findAll(): Promise<User[]> {
    return mockDatabase.read("users");
  }

  async findCurrent(): Promise<User | null> {
    const users = await mockDatabase.read("users");
    return users.find((user) => user.id === "usr-ana") ?? users[0] ?? null;
  }

  async findActivities(): Promise<Activity[]> {
    return mockDatabase.read("activities");
  }
}

export const userRepository = new UserRepository();