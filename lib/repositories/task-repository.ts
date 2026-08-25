import { createUniversalClient } from "@/lib/supabase/universal";
import type { Task } from "@/types";

function rowToTask(row: Record<string, unknown>): Task {
  return {
    id: row.id as string,
    title: row.title as string,
    description: (row.description as string) ?? undefined,
    clientId: (row.client_id as string) ?? undefined,
    clientName: (row.client_name as string) ?? undefined,
    responsibleId: (row.responsible_id as string) ?? "",
    dueDate: row.due_date as string,
    dueTime: (row.due_time as string) ?? "09:00",
    status: row.status as Task["status"],
    completed: (row.completed as boolean) ?? false,
  };
}

export class TaskRepository {
  async findAll(): Promise<Task[]> {
    const supabase = await createUniversalClient();
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("due_date", { ascending: false });

    if (error || !data) return [];
    return data.map(rowToTask);
  }
}

export const taskRepository = new TaskRepository();
