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

export type RiderAssignment = {
  id: string;
  orderNumber: string;
  trackingNumber: string;
  status: AssignmentStatus;
  customerName: string;
  customerPhone: string;
  customerWhatsapp: string | null;
  address: string;
  city: string;
  district: string | null;
  landmark: string | null;
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
  | "other";
