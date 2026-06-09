import type {
  AssignmentDetail,
  AssignmentStatus,
  Paginated,
  RiderAssignment,
  RiderRunState,
  RiderStats,
} from "@/types";
import { apiFetchOrMock } from "./client";
import { mockStore } from "@/lib/mock/data-store";
import { riderIdFromToken } from "./auth";
import { getToken } from "./token";

function requireRiderId(): string {
  const id = riderIdFromToken(getToken());
  if (!id) throw new Error("Not authenticated");
  return id;
}

export async function getAssignments(opts?: {
  date?: "today";
  status?: AssignmentStatus;
}): Promise<RiderAssignment[]> {
  const riderId = requireRiderId();
  const params = new URLSearchParams();
  if (opts?.date) params.set("date", opts.date);
  if (opts?.status) params.set("status", opts.status);
  const qs = params.toString() ? `?${params}` : "";

  return apiFetchOrMock(
    `/rider/assignments${qs}`,
    () => mockStore.listAssignments(riderId, opts),
  );
}

export async function getAssignment(orderId: string): Promise<AssignmentDetail> {
  const riderId = requireRiderId();
  return apiFetchOrMock(`/rider/assignments/${orderId}`, () => {
    const detail = mockStore.getAssignment(riderId, orderId);
    if (!detail) throw new Error("Assignment not found");
    return detail;
  });
}

export async function getRunState(): Promise<RiderRunState> {
  const riderId = requireRiderId();
  return apiFetchOrMock("/rider/run-state", () =>
    mockStore.getRunState(riderId),
  );
}

export async function markOnMyWay(): Promise<{ updated: number }> {
  const riderId = requireRiderId();
  return apiFetchOrMock(
    "/rider/run/on-my-way",
    () => mockStore.markOnMyWay(riderId),
    { method: "POST" },
  );
}

export async function getTodayStats(): Promise<RiderStats> {
  const riderId = requireRiderId();
  return apiFetchOrMock("/rider/stats/today", () =>
    mockStore.getStats(riderId),
  );
}

export async function getHistory(
  page: number,
): Promise<Paginated<RiderAssignment>> {
  const riderId = requireRiderId();
  return apiFetchOrMock(
    `/rider/assignments/history?page=${page}`,
    () => mockStore.listHistory(riderId, page),
  );
}

export async function markPickedUp(
  orderId: string,
  note?: string,
): Promise<AssignmentDetail> {
  const riderId = requireRiderId();
  return apiFetchOrMock(
    `/rider/assignments/${orderId}/picked-up`,
    () => mockStore.transition(riderId, orderId, "picked_up", { note }),
    { method: "POST", body: JSON.stringify({ note }) },
  );
}

export async function markOutForDelivery(
  orderId: string,
  note?: string,
): Promise<AssignmentDetail> {
  const riderId = requireRiderId();
  return apiFetchOrMock(
    `/rider/assignments/${orderId}/out-for-delivery`,
    () => mockStore.transition(riderId, orderId, "out_for_delivery", { note }),
    { method: "POST", body: JSON.stringify({ note }) },
  );
}

export async function markDelivered(
  orderId: string,
  note?: string,
): Promise<AssignmentDetail> {
  const riderId = requireRiderId();
  return apiFetchOrMock(
    `/rider/assignments/${orderId}/delivered`,
    () => mockStore.transition(riderId, orderId, "delivered", { note }),
    { method: "POST", body: JSON.stringify({ note }) },
  );
}

export async function markFailed(
  orderId: string,
  reason: string,
  note?: string,
): Promise<AssignmentDetail> {
  const riderId = requireRiderId();
  return apiFetchOrMock(
    `/rider/assignments/${orderId}/failed`,
    () =>
      mockStore.transition(riderId, orderId, "failed", { reason, note }),
    {
      method: "POST",
      body: JSON.stringify({ reason, note }),
    },
  );
}
