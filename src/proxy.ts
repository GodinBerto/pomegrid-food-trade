import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PREFIXES = [
  "/admin",
  "/orders"
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("access_token")?.value || request.cookies.get("refresh_token")?.value;

  // We removed the /auth redirect here to prevent stale cookies from blocking the login page.
  // The client-side page will redirect if truly logged in.

  // Check if route starts with any of the protected prefixes
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  // 🔒 Protected routes - require authentication
  if (isProtected) {
    // ❌ Protected but no token → redirect to auth
    if (!token) {
      return NextResponse.redirect(new URL("/auth", request.url));
    }

    // Check for admin paths
    if (pathname.startsWith("/admin")) {
        try {
            const baseUrl = process.env.NEXT_PUBLIC_APP_API_URL || "http://127.0.0.1:5000/api/v1/";
            const endpoint = baseUrl.endsWith("/") ? `${baseUrl}admin/is-admin` : `${baseUrl}/admin/is-admin`;
            
            const res = await fetch(endpoint, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            if (!res.ok) {
                return NextResponse.redirect(new URL("/", request.url));
            }
            
            const data = await res.json();
            if (!data.data?.isAdmin) {
                return NextResponse.redirect(new URL("/", request.url));
            }
        } catch (error) {
             return NextResponse.redirect(new URL("/", request.url));
        }
    }

    // ✅ Protected with token → allow access
    return NextResponse.next();
  }

  // ✅ Allow all other public routes (e.g. /shop, /products, /about, /cart)
  return NextResponse.next();
}

// Apply proxy to all routes except static files and API
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
};
