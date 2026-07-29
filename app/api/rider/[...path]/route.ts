import { NextRequest, NextResponse } from "next/server";

const UPSTREAM =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8083";

/** Paths that must never receive Authorization. */
const PUBLIC_SUFFIXES = ["auth/send-otp", "auth/verify-otp"];

function isPublic(path: string[]): boolean {
  const joined = path.join("/");
  return PUBLIC_SUFFIXES.some((s) => joined === s || joined.endsWith(`/${s}`));
}

async function proxy(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  const upstreamPath = `/rider/${path.join("/")}`;
  const url = new URL(upstreamPath, UPSTREAM);
  url.search = request.nextUrl.search;

  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");

  if (!isPublic(path)) {
    const bearer = request.headers.get("authorization");
    const cookieToken = request.cookies.get("unap-rider-token")?.value;
    if (bearer) {
      headers.set("Authorization", bearer);
    } else if (cookieToken) {
      headers.set("Authorization", `Bearer ${decodeURIComponent(cookieToken)}`);
    }
  }

  const init: RequestInit = {
    method: request.method,
    headers,
    cache: "no-store",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    const body = await request.text();
    if (body) init.body = body;
  }

  console.log(`[bff] ${request.method} ${url.toString()} public=${isPublic(path)}`);

  let upstream: Response;
  try {
    upstream = await fetch(url, init);
  } catch (err) {
    console.error("[bff] upstream fetch failed", err);
    return NextResponse.json(
      {
        success: false,
        data: null,
        errors: [
          err instanceof Error ? err.message : "Upstream request failed",
        ],
      },
      { status: 502 },
    );
  }

  const text = await upstream.text();
  console.log(`[bff] ${upstream.status} ${upstreamPath}`, text.slice(0, 500));

  let json: unknown = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    return NextResponse.json(
      {
        success: false,
        data: null,
        errors: [`Upstream returned non-JSON (${upstream.status})`],
      },
      { status: 502 },
    );
  }

  // Upstream sometimes returns HTTP 200 with `{ success: false, status: 401 }`.
  // Prefer the body status so the client and cookie cleanup see a real 401.
  let httpStatus = upstream.status;
  if (
    json &&
    typeof json === "object" &&
    "success" in json &&
    (json as { success: boolean }).success === false &&
    "status" in json &&
    typeof (json as { status: unknown }).status === "number"
  ) {
    const bodyStatus = (json as { status: number }).status;
    if (bodyStatus === 401 || bodyStatus === 403) {
      httpStatus = bodyStatus;
    }
  }

  const response = NextResponse.json(json, { status: httpStatus });

  // On successful verify, set the gate cookie the middleware already checks.
  if (
    path.join("/") === "auth/verify-otp" &&
    json &&
    typeof json === "object" &&
    "success" in json &&
    (json as { success: boolean }).success === true
  ) {
    const data = (json as { data?: { token?: string } }).data;
    if (data?.token) {
      response.cookies.set("unap-rider-token", data.token, {
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
        sameSite: "lax",
        httpOnly: false,
      });
    }
  }

  if (path.join("/") === "auth/logout" || httpStatus === 401) {
    response.cookies.set("unap-rider-token", "", {
      path: "/",
      maxAge: 0,
    });
  }

  return response;
}

export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
export const PUT = proxy;
export const DELETE = proxy;
