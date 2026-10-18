import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { nodeRealtimeTransport } from "@/lib/supabase/node-websocket";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
      realtime: {
        transport: nodeRealtimeTransport,
      },
    }
  );

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (
    authError?.code === "refresh_token_not_found" ||
    authError?.code === "refresh_token_already_used"
  ) {
    const staleAuthCookies = request.cookies
      .getAll()
      .filter((cookie) => cookie.name.startsWith("sb-") && cookie.name.includes("-auth-token"));

    for (const { name } of staleAuthCookies) {
      supabaseResponse.cookies.set(name, "", {
        path: "/",
        maxAge: 0,
        expires: new Date(0),
        httpOnly: true,
        sameSite: "lax",
        secure: request.nextUrl.protocol === "https:",
      });
    }
  }

  const isAuthPage =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/cadastro") ||
    request.nextUrl.pathname.startsWith("/verificar-email");

  const isPublicPage = request.nextUrl.pathname === "/";
  const isPagamentoPage = request.nextUrl.pathname.startsWith("/pagamento");

  if (!user && !isAuthPage && !isPublicPage && !isPagamentoPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|favicon.svg|sitemap.xml|robots.txt).*)",
  ],
};
