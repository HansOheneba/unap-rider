import type { LucideIcon } from "lucide-react";
import {
  AlertCircle,
  Bike,
  CheckCircle2,
  CircleDot,
  Package,
  PackageCheck,
  RotateCcw,
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
    listLabel: "Awaiting pickup",
    icon: Package,
    badge: "bg-violet-50 text-violet-600",
    border: "border-zinc-100",
    surface: "bg-white",
    text: "text-violet-600",
    dot: "bg-violet-500",
  },
  picked_up: {
    label: "Picked up",
    shortLabel: "Loaded",
    listLabel: "Picked up",
    icon: PackageCheck,
    badge: "bg-sky-50 text-sky-600",
    border: "border-zinc-100",
    surface: "bg-white",
    text: "text-sky-600",
    dot: "bg-sky-500",
  },
  out_for_delivery: {
    label: "In transit",
    shortLabel: "Delivering",
    listLabel: "In transit",
    icon: Bike,
    badge: "bg-emerald-50 text-emerald-600",
    border: "border-zinc-100",
    surface: "bg-white",
    text: "text-emerald-600",
    dot: "bg-emerald-500",
  },
  delivered: {
    label: "Delivered",
    shortLabel: "Done",
    listLabel: "Delivered",
    icon: CheckCircle2,
    badge: "bg-zinc-50 text-zinc-500",
    border: "border-zinc-100",
    surface: "bg-white",
    text: "text-zinc-500",
    dot: "bg-zinc-400",
  },
  failed: {
    label: "Returned",
    shortLabel: "Returned",
    listLabel: "Returned",
    icon: RotateCcw,
    badge: "bg-red-50 text-[#E8192C]",
    border: "border-zinc-100",
    surface: "bg-white",
    text: "text-[#E8192C]",
    dot: "bg-[#E8192C]",
  },
};

export const eventTheme: Record<
  DeliveryEventType,
  { dot: string; icon: LucideIcon }
> = {
  assigned: { dot: "bg-violet-500", icon: CircleDot },
  picked_up: { dot: "bg-sky-500", icon: PackageCheck },
  out_for_delivery: { dot: "bg-emerald-500", icon: Bike },
  delivered: { dot: "bg-zinc-400", icon: CheckCircle2 },
  failed: { dot: "bg-[#E8192C]", icon: AlertCircle },
};

export function getStatusTheme(status: AssignmentStatus): StatusTheme {
  return statusTheme[status];
}
