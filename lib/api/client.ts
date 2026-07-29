import { getToken } from "./token";

/** Browser talks to our BFF; the BFF talks to the real API (avoids CORS). */
const BASE = "/api";

/** Public auth paths — never attach Authorization. */
const PUBLIC_PATHS = new Set([
  "/rider/auth/send-otp",
  "/rider/auth/verify-otp",
]);

export function useMockApi(): boolean {
  return process.env.NEXT_PUBLIC_USE_MOCK_API === "true";
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function isUnauthorizedStatus(status: number): boolean {
  return status === 401 || status === 403;
}

/**
 * Some upstream responses use HTTP 200 with a body like
 * `{ success: false, status: 401, message: "..." }` — treat body status as authoritative.
 */
function resolveStatus(httpStatus: number, json: unknown): number {
  if (
    typeof json === "object" &&
    json !== null &&
    "status" in json &&
    typeof (json as { status: unknown }).status === "number"
  ) {
    const bodyStatus = (json as { status: number }).status;
    if (isUnauthorizedStatus(bodyStatus)) return bodyStatus;
  }
  return httpStatus;
}

function errorMessageFromBody(json: unknown, fallbackStatus: number): string {
  if (typeof json !== "object" || json === null) {
    return `HTTP ${fallbackStatus}`;
  }
  const body = json as {
    message?: string;
    error?: string;
    errors?: string[];
  };
  return (
    body.errors?.[0] ??
    body.message ??
    body.error ??
    `HTTP ${fallbackStatus}`
  );
}

/** Clear persisted session and send the rider to login when the JWT is dead. */
function forceLogoutOnUnauthorized(): void {
  if (typeof window === "undefined") return;
  // Lazy import avoids a circular dependency at module init (auth-store → … → client).
  void import("@/lib/auth-store").then(({ useAuthStore }) => {
    useAuthStore.getState().logout();
    if (window.location.pathname !== "/login") {
      window.location.replace("/login");
    }
  });
}

/** Every backend response is wrapped as { success, data, errors }. */
type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  errors?: string[];
};

function isEnvelope(json: unknown): json is ApiEnvelope<unknown> {
  return (
    typeof json === "object" &&
    json !== null &&
    "success" in json &&
    "data" in json
  );
}

function isFailedPayload(json: unknown): boolean {
  return (
    typeof json === "object" &&
    json !== null &&
    "success" in json &&
    (json as { success: unknown }).success === false
  );
}

function pathWithoutQuery(path: string): string {
  return path.split("?")[0] ?? path;
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const bare = pathWithoutQuery(path);
  const isPublic = PUBLIC_PATHS.has(bare);
  const token = isPublic ? null : getToken();

  console.log(`[api] → ${options?.method ?? "GET"} ${BASE}${path}`, {
    public: isPublic,
    hasAuthHeader: Boolean(token),
  });

  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options?.headers,
      },
    });
  } catch (err) {
    console.error(`[api] network error ${path}`, err);
    throw new ApiError(
      err instanceof Error ? err.message : "Network error",
      0,
    );
  }

  if (res.status === 204) {
    console.log(`[api] ← 204 ${path}`);
    return undefined as T;
  }

  const json = await res.json().catch(() => null);
  console.log(`[api] ← ${res.status} ${path}`, json);

  const status = resolveStatus(res.status, json);

  if (isUnauthorizedStatus(status) && !isPublic) {
    forceLogoutOnUnauthorized();
    const message = errorMessageFromBody(json, status);
    console.error(`[api] unauthorized ${path}`, message);
    throw new ApiError(message, status);
  }

  if (isEnvelope(json)) {
    if (!json.success) {
      const message = errorMessageFromBody(json, status);
      console.error(`[api] envelope error ${path}`, message, json.errors);
      throw new ApiError(message, status);
    }
    return json.data as T;
  }

  // success:false without a `data` field (common auth-failure shape from upstream)
  if (isFailedPayload(json)) {
    const message = errorMessageFromBody(json, status);
    console.error(`[api] failed payload ${path}`, message);
    throw new ApiError(message, status);
  }

  if (!res.ok) {
    const message = errorMessageFromBody(json, status);
    console.error(`[api] http error ${path}`, message);
    throw new ApiError(message, status);
  }

  return json as T;
}

export async function apiFetchOrMock<T>(
  path: string,
  mockFn: () => T | Promise<T>,
  options?: RequestInit,
): Promise<T> {
  if (useMockApi()) return mockFn();
  return apiFetch<T>(path, options);
}
