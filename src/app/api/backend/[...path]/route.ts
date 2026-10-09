import { type NextRequest, NextResponse } from "next/server";
import { backendFetch, clearSession, setSession } from "@/lib/backend-session";

type Context = { params: Promise<{ path: string[] }> };
async function handler(request: NextRequest, context: Context) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    const origin = request.headers.get("origin");
    if (origin && origin !== request.nextUrl.origin)
      return NextResponse.json(
        { success: false, message: "Origin not allowed" },
        { status: 403 },
      );
  }
  const { path } = await context.params;
  if (
    !path.length ||
    path.some(
      (segment) => segment === "." || segment === ".." || segment.includes("/"),
    )
  )
    return NextResponse.json(
      { success: false, message: "Invalid route" },
      { status: 400 },
    );
  const route = `${path.map(encodeURIComponent).join("/")}${request.nextUrl.search}`;
  const contentType = request.headers.get("content-type");
  const body =
    request.method === "GET" || request.method === "HEAD"
      ? undefined
      : await request.arrayBuffer();
  try {
    const { response, renewed } = await backendFetch(route, {
      method: request.method,
      headers: contentType ? { "Content-Type": contentType } : {},
      body,
    });
    const result = new NextResponse(await response.arrayBuffer(), {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("content-type") ?? "application/json",
      },
    });
    if (renewed) setSession(result, renewed);
    if (response.status === 401) clearSession(result);
    return result;
  } catch {
    return NextResponse.json(
      { success: false, message: "Unable to reach the backend API" },
      { status: 502 },
    );
  }
}
export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const DELETE = handler;
