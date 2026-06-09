import type { LucideIcon } from "lucide-react";
import {
  AlertCircle,
  Bike,
  CheckCircle2,
  CircleDot,
  Package,
  PackageCheck,
  RotateCcw,
  XCircle,
} from "lucide-react";
import type { AssignmentStatus, DeliveryEventType } from "@/types";

export type StatusTheme = {
  label: string;
  shortLabel: string;
  listLabel: string;
  icon: LucideIcon;
  badge: string;
  border: string;
  surface: string;
  text: string;
  dot: string;
};

export const statusTheme: Record<AssignmentStatus, StatusTheme> = {
  assigned: {
    label: "Awaiting pickup",
    shortLabel: "Assigned",
    listLabel: "Awaiting Pickup",
    icon: Package,
    badge: "bg-violet-100 text-violet-700",
    border: "border-violet-200",
    surface: "bg-violet-50",
    text: "text-violet-700",
    dot: "bg-violet-500",
  },
  picked_up: {
    label: "Picked up",
    shortLabel: "Loaded",
    listLabel: "Picked Up",
    icon: PackageCheck,
    badge: "bg-sky-100 text-sky-700",
    border: "border-sky-200",
    surface: "bg-sky-50",
    text: "text-sky-700",
    dot: "bg-sky-500",
  },
  out_for_delivery: {
    label: "In transit",
    shortLabel: "Delivering",
    listLabel: "In Transit",
    icon: Bike,
    badge: "bg-emerald-100 text-emerald-700",
    border: "border-emerald-200",
    surface: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  delivered: {
    label: "Delivered",
    shortLabel: "Done",
    listLabel: "Delivered",
    icon: CheckCircle2,
    badge: "bg-zinc-100 text-zinc-700",
    border: "border-zinc-200",
    surface: "bg-zinc-50",
    text: "text-zinc-700",
    dot: "bg-zinc-900",
  },
  failed: {
    label: "Returned",
    shortLabel: "Returned",
    listLabel: "Returned",
    icon: RotateCcw,
    badge: "bg-red-100 text-red-700",
    border: "border-red-200",
    surface: "bg-red-50",
    text: "text-red-700",
    dot: "bg-red-500",
  },
};

export const eventTheme: Record<
  DeliveryEventType,
  { dot: string; icon: LucideIcon }
> = {
  assigned: { dot: "bg-violet-500", icon: CircleDot },
  picked_up: { dot: "bg-sky-500", icon: PackageCheck },
  out_for_delivery: { dot: "bg-emerald-500", icon: Bike },
  delivered: { dot: "bg-zinc-900", icon: CheckCircle2 },
  failed: { dot: "bg-red-500", icon: AlertCircle },
};

export function getStatusTheme(status: AssignmentStatus): StatusTheme {
  return statusTheme[status];
}
