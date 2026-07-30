import type {
  AssignmentDetail,
  AssignmentStatus,
  Paginated,
  RiderAssignment,
  RiderRunState,
  RiderStats,
} from "@/types";
import { PAGE_SIZE } from "@/lib/constants/pagination";
import { apiFetchOrMock } from "./client";
import { mockStore } from "@/lib/mock/data-store";
import { riderIdFromToken } from "./auth";
import { getToken } from "./token";

function requireMockRiderId(): string {
  const id = riderIdFromToken(getToken());
  if (!id) throw new Error("Not authenticated");
  return id;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function pickString(
  obj: Record<string, unknown>,
  keys: string[],
): string | null {
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

/** Map whatever payment shape the API sends onto our camelCase fields. */
function normalizeAssignmentPayment<T extends RiderAssignment>(raw: T): T {
  const obj = asRecord(raw);
  if (!obj) return raw;

  const nested = asRecord(obj.payment);

  const paymentMethod =
    pickString(obj, [
      "paymentMethod",
      "payment_method",
      "paymentType",
      "payment_type",
      "paymentMode",
      "payment_mode",
    ]) ??
    (nested
      ? pickString(nested, ["method", "paymentMethod", "payment_method", "type"])
      : null);

  const paymentStatus =
    pickString(obj, ["paymentStatus", "payment_status"]) ??
    (nested
      ? pickString(nested, ["status", "paymentStatus", "payment_status"])
      : null);

  // Prefer a dedicated label field; ignore nested objects on `payment`.
  const paymentLabel = pickString(obj, [
    "paymentLabel",
    "payment_label",
    "paymentDisplay",
    "payment_display",
  ]);
  const payment =
    paymentLabel ??
    (typeof obj.payment === "string" && obj.payment.trim()
      ? obj.payment.trim()
      : null);

  return {
    ...raw,
    paymentMethod: paymentMethod ?? raw.paymentMethod ?? null,
    paymentStatus: paymentStatus ?? raw.paymentStatus ?? null,
    payment: payment ?? raw.payment ?? null,
  };
}

function normalizeAssignmentList(list: RiderAssignment[]): RiderAssignment[] {
  return list.map((item) => normalizeAssignmentPayment(item));
}

export async function getAssignments(opts?: {
  date?: "today";
  status?: AssignmentStatus;
}): Promise<RiderAssignment[]> {
  const params = new URLSearchParams();
  if (opts?.date) params.set("date", opts.date);
  if (opts?.status) params.set("status", opts.status);
  const qs = params.toString() ? `?${params}` : "";

  const list = await apiFetchOrMock(`/rider/assignments${qs}`, () =>
    mockStore.listAssignments(requireMockRiderId(), opts),
  );
  return normalizeAssignmentList(list);
}

export async function getAssignment(orderId: string): Promise<AssignmentDetail> {
  const detail = await apiFetchOrMock(`/rider/assignments/${orderId}`, () => {
    const found = mockStore.getAssignment(requireMockRiderId(), orderId);
    if (!found) throw new Error("Assignment not found");
    return found;
  });
  return normalizeAssignmentPayment(detail);
}

export async function getRunState(): Promise<RiderRunState> {
  return apiFetchOrMock("/rider/run-state", () =>
    mockStore.getRunState(requireMockRiderId()),
  );
}

export async function markOnMyWay(): Promise<{ updated: number }> {
  return apiFetchOrMock(
    "/rider/run/on-my-way",
    () => mockStore.markOnMyWay(requireMockRiderId()),
    { method: "POST" },
  );
}

export async function getTodayStats(): Promise<RiderStats> {
  return apiFetchOrMock("/rider/stats/today", () =>
    mockStore.getStats(requireMockRiderId()),
  );
}

export async function getHistory(
  page: number,
): Promise<Paginated<RiderAssignment>> {
  const result = await apiFetchOrMock(
    `/rider/assignments/history?page=${page}&pageSize=${PAGE_SIZE}`,
    () => mockStore.listHistory(requireMockRiderId(), page),
  );
  return {
    ...result,
    data: normalizeAssignmentList(result.data),
  };
}

export async function markPickedUp(
  orderId: string,
  note?: string,
): Promise<AssignmentDetail> {
  return apiFetchOrMock(
    `/rider/assignments/${orderId}/picked-up`,
    () =>
      mockStore.transition(requireMockRiderId(), orderId, "picked_up", {
        note,
      }),
    { method: "POST", body: JSON.stringify({ note }) },
  );
}

export async function markOutForDelivery(
  orderId: string,
  note?: string,
): Promise<AssignmentDetail> {
  return apiFetchOrMock(
    `/rider/assignments/${orderId}/out-for-delivery`,
    () =>
      mockStore.transition(
        requireMockRiderId(),
        orderId,
        "out_for_delivery",
        { note },
      ),
    { method: "POST", body: JSON.stringify({ note }) },
  );
}

export async function markDelivered(
  orderId: string,
  note?: string,
): Promise<AssignmentDetail> {
  return apiFetchOrMock(
    `/rider/assignments/${orderId}/delivered`,
    () =>
      mockStore.transition(requireMockRiderId(), orderId, "delivered", {
        note,
      }),
    { method: "POST", body: JSON.stringify({ note }) },
  );
}

export async function markFailed(
  orderId: string,
  reason: string,
  note?: string,
): Promise<AssignmentDetail> {
  return apiFetchOrMock(
    `/rider/assignments/${orderId}/failed`,
    () =>
      mockStore.transition(requireMockRiderId(), orderId, "failed", {
        reason,
        note,
      }),
    {
      method: "POST",
      body: JSON.stringify({ reason, note }),
    },
  );
}
