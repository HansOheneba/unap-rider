"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AssignmentStatus } from "@/types";
import {
  getAssignment,
  getAssignments,
  getHistory,
  getTodayStats,
  markDelivered,
  markFailed,
  markOutForDelivery,
  markPickedUp,
} from "@/lib/api/assignments";

export function useTodayStats() {
  return useQuery({
    queryKey: ["rider", "stats", "today"],
    queryFn: getTodayStats,
    refetchInterval: 60_000,
  });
}

export function useAssignments(statuses?: AssignmentStatus[]) {
  const isDoneTab = statuses?.some(
    (s) => s === "delivered" || s === "failed",
  );

  return useQuery({
    queryKey: ["rider", "assignments", statuses],
    queryFn: async () => {
      const all = await getAssignments(
        isDoneTab ? undefined : { date: "today" },
      );
      if (!statuses?.length) return all;
      return all.filter((a) => statuses.includes(a.status));
    },
    refetchInterval: 60_000,
  });
}

export function useAssignment(orderId: string) {
  return useQuery({
    queryKey: ["rider", "assignment", orderId],
    queryFn: () => getAssignment(orderId),
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

  const outForDelivery = useMutation({
    mutationFn: (note?: string) => markOutForDelivery(orderId, note),
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

  return { pickedUp, outForDelivery, delivered, failed };
}
