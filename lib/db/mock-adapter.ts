import type { DatabaseAdapter, DatabaseSchema } from "./index";
import { mockData } from "@/lib/mock-data";

/**
 * Adapter de desenvolvimento baseado em mock data centralizado.
 *
 * TODO: substituir por adapter real do PostgreSQL/Supabase no próximo sprint.
 * O contrato DatabaseAdapter permanece o mesmo, isolando a troca.
 */
export class MockDatabaseAdapter implements DatabaseAdapter {
  private data: DatabaseSchema = mockData;

  async read<T extends keyof DatabaseSchema>(
    table: T
  ): Promise<DatabaseSchema[T]> {
    return this.data[table];
  }
}

export const mockDatabase = new MockDatabaseAdapter();