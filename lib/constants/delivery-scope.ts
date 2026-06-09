import type { DeliveryType } from "@/types";

/** Rider app only handles Accra in-house runs (Greater Accra). */
export const RIDER_DELIVERY_TYPE: DeliveryType = "accra_inhouse";

const GREATER_ACRA_REGION = "greater accra";

/** Cities outside Greater Accra that riders never serve. */
const OUT_OF_SCOPE_MARKERS = [
  "lagos",
  "nigeria",
  "abuja",
  "kumasi",
  "ashanti",
  "tamale",
  "cape coast",
  "sekondi",
] as const;

export type DeliverableOrder = {
  deliveryType: DeliveryType;
  city: string;
  region: string;
};

export function isAccraInhouseDelivery(order: DeliverableOrder): boolean {
  if (order.deliveryType !== RIDER_DELIVERY_TYPE) return false;

  const city = order.city.toLowerCase().trim();
  const region = order.region.toLowerCase().trim();

  if (OUT_OF_SCOPE_MARKERS.some((m) => city.includes(m) || region.includes(m))) {
    return false;
  }

  return region.includes(GREATER_ACRA_REGION) || city === "accra";
}

export function assertRiderEligible(order: DeliverableOrder): void {
  if (!isAccraInhouseDelivery(order)) {
    throw new Error("This order is outside Accra in-house delivery scope");
  }
}
