import { mockDatabase } from "@/lib/db/mock-adapter";
import type { Task } from "@/types";

/**
 * Repository de tarefas (pendentes).
 *
 * TODO: substituir por consultas reais ao banco (PostgreSQL/Supabase).
 */
export class TaskRepository {
  async findAll(): Promise<Task[]> {
    return mockDatabase.read("tasks");
  }
}

export const taskRepository = new TaskRepository();