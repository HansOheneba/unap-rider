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

  if (isUnauthorizedStatus(res.status) && !isPublic) {
    forceLogoutOnUnauthorized();
  }

  if (isEnvelope(json)) {
    if (!json.success) {
      const message = json.errors?.[0] ?? `HTTP ${res.status}`;
      console.error(`[api] envelope error ${path}`, message, json.errors);
      throw new ApiError(message, res.status);
    }
    return json.data as T;
  }

  if (!res.ok) {
    const message =
      (json as { error?: string; message?: string } | null)?.error ??
      (json as { message?: string } | null)?.message ??
      `HTTP ${res.status}`;
    console.error(`[api] http error ${path}`, message);
    throw new ApiError(message, res.status);
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
