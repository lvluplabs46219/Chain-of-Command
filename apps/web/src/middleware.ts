import { NextResponse, type NextRequest } from "next/server";

/**
 * Session cookie bridge (COC-294).
 * Reads tokens set by bootstrapWorkspaceSession and forwards them so
 * server components / route handlers can reconstruct the Supabase session.
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const access = request.cookies.get("sb-access-token")?.value;
  const refresh = request.cookies.get("sb-refresh-token")?.value;
  const tenantId = request.cookies.get("coc-tenant-id")?.value;

  if (access) {
    // Expose to downstream server code via request headers (not client-visible)
    response.headers.set("x-supabase-access-token", access);
  }
  if (refresh) {
    response.headers.set("x-supabase-refresh-token", refresh);
  }
  if (tenantId) {
    response.headers.set("x-tenant-id", tenantId);
  }

  // Protect /workspace-style surfaces: if no session cookie and path is app shell, send to login
  const path = request.nextUrl.pathname;
  const isProtected =
    path === "/" ||
    path.startsWith("/chambers") ||
    path.startsWith("/timeline") ||
    path.startsWith("/draft-desk") ||
    path.startsWith("/docket") ||
    path.startsWith("/vericue");

  const isAuthPath =
    path.startsWith("/login") ||
    path.startsWith("/signup") ||
    path.startsWith("/api");

  // Soft gate only: client AuthContext still handles demo/dev. Do not hard-block
  // until service-role bootstrap is confirmed healthy in all envs.
  if (isProtected && !isAuthPath && !access && process.env.COC_HARD_AUTH_GATE === "1") {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", path);
    return NextResponse.redirect(login);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
