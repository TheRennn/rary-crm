import { taskRepository } from "@/lib/repositories";
import type { Task } from "@/types";
import type { CreateTaskInput } from "@/lib/repositories/task-repository";

export interface TaskGroups {
  atrasadas: Task[];
  hoje: Task[];
  proximas: Task[];
  concluidas: Task[];
}

/**
 * Service de tarefas (pendentes) — agrupamento e regras de prazo.
 */
export class TaskService {
  async getAll(): Promise<Task[]> {
    return taskRepository.findAll();
  }

  async create(input: CreateTaskInput): Promise<Task> {
    return taskRepository.create(input);
  }

  async update(id: string, input: Partial<CreateTaskInput>): Promise<Task> {
    return taskRepository.update(id, input);
  }

  async delete(id: string): Promise<void> {
    return taskRepository.delete(id);
  }

  async getGroups(): Promise<TaskGroups> {
    const all = await this.getAll();
    return {
      atrasadas: all.filter((t) => t.status === "ATRASADA"),
      hoje: all.filter((t) => t.status === "HOJE"),
      proximas: all.filter((t) => t.status === "PROXIMA"),
      concluidas: all.filter((t) => t.status === "CONCLUIDA"),
    };
  }

  async countOverdueAndToday(): Promise<{ overdue: number; today: number }> {
    const { atrasadas, hoje } = await this.getGroups();
    return { overdue: atrasadas.length, today: hoje.length };
  }
}

export const taskService = new TaskService();