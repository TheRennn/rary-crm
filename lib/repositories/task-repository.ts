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

export type CreateTaskInput = Omit<Task, "id">;

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

  async create(input: CreateTaskInput): Promise<Task> {
    const supabase = await createUniversalClient();
    const id = `task-${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;

    const row = {
      id,
      title: input.title,
      description: input.description ?? null,
      client_id: input.clientId ?? null,
      client_name: input.clientName ?? null,
      responsible_id: input.responsibleId,
      due_date: input.dueDate,
      due_time: input.dueTime,
      status: input.status,
      completed: input.completed,
    };

    const { error: insertError } = await supabase.from("tasks").insert(row);
    if (insertError) throw insertError;
    return { id, ...input };
  }

  async update(id: string, input: Partial<CreateTaskInput>): Promise<Task> {
    const supabase = await createUniversalClient();
    const row: Record<string, unknown> = {};
    if (input.title !== undefined) row.title = input.title;
    if (input.description !== undefined) row.description = input.description ?? null;
    if (input.clientId !== undefined) row.client_id = input.clientId ?? null;
    if (input.clientName !== undefined) row.client_name = input.clientName ?? null;
    if (input.responsibleId !== undefined) row.responsible_id = input.responsibleId;
    if (input.dueDate !== undefined) row.due_date = input.dueDate;
    if (input.dueTime !== undefined) row.due_time = input.dueTime;
    if (input.status !== undefined) row.status = input.status;
    if (input.completed !== undefined) row.completed = input.completed;

    const { data, error } = await supabase.from("tasks").update(row).eq("id", id).select().single();
    if (error) throw error;
    return rowToTask(data);
  }

  async delete(id: string): Promise<void> {
    const supabase = await createUniversalClient();
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) throw error;
  }
}

export const taskRepository = new TaskRepository();
