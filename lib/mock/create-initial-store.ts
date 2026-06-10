import type { DeliveryEvent, RiderSession } from "@/types";
import { seedOrders, seedRiders, type MockOrder } from "./seed";

export type MockStoreData = {
  riders: RiderSession[];
  orders: MockOrder[];
  deliveryEvents: DeliveryEvent[];
};

/** Kwame's starting queue — all assigned, nothing picked up yet. */
const KWAME_FRESH_ORDER_IDS = [
  "ORD-2026-0055",
  "ORD-2026-0054",
  "ORD-2026-0053",
  "ORD-2026-0052",
] as const;

function riderName(riderId: string): string {
  const r = seedRiders.find((x) => x.id === riderId);
  return r ? `${r.firstName} ${r.lastName}` : "Rider";
}

function toAssignedOnly(order: MockOrder): MockOrder {
  return {
    ...order,
    items: order.items.map((i) => ({ ...i })),
    pickedUpAt: null,
    outForDeliveryAt: null,
    deliveredAt: null,
    failedAt: null,
    failureReason: null,
  };
}

function assignedEvent(order: MockOrder, at: string): DeliveryEvent {
  return {
    id: `dev_assigned_${order.id}`,
    orderId: order.id,
    riderId: order.riderId!,
    riderName: riderName(order.riderId!),
    type: "assigned",
    note: null,
    at,
  };
}

/** Fresh mock DB: rider logs in to assigned orders only and works the full flow. */
export function buildFreshMockStore(): MockStoreData {
  const now = new Date().toISOString();
  const riders = seedRiders.map((r) => ({
    ...r,
    status:
      r.id === "rdr_001"
        ? ("active" as const)
        : r.status,
  }));

  const orderById = new Map(seedOrders.map((o) => [o.id, o]));
  const orders = KWAME_FRESH_ORDER_IDS.map((id) => {
    const order = orderById.get(id);
    if (!order || order.riderId !== "rdr_001") {
      throw new Error(`Missing fresh run order: ${id}`);
    }
    return toAssignedOnly(order);
  });

  const deliveryEvents = orders.map((o, i) =>
    assignedEvent(o, new Date(Date.now() - i * 60_000).toISOString()),
  );

  return { riders, orders, deliveryEvents };
}
