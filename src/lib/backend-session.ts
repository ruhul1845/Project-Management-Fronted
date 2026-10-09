import "server-only";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import type { ApiResponse, User } from "./workline-types";

export const backendBase = (
  process.env.API_BASE_URL ??
  "https://project-management-saa-s-six.vercel.app/api/v1"
).replace(/\/$/, "");
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  user?: User;
}
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
};
export function setSession(response: NextResponse, tokens: TokenPair) {
  response.cookies.set("wl_access", tokens.accessToken, cookieOptions);
  response.cookies.set("wl_refresh", tokens.refreshToken, cookieOptions);
  if (tokens.user)
    response.cookies.set("wl_role", tokens.user.role, cookieOptions);
}
export function clearSession(response: NextResponse) {
  for (const name of ["wl_access", "wl_refresh", "wl_role"])
    response.cookies.delete(name);
}
export async function refreshSession(): Promise<TokenPair | null> {
  const token = (await cookies()).get("wl_refresh")?.value;
  if (!token) return null;
  try {
    const response = await fetch(`${backendBase}/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: token }),
      cache: "no-store",
    });
    const payload = (await response.json()) as ApiResponse<TokenPair>;
    return response.ok && payload.success ? payload.data : null;
  } catch {
    return null;
  }
}
export async function backendFetch(path: string, init: RequestInit = {}) {
  const token = (await cookies()).get("wl_access")?.value;
  const send = (access?: string) =>
    fetch(`${backendBase}/${path.replace(/^\//, "")}`, {
      ...init,
      cache: "no-store",
      headers: {
        ...init.headers,
        ...(access ? { Authorization: `Bearer ${access}` } : {}),
      },
    });
  let response = await send(token);
  let renewed: TokenPair | null = null;
  if (
    response.status === 401 ||
    (!token && (await cookies()).has("wl_refresh"))
  ) {
    renewed = await refreshSession();
    if (renewed) response = await send(renewed.accessToken);
  }
  return { response, renewed };
}
