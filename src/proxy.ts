import { type NextRequest, NextResponse } from "next/server";
export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const signedIn =
    request.cookies.has("wl_access") || request.cookies.has("wl_refresh");
  if (!signedIn) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", path);
    return NextResponse.redirect(login);
  }
  if (
    path.startsWith("/admin") &&
    request.cookies.get("wl_role")?.value !== "ADMIN"
  )
    return NextResponse.redirect(new URL("/workspace", request.url));
  return NextResponse.next();
}
export const config = {
  matcher: [
    "/workspace/:path*",
    "/projects/:path*",
    "/tasks/:path*",
    "/teams/:path*",
    "/members/:path*",
    "/calendar/:path*",
    "/notifications/:path*",
    "/analytics/:path*",
    "/audit/:path*",
    "/billing/:path*",
    "/settings/:path*",
    "/admin/:path*",
  ],
};
