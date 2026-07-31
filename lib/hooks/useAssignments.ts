"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AssignmentStatus, RiderAssignment } from "@/types";
import {
  getAssignment,
  getAssignments,
  getHistory,
  getRunState,
  getTodayStats,
  markDelivered,
  markFailed,
  markOnMyWay,
  markPickedUp,
} from "@/lib/api/assignments";

/** Align with AGENTS.md: poll every 60s when the tab is visible. */
const POLL_MS = 60_000;

function sortAssignments(
  list: RiderAssignment[],
  statuses?: AssignmentStatus[],
): RiderAssignment[] {
  const pickupQueue =
    statuses?.includes("assigned") && statuses?.includes("picked_up");

  return [...list].sort((a, b) => {
    if (pickupQueue) {
      const rank = (s: AssignmentStatus) => (s === "picked_up" ? 1 : 0);
      const diff = rank(a.status) - rank(b.status);
      if (diff !== 0) return diff;
    }
    return (
      new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime()
    );
  });
}

export function useRunState() {
  return useQuery({
    queryKey: ["rider", "run-state"],
    queryFn: getRunState,
    refetchInterval: POLL_MS,
    refetchIntervalInBackground: false,
  });
}

export function useOnMyWay() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markOnMyWay,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rider"] }),
  });
}

export function useTodayStats() {
  return useQuery({
    queryKey: ["rider", "stats", "today"],
    queryFn: getTodayStats,
    refetchInterval: POLL_MS,
    refetchIntervalInBackground: false,
  });
}

export function useAssignments(statuses?: AssignmentStatus[]) {
  const isDoneTab = statuses?.some(
    (s) => s === "delivered" || s === "failed",
  );

  // One shared "today" query for Assigned + Delivering tabs so tab switches
  // and dual observers do not double-hit the backend.
  const query = useQuery({
    queryKey: ["rider", "assignments", isDoneTab ? "all" : "today"],
    queryFn: () => getAssignments(isDoneTab ? undefined : { date: "today" }),
    refetchInterval: isDoneTab ? false : POLL_MS,
    refetchIntervalInBackground: false,
  });

  const data = React.useMemo(() => {
    if (!query.data) return undefined;
    if (!statuses?.length) return query.data;
    return sortAssignments(
      query.data.filter((a) => statuses.includes(a.status)),
      statuses,
    );
  }, [query.data, statuses]);

  return { ...query, data };
}

export function useAssignment(orderId: string) {
  return useQuery({
    queryKey: ["rider", "assignment", orderId],
    queryFn: () => getAssignment(orderId),
    enabled: Boolean(orderId),
  });
}

export function useHistory(page: number) {
  return useQuery({
    queryKey: ["rider", "history", page],
    queryFn: () => getHistory(page),
  });
}

export function useAssignmentActions(orderId: string) {
  const qc = useQueryClient();

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["rider"] });
  };

  const pickedUp = useMutation({
    mutationFn: (note?: string) => markPickedUp(orderId, note),
    onSuccess: invalidate,
  });

  const delivered = useMutation({
    mutationFn: (note?: string) => markDelivered(orderId, note),
    onSuccess: invalidate,
  });

  const failed = useMutation({
    mutationFn: (args: { reason: string; note?: string }) =>
      markFailed(orderId, args.reason, args.note),
    onSuccess: invalidate,
  });

  return { pickedUp, delivered, failed };
}
