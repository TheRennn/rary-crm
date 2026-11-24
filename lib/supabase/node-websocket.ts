import type { SupabaseClientOptions } from "@supabase/supabase-js";
import WebSocket from "ws";

class SupabaseWebSocket extends WebSocket {
  constructor(address: string | URL, protocols?: string | string[]) {
    super(address, protocols);
  }
}

// ws implements the same runtime API, but its Node event types differ from DOM WebSocket types.
export const nodeRealtimeTransport = SupabaseWebSocket as unknown as NonNullable<
  SupabaseClientOptions<"public">["realtime"]
>["transport"];
