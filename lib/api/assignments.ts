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

export async function getAssignments(opts?: {
  date?: "today";
  status?: AssignmentStatus;
}): Promise<RiderAssignment[]> {
  const params = new URLSearchParams();
  if (opts?.date) params.set("date", opts.date);
  if (opts?.status) params.set("status", opts.status);
  const qs = params.toString() ? `?${params}` : "";

  return apiFetchOrMock(`/rider/assignments${qs}`, () =>
    mockStore.listAssignments(requireMockRiderId(), opts),
  );
}

export async function getAssignment(orderId: string): Promise<AssignmentDetail> {
  return apiFetchOrMock(`/rider/assignments/${orderId}`, () => {
    const detail = mockStore.getAssignment(requireMockRiderId(), orderId);
    if (!detail) throw new Error("Assignment not found");
    return detail;
  });
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
  return apiFetchOrMock(
    `/rider/assignments/history?page=${page}&pageSize=${PAGE_SIZE}`,
    () => mockStore.listHistory(requireMockRiderId(), page),
  );
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
