import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("idToken")?.value;
  const path = request.nextUrl.pathname;
  const isAuthPage = path === "/login" || path === "/signup";
  if (token && (path === "/" || isAuthPage)) {
    return NextResponse.redirect(new URL("/binder", request.url));
  }
  if (isAuthPage) return NextResponse.next();
  if (path.startsWith("/binder") && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/binder/:path*", "/login", "/signup"],
};
