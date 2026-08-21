import { userRepository } from "@/lib/repositories";
import type { Activity, User } from "@/types";

/**
 * Service de usuários e feed de atividades.
 */
export class UserService {
  async getCurrentUser(email?: string): Promise<User | null> {
    return userRepository.findCurrent(email);
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
