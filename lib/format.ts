import type { AssignmentStatus, DeliveryEventType } from "@/types";

export function statusLabel(status: string): string {
  return status
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const assignmentLabels: Record<AssignmentStatus, string> = {
  assigned: "To pick up",
  picked_up: "Picked up",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  failed: "Failed",
};

export function assignmentStatusLabel(status: AssignmentStatus): string {
  return assignmentLabels[status];
}

const eventLabels: Record<DeliveryEventType, string> = {
  assigned: "Assigned",
  picked_up: "Picked up",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  failed: "Could not deliver",
};

export function eventTypeLabel(type: DeliveryEventType): string {
  return eventLabels[type];
}

export function formatTime(dateStr: string): string {
  return new Intl.DateTimeFormat("en-GH", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr));
}

export function formatDateTime(dateStr: string): string {
  return new Intl.DateTimeFormat("en-GH", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr));
}

export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("233")) return `+${digits}`;
  if (digits.startsWith("0")) return `+233${digits.slice(1)}`;
  if (digits.length === 9) return `+233${digits}`;
  return phone.trim();
}

export function phonesMatch(a: string, b: string): boolean {
  const na = normalizePhone(a).replace(/\D/g, "");
  const nb = normalizePhone(b).replace(/\D/g, "");
  return na === nb;
}

export function whatsAppUrl(phone: string): string {
  const digits = normalizePhone(phone).replace(/\D/g, "");
  return `https://wa.me/${digits}`;
}

export function telUrl(phone: string): string {
  return `tel:${normalizePhone(phone)}`;
}
