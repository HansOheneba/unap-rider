import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC = ["/login", "/~offline"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    PUBLIC.some((p) => pathname === p) ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/logos") ||
    pathname.startsWith("/icons") ||
    pathname === "/manifest.webmanifest" ||
    pathname === "/sw.js"
  ) {
    return NextResponse.next();
  }

  // Cookie is a lightweight gate only. Session validity is confirmed client-side
  // via GET /rider/auth/me in RiderGuard (stale JWTs must reach /login after logout).
  const token = request.cookies.get("unap-rider-token")?.value;
  if (!token && pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sw.js|icons).*)"],
};
