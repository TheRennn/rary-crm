import type {
  Activity,
  CalendarEvent,
  Client,
  Company,
  Deal,
  FollowUp,
  Notification,
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
export interface DatabaseAdapter {
  read<T extends keyof DatabaseSchema>(table: T): Promise<DatabaseSchema[T]>;
}

export interface DatabaseSchema {
  users: User[];
  companies: Company[];
  clients: Client[];
  deals: Deal[];
  purchases: Purchase[];
  payments: Payment[];
  followUps: FollowUp[];
  tasks: Task[];
  calendarEvents: CalendarEvent[];
  notifications: Notification[];
  activities: Activity[];
  timelines: Record<string, TimelineEntry[]>;
}