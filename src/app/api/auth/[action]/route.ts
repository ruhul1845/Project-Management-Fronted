import { type NextRequest, NextResponse } from "next/server";
import {
  backendBase,
  backendFetch,
  clearSession,
  setSession,
  type TokenPair,
} from "@/lib/backend-session";
import type { ApiResponse, User } from "@/lib/task-management-types";

type Context = { params: Promise<{ action: string }> };
const demoAccounts = {
  ADMIN: {
    email: process.env.DEMO_ADMIN_EMAIL,
    password: process.env.DEMO_ADMIN_PASSWORD,
  },
  OWNER: {
    email: process.env.DEMO_OWNER_EMAIL,
    password: process.env.DEMO_OWNER_PASSWORD,
  },
  MANAGER: {
    email: process.env.DEMO_MANAGER_EMAIL,
    password: process.env.DEMO_MANAGER_PASSWORD,
  },
  MEMBER: {
    email: process.env.DEMO_MEMBER_EMAIL,
    password: process.env.DEMO_MEMBER_PASSWORD,
  },
};
function demoAvailable(role: keyof typeof demoAccounts) {
  const account = demoAccounts[role];
  return Boolean(
    account.email &&
      account.password &&
      (role !== "MANAGER" || process.env.DEMO_MANAGER_ENABLED !== "false"),
  );
}
function invalid(message: string, status = 400) {
  return NextResponse.json({ success: false, message }, { status });
}

export async function GET(_request: NextRequest, context: Context) {
  const { action } = await context.params;
  if (action === "demos")
    return NextResponse.json({
      success: true,
      data: Object.fromEntries(
        Object.entries(demoAccounts).map(([role]) => [
          role,
          demoAvailable(role as keyof typeof demoAccounts),
        ]),
      ),
    });
  if (action !== "me") return invalid("Unknown auth action", 404);
  try {
    const { response, renewed } = await backendFetch("users/me");
    const payload = await response.json();
    const result = NextResponse.json(payload, { status: response.status });
    if (renewed) setSession(result, renewed);
    if (response.status === 401) clearSession(result);
    return result;
  } catch {
    return invalid("Unable to reach the server", 502);
  }
}

export async function POST(request: NextRequest, context: Context) {
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin)
    return invalid("Origin not allowed", 403);
  const { action } = await context.params;
  if (action === "logout") {
    try {
      await backendFetch("auth/logout", { method: "POST" });
    } catch {
      /* Local session is still cleared. */
    }
    const result = NextResponse.json({ success: true, message: "Logged out" });
    clearSession(result);
    return result;
  }
  if (!["login", "register", "google", "demo"].includes(action))
    return invalid("Unknown auth action", 404);
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return invalid("Invalid request body");
  }
  let backendAction = action;
  if (action === "demo") {
    const role = body.role;
    if (
      role !== "ADMIN" &&
      role !== "OWNER" &&
      role !== "MANAGER" &&
      role !== "MEMBER"
    )
      return invalid("Unknown demo role");
    const account = demoAccounts[role];
    if (!demoAvailable(role))
      return invalid(`${role.toLowerCase()} demo account is not ready`, 503);
    body = { email: account.email, password: account.password };
    backendAction = "login";
  }
  try {
    const response = await fetch(`${backendBase}/auth/${backendAction}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const payload = (await response.json()) as ApiResponse<
      TokenPair & { user: User }
    >;
    if (!response.ok || !payload.success)
      return NextResponse.json(payload, { status: response.status });
    const result = NextResponse.json({
      success: true,
      message: payload.message,
      data: { user: payload.data.user },
    });
    setSession(result, payload.data);
    return result;
  } catch {
    return invalid("Unable to reach the server", 502);
  }
}
