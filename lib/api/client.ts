import { getToken } from "./token";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8083";

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

export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  if (res.status === 204) return undefined as T;

  const json = await res.json().catch(() => null);

  if (isEnvelope(json)) {
    if (!json.success) {
      throw new ApiError(json.errors?.[0] ?? `HTTP ${res.status}`, res.status);
    }
    return json.data as T;
  }

  if (!res.ok) {
    const message =
      (json as { error?: string; message?: string } | null)?.error ??
      (json as { message?: string } | null)?.message ??
      `HTTP ${res.status}`;
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
