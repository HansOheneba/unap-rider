export type DeliveryType = "accra_inhouse" | "partner";

export type DeliveryEventType =
  | "assigned"
  | "picked_up"
  | "out_for_delivery"
  | "delivered"
  | "failed";

export type DeliveryEvent = {
  id: string;
  orderId: string;
  riderId: string | null;
  riderName: string | null;
  type: DeliveryEventType;
  note: string | null;
  at: string;
};

export type RiderStatus = "active" | "on_delivery" | "off_duty" | "inactive";
export type VehicleType = "motorcycle" | "bicycle" | "car" | "van";

export type RiderSession = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  zone: string;
  status: RiderStatus;
  vehicleType: VehicleType;
  plateNumber: string;
};

export type AssignmentStatus =
  | "assigned"
  | "picked_up"
  | "out_for_delivery"
  | "delivered"
  | "failed";

export type RiderRunPhase =
  | "pickup"
  | "ready_to_depart"
  | "delivering"
  | "idle";

export type RiderRunState = {
  phase: RiderRunPhase;
  assignedCount: number;
  pickedUpCount: number;
  deliveringCount: number;
  completedCount: number;
  canDepart: boolean;
  totalActive: number;
};

export type PaymentMethod =
  | "momo"
  | "card"
  | "cash"
  | "paystack"
  | "pay_on_delivery"
  | "on_delivery";

export type PaymentStatus =
  | "unpaid"
  | "pending_collection"
  | "paid"
  | "partially_refunded"
  | "refunded"
  | "failed";

export type RiderAssignment = {
  id: string;
  orderNumber: string;
  trackingNumber: string;
  deliveryType: DeliveryType;
  status: AssignmentStatus;
  customerName: string;
  customerPhone: string;
  customerWhatsapp: string | null;
  address: string;
  city: string;
  district: string | null;
  landmark: string | null;
  /** Optional Google Maps link for turn-by-turn navigation. */
  mapsUrl: string | null;
  region: string;
  items: {
    productName: string;
    quantity: number;
    size: string | null;
    colorName: string | null;
  }[];
  itemCount: number;
  customerNote: string | null;
  internalNote: string | null;
  /** How the customer pays; riders need this for cash collection. */
  paymentMethod: PaymentMethod | string | null;
  paymentStatus: PaymentStatus | string | null;
  /** Optional ready-made label from API (e.g. "on_delivery"). */
  payment?: string | null;
  assignedAt: string;
  pickedUpAt: string | null;
  outForDeliveryAt: string | null;
  deliveredAt: string | null;
  failedAt: string | null;
  failureReason: string | null;
};

export type RiderStats = {
  assigned: number;
  pickedUp: number;
  outForDelivery: number;
  delivered: number;
  failed: number;
};

export type Paginated<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type AssignmentDetail = RiderAssignment & {
  events: DeliveryEvent[];
};

export type FailureReason =
  | "customer_unavailable"
  | "wrong_address"
  | "refused"
  | "returned"
  | "other";
