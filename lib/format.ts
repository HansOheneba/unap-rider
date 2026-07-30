import type { AssignmentStatus, DeliveryEventType, RiderAssignment } from "@/types";

export function formatDeliveryLocation(assignment: Pick<
  RiderAssignment,
  "address" | "district" | "city" | "region" | "landmark"
>): {
  primary: string;
  secondary: string;
  landmark: string | null;
} {
  const primary = [assignment.address, assignment.district]
    .filter(Boolean)
    .join(", ");

  const secondary = [assignment.city, assignment.region]
    .filter(Boolean)
    .join(", ");

  return {
    primary,
    secondary,
    landmark: assignment.landmark,
  };
}

export function statusLabel(status: string): string {
  return status
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const assignmentLabels: Record<AssignmentStatus, string> = {
  assigned: "Awaiting pickup",
  picked_up: "Picked up",
  out_for_delivery: "In transit",
  delivered: "Delivered",
  failed: "Returned",
};

export function assignmentStatusLabel(status: AssignmentStatus): string {
  return assignmentLabels[status];
}

const eventLabels: Record<DeliveryEventType, string> = {
  assigned: "Assigned",
  picked_up: "Picked up",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  failed: "Returned",
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

export function googleMapsSearchUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  momo: "Mobile Money",
  card: "Card",
  cash: "Cash",
  paystack: "Paystack",
  pay_on_delivery: "On delivery",
  on_delivery: "On delivery",
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  unpaid: "Unpaid",
  pending_collection: "Collect on delivery",
  paid: "Paid",
  partially_refunded: "Partially refunded",
  refunded: "Refunded",
  failed: "Failed",
};

/** Rider-facing payment label (collect vs already paid). */
export function assignmentPaymentLabel(
  assignment: Pick<
    RiderAssignment,
    "paymentMethod" | "paymentStatus" | "payment"
  >,
): string {
  const rawPayment = assignment.payment?.trim().toLowerCase() ?? "";
  if (rawPayment === "pay_on_delivery" || rawPayment === "on_delivery") {
    return "On delivery";
  }
  if (rawPayment === "paid") return "Paid";
  if (rawPayment && PAYMENT_METHOD_LABELS[rawPayment]) {
    return PAYMENT_METHOD_LABELS[rawPayment];
  }
  if (rawPayment && PAYMENT_STATUS_LABELS[rawPayment]) {
    return PAYMENT_STATUS_LABELS[rawPayment];
  }
  if (rawPayment) return statusLabel(rawPayment);

  const method = assignment.paymentMethod?.trim().toLowerCase() ?? "";
  const status = assignment.paymentStatus?.trim().toLowerCase() ?? "";

  if (method === "pay_on_delivery" || method === "on_delivery") {
    return "On delivery";
  }
  if (status === "pending_collection" || status === "unpaid") {
    return method && PAYMENT_METHOD_LABELS[method]
      ? PAYMENT_METHOD_LABELS[method]
      : "On delivery";
  }
  if (status === "paid") return "Paid";
  if (method && PAYMENT_METHOD_LABELS[method]) {
    return PAYMENT_METHOD_LABELS[method];
  }
  if (status && PAYMENT_STATUS_LABELS[status]) {
    return PAYMENT_STATUS_LABELS[status];
  }
  if (method) return statusLabel(method);
  if (status) return statusLabel(status);
  return "—";
}
