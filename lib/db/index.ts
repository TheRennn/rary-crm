import type {
  Activity,
  CalendarEvent,
  Client,
  Commission,
  Company,
  Deal,
  FollowUp,
  Goal,
  Notification,
  Order,
  Payment,
  Purchase,
  Task,
  TimelineEntry,
  User,
} from "@/types";

/**
 * Contrato da camada de dados.
 *
 * Sprint 0: implementação de referência usa mock data (MockDatabaseAdapter).
 * Próximo sprint: conectar PostgreSQL/Supabase através de adapters reais.
 *
 * Nenhum componente deve acessar este contrato diretamente —
 * sempre passando por repositories/services.
 */
export type ArrayTable = {
  [K in keyof DatabaseSchema]: DatabaseSchema[K] extends unknown[] ? K : never;
}[keyof DatabaseSchema];

export interface DatabaseAdapter {
  read<T extends keyof DatabaseSchema>(table: T): Promise<DatabaseSchema[T]>;
  insert<T extends ArrayTable>(
    table: T,
    record: DatabaseSchema[T][number]
  ): Promise<DatabaseSchema[T][number]>;
}

export interface DatabaseSchema {
  users: User[];
  companies: Company[];
  clients: Client[];
  deals: Deal[];
  purchases: Purchase[];
  payments: Payment[];
  commissions: Commission[];
  orders: Order[];
  goals: Goal[];
  followUps: FollowUp[];
  tasks: Task[];
  calendarEvents: CalendarEvent[];
  notifications: Notification[];
  activities: Activity[];
  timelines: Record<string, TimelineEntry[]>;
}