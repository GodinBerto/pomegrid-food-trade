import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { hasCookieSession } from "@/lib/session-cookies";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin access is verified client-side via the is-admin API.
  if (pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/orders") && !hasCookieSession(request.cookies)) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
};
