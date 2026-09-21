import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// First gate for the dashboard: visitors with no session cookie are redirected to the login page
// before any admin code is sent to them. This is only a convenience check. The cookie is validated
// by the API on every request, so a forged or stale cookie still gets no data and no actions.
const SESSION_COOKIE = "ee_admin_session";
const OPEN_PAGES = new Set(["/admin/login", "/admin/forgot-password", "/admin/reset-password"]);

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const path = pathname.replace(/\/+$/, "") || "/";

  if (!OPEN_PAGES.has(path) && !request.cookies.has(SESSION_COOKIE)) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  const response = NextResponse.next();
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
