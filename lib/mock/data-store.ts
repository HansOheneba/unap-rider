import type {
  AssignmentDetail,
  AssignmentStatus,
  DeliveryEvent,
  DeliveryEventType,
  Paginated,
  RiderAssignment,
  RiderRunState,
  RiderSession,
  RiderStats,
} from "@/types";
import { phonesMatch } from "@/lib/format";
import { PAGE_SIZE } from "@/lib/constants/pagination";
import {
  assertRiderEligible,
  isAccraInhouseDelivery,
} from "@/lib/constants/delivery-scope";
import {
  seedDeliveryEvents,
  seedOrders,
  seedRiders,
  type MockOrder,
} from "./seed";

type Store = {
  riders: RiderSession[];
  orders: MockOrder[];
  deliveryEvents: DeliveryEvent[];
};

let store: Store = {
  riders: seedRiders.map((r) => ({ ...r })),
  orders: seedOrders.map((o) => ({ ...o, items: [...o.items] })),
  deliveryEvents: [...seedDeliveryEvents],
};

function resetStore() {
  store = {
    riders: seedRiders.map((r) => ({ ...r })),
    orders: seedOrders.map((o) => ({ ...o, items: [...o.items] })),
    deliveryEvents: [...seedDeliveryEvents],
  };
}

function deriveStatus(order: MockOrder, events: DeliveryEvent[]): AssignmentStatus {
  const types = new Set(events.map((e) => e.type));
  if (types.has("failed") || order.failedAt) return "failed";
  if (types.has("delivered") || order.deliveredAt) return "delivered";
  if (types.has("out_for_delivery") || order.outForDeliveryAt)
    return "out_for_delivery";
  if (types.has("picked_up") || order.pickedUpAt) return "picked_up";
  return "assigned";
}

function toAssignment(order: MockOrder): RiderAssignment {
  const events = store.deliveryEvents
    .filter((e) => e.orderId === order.id)
    .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
  const assignedEvent = events.find((e) => e.type === "assigned");

  return {
    id: order.id,
    orderNumber: order.id,
    trackingNumber: order.trackingNumber,
    deliveryType: order.deliveryType,
    status: deriveStatus(order, events),
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    customerWhatsapp: order.customerWhatsapp,
    address: order.address,
    city: order.city,
    district: order.district,
    landmark: order.landmark,
    region: order.region,
    items: order.items,
    itemCount: order.items.reduce((s, i) => s + i.quantity, 0),
    customerNote: order.customerNote,
    internalNote: order.riderNote || null,
    assignedAt: assignedEvent?.at ?? order.createdAt,
    pickedUpAt: order.pickedUpAt,
    outForDeliveryAt: order.outForDeliveryAt,
    deliveredAt: order.deliveredAt,
    failedAt: order.failedAt,
    failureReason: order.failureReason,
  };
}

function riderOrders(riderId: string): MockOrder[] {
  return store.orders.filter(
    (o) =>
      o.riderId === riderId &&
      isAccraInhouseDelivery({
        deliveryType: o.deliveryType,
        city: o.city,
        region: o.region,
      }),
  );
}

function now() {
  return new Date().toISOString();
}

function nextEventId() {
  return `dev_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

function appendEvent(
  orderId: string,
  rider: RiderSession,
  type: DeliveryEventType,
  note?: string | null,
) {
  const event: DeliveryEvent = {
    id: nextEventId(),
    orderId,
    riderId: rider.id,
    riderName: `${rider.firstName} ${rider.lastName}`,
    type,
    note: note ?? null,
    at: now(),
  };
  store.deliveryEvents.push(event);
  return event;
}

export const mockStore = {
  reset: resetStore,

  findRiderByPhone(phone: string): RiderSession | null {
    return (
      store.riders.find((r) => phonesMatch(r.phone, phone)) ?? null
    );
  },

  getRider(id: string): RiderSession | null {
    return store.riders.find((r) => r.id === id) ?? null;
  },

  updateRiderStatus(id: string, status: RiderSession["status"]) {
    const rider = store.riders.find((r) => r.id === id);
    if (!rider) throw new Error("Rider not found");
    rider.status = status;
    return rider;
  },

  listAssignments(
    riderId: string,
    opts?: { status?: AssignmentStatus | AssignmentStatus[]; date?: "today" | "all" },
  ): RiderAssignment[] {
    let list = riderOrders(riderId).map(toAssignment);

    if (opts?.status) {
      const statuses = Array.isArray(opts.status) ? opts.status : [opts.status];
      list = list.filter((a) => statuses.includes(a.status));
    }

    if (opts?.date === "today") {
      const active = ["assigned", "picked_up", "out_for_delivery"];
      list = list.filter((a) => active.includes(a.status));
    }

    return list.sort(
      (a, b) => new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime(),
    );
  },

  getAssignment(riderId: string, orderId: string): AssignmentDetail | null {
    const order = store.orders.find(
      (o) => o.id === orderId && o.riderId === riderId,
    );
    if (!order) return null;
    const assignment = toAssignment(order);
    const events = store.deliveryEvents
      .filter((e) => e.orderId === orderId)
      .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
    return { ...assignment, events };
  },

  getRunState(riderId: string): RiderRunState {
    const all = riderOrders(riderId).map(toAssignment);
    const active = all.filter((a) =>
      ["assigned", "picked_up", "out_for_delivery"].includes(a.status),
    );
    const assignedCount = active.filter((a) => a.status === "assigned").length;
    const pickedUpCount = active.filter((a) => a.status === "picked_up").length;
    const deliveringCount = active.filter(
      (a) => a.status === "out_for_delivery",
    ).length;
    const completedCount = all.filter(
      (a) => a.status === "delivered" || a.status === "failed",
    ).length;

    let phase: RiderRunState["phase"] = "idle";
    if (active.length > 0) {
      if (deliveringCount > 0) {
        phase = "delivering";
      } else if (assignedCount > 0) {
        phase = "pickup";
      } else if (pickedUpCount > 0) {
        phase = "ready_to_depart";
      }
    }

    return {
      phase,
      assignedCount,
      pickedUpCount,
      deliveringCount,
      completedCount,
      canDepart:
        assignedCount === 0 && pickedUpCount > 0 && deliveringCount === 0,
      totalActive: active.length,
    };
  },

  markOnMyWay(riderId: string): { updated: number } {
    const rider = store.riders.find((r) => r.id === riderId);
    if (!rider) throw new Error("Rider not found");

    const picked = riderOrders(riderId)
      .map((o) => ({ order: o, status: deriveStatus(o, store.deliveryEvents.filter((e) => e.orderId === o.id)) }))
      .filter((x) => x.status === "picked_up");

    if (picked.length === 0) {
      throw new Error("No packages ready to depart");
    }

    const hasAssigned = riderOrders(riderId).some((o) => {
      const events = store.deliveryEvents.filter((e) => e.orderId === o.id);
      return deriveStatus(o, events) === "assigned";
    });
    if (hasAssigned) {
      throw new Error("Pick up all assigned orders first");
    }

    for (const { order } of picked) {
      appendEvent(order.id, rider, "out_for_delivery", "Rider is on the way");
      order.outForDeliveryAt = now();
    }

    rider.status = "on_delivery";
    return { updated: picked.length };
  },

  getStats(riderId: string): RiderStats {
    const all = riderOrders(riderId).map(toAssignment);
    const today = all.filter((a) =>
      ["assigned", "picked_up", "out_for_delivery"].includes(a.status),
    );
    return {
      assigned: today.filter((a) => a.status === "assigned").length,
      pickedUp: today.filter((a) => a.status === "picked_up").length,
      outForDelivery: today.filter((a) => a.status === "out_for_delivery").length,
      delivered: all.filter((a) => a.status === "delivered").length,
      failed: all.filter((a) => a.status === "failed").length,
    };
  },

  listHistory(
    riderId: string,
    page: number,
    pageSize = PAGE_SIZE,
  ): Paginated<RiderAssignment> {
    const done = riderOrders(riderId)
      .map(toAssignment)
      .filter((a) => a.status === "delivered" || a.status === "failed")
      .sort(
        (a, b) =>
          new Date(b.deliveredAt ?? b.failedAt ?? b.assignedAt).getTime() -
          new Date(a.deliveredAt ?? a.failedAt ?? a.assignedAt).getTime(),
      );
    const total = done.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const start = (page - 1) * pageSize;
    return {
      data: done.slice(start, start + pageSize),
      total,
      page,
      pageSize,
      totalPages,
    };
  },

  transition(
    riderId: string,
    orderId: string,
    type: DeliveryEventType,
    opts?: { note?: string; reason?: string },
  ): AssignmentDetail {
    const order = store.orders.find(
      (o) => o.id === orderId && o.riderId === riderId,
    );
    const rider = store.riders.find((r) => r.id === riderId);
    if (!order || !rider) throw new Error("Assignment not found");

    assertRiderEligible({
      deliveryType: order.deliveryType,
      city: order.city,
      region: order.region,
    });

    const current = deriveStatus(
      order,
      store.deliveryEvents.filter((e) => e.orderId === orderId),
    );

    const allowed: Record<DeliveryEventType, AssignmentStatus[]> = {
      assigned: [],
      picked_up: ["assigned"],
      out_for_delivery: ["picked_up"],
      delivered: ["out_for_delivery"],
      failed: ["out_for_delivery"],
    };

    if (!allowed[type].includes(current)) {
      throw new Error(`Cannot transition from ${current} to ${type}`);
    }

    appendEvent(orderId, rider, type, opts?.note);

    if (type === "picked_up") order.pickedUpAt = now();
    if (type === "out_for_delivery") order.outForDeliveryAt = now();
    if (type === "delivered") order.deliveredAt = now();
    if (type === "failed") {
      order.failedAt = now();
      order.failureReason = opts?.reason ?? "other";
    }

    const detail = this.getAssignment(riderId, orderId);
    if (!detail) throw new Error("Assignment not found");
    return detail;
  },
};
