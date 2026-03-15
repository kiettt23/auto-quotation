import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Paths exempt from auth check
function isPublicPath(pathname: string): boolean {
  return (
    pathname === "/" ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/share") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/fonts") ||
    pathname === "/favicon.ico"
  );
}

function isDashboardPath(pathname: string): boolean {
  // Dashboard routes are at root level (not under a route group in URL)
  const dashboardRoutes = [
    "/dashboard",
    "/products",
    "/customers",
    "/settings",
    "/templates",
    "/documents",
    "/onboarding",
    "/create-company",
  ];
  return dashboardRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths through without auth check
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Check session cookie for dashboard routes
  if (isDashboardPath(pathname)) {
    const sessionCookie = getSessionCookie(request);

    if (!sessionCookie) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Forward user identity headers for server components / route handlers
    const requestHeaders = new Headers(request.headers);
    // Session token available — actual user/tenant resolution happens in getTenantContext()
    requestHeaders.set("x-session-token", sessionCookie);
    requestHeaders.set("x-pathname", pathname);

    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except static files and Next.js internals
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
