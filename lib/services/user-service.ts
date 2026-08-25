import { userRepository } from "@/lib/repositories";
import type { Activity, User } from "@/types";
import type { SupabaseClient } from "@supabase/supabase-js";

type AuthUser = { id: string; email?: string; user_metadata?: Record<string, unknown> };

/**
 * Service de usuários e feed de atividades.
 */
export class UserService {
  async getCurrentUser(authUser?: AuthUser | null, serverClient?: SupabaseClient): Promise<User | null> {
    return userRepository.findCurrent(authUser, serverClient);
  }

  async getAllUsers(): Promise<User[]> {
    return userRepository.findAll();
  }

  async getNameById(id: string): Promise<string> {
    const users = await this.getAllUsers();
    return users.find((u) => u.id === id)?.name ?? id;
  }

  async getActivities(): Promise<Activity[]> {
    return userRepository.findActivities();
  }
}

export const userService = new UserService();
