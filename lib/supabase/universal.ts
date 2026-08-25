import { createBrowserClient, createServerClient, type CookieOptions } from "@supabase/ssr";

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

/**
 * Cria um cliente Supabase adequado para o contexto atual.
 * - No servidor: usa createServerClient com cookies do Next.js
 * - No navegador: usa createBrowserClient (singleton)
 */
export async function createUniversalClient() {
  if (typeof window === "undefined") {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();

    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value, ...options });
            } catch {}
          },
          remove(name: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value: "", ...options });
            } catch {}
          },
        },
      }
    );
  }

  if (!browserClient) {
    browserClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  return browserClient;
}
