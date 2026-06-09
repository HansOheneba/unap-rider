import type { DeliveryEvent, RiderSession } from "@/types";

const baseDate = new Date("2026-06-09T10:00:00Z").getTime();
const days = (n: number) => new Date(baseDate - n * 86400000).toISOString();
const hours = (n: number) => new Date(baseDate - n * 3600000).toISOString();

export type MockOrder = {
  id: string;
  trackingNumber: string;
  riderId: string | null;
  riderNote: string;
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
  customerNote: string | null;
  pickedUpAt: string | null;
  outForDeliveryAt: string | null;
  deliveredAt: string | null;
  failedAt: string | null;
  failureReason: string | null;
  createdAt: string;
};

export const seedRiders: RiderSession[] = [
  {
    id: "rdr_001",
    firstName: "Kwame",
    lastName: "Mensah",
    phone: "+233241234567",
    zone: "East Legon, Airport, Cantonments",
    status: "on_delivery",
    vehicleType: "motorcycle",
    plateNumber: "GR 4521-21",
  },
  {
    id: "rdr_002",
    firstName: "Abena",
    lastName: "Osei",
    phone: "+233559876543",
    zone: "Osu, Labone, Ridge",
    status: "active",
    vehicleType: "motorcycle",
    plateNumber: "GS 7834-22",
  },
  {
    id: "rdr_003",
    firstName: "Kofi",
    lastName: "Asante",
    phone: "+233204567890",
    zone: "Spintex, Sakumono, Tema Community 1",
    status: "active",
    vehicleType: "car",
    plateNumber: "GW 2109-19",
  },
  {
    id: "rdr_004",
    firstName: "Ama",
    lastName: "Darko",
    phone: "+233273210987",
    zone: "Madina, Adenta, Haatso",
    status: "off_duty",
    vehicleType: "bicycle",
    plateNumber: "N/A",
  },
];

export const seedOrders: MockOrder[] = [
  {
    id: "ORD-2026-0051",
    trackingNumber: "UNAP-000051",
    riderId: "rdr_001",
    riderNote: "Gate code: 4521. Call on arrival.",
    customerName: "Amara Okafor",
    customerPhone: "8035551122",
    customerWhatsapp: "8035551122",
    address: "5 Admiralty Way",
    city: "Lekki",
    district: "Eti-Osa",
    landmark: "Near Circle Mall",
    region: "Lagos",
    items: [
      {
        productName: "Street Sovereign Track Set",
        quantity: 1,
        size: "M",
        colorName: "Onyx",
      },
    ],
    customerNote: null,
    pickedUpAt: hours(4),
    outForDeliveryAt: hours(2),
    deliveredAt: null,
    failedAt: null,
    failureReason: null,
    createdAt: days(1),
  },
  {
    id: "ORD-2026-0049",
    trackingNumber: "UNAP-000049",
    riderId: "rdr_001",
    riderNote: "",
    customerName: "Kojo Mensah",
    customerPhone: "244112233",
    customerWhatsapp: "244112233",
    address: "12 Oxford Street, Osu",
    city: "Accra",
    district: "Osu",
    landmark: "Behind Republic Bar",
    region: "Greater Accra",
    items: [
      {
        productName: "No Apology Boxer Brief",
        quantity: 2,
        size: "M",
        colorName: "Black",
      },
    ],
    customerNote: null,
    pickedUpAt: null,
    outForDeliveryAt: null,
    deliveredAt: null,
    failedAt: null,
    failureReason: null,
    createdAt: days(3),
  },
  {
    id: "ORD-2026-0050",
    trackingNumber: "UNAP-000050",
    riderId: "rdr_002",
    riderNote: "Fragile. Handle with care.",
    customerName: "Chinedu Eze",
    customerPhone: "8092223344",
    customerWhatsapp: "8092223344",
    address: "House 14, Wuse 2",
    city: "Abuja",
    district: "Wuse",
    landmark: "Near Shoprite",
    region: "Abuja",
    items: [
      {
        productName: "Street Sovereign Track Set",
        quantity: 2,
        size: "L",
        colorName: "Onyx",
      },
      {
        productName: "Anti-Uniform Tee",
        quantity: 2,
        size: "L",
        colorName: "White",
      },
    ],
    customerNote: "Please pack discreetly.",
    pickedUpAt: days(1.5),
    outForDeliveryAt: null,
    deliveredAt: null,
    failedAt: null,
    failureReason: null,
    createdAt: days(2),
  },
  {
    id: "ORD-2026-0041",
    trackingNumber: "UNAP-000041",
    riderId: "rdr_003",
    riderNote: "",
    customerName: "Kojo Mensah",
    customerPhone: "244112233",
    customerWhatsapp: "244112233",
    address: "12 Oxford Street, Osu",
    city: "Accra",
    district: "Osu",
    landmark: "Behind Republic Bar",
    region: "Greater Accra",
    items: [
      {
        productName: "Street Sovereign Track Set",
        quantity: 1,
        size: "M",
        colorName: "Onyx",
      },
    ],
    customerNote: null,
    pickedUpAt: null,
    outForDeliveryAt: null,
    deliveredAt: null,
    failedAt: null,
    failureReason: null,
    createdAt: days(0.5),
  },
  {
    id: "ORD-2026-0040",
    trackingNumber: "UNAP-000040",
    riderId: "rdr_001",
    riderNote: "",
    customerName: "Kojo Mensah",
    customerPhone: "244112233",
    customerWhatsapp: "244112233",
    address: "12 Oxford Street, Osu",
    city: "Accra",
    district: "Osu",
    landmark: "Behind Republic Bar",
    region: "Greater Accra",
    items: [
      {
        productName: "Bold Society Cap",
        quantity: 2,
        size: "One Size",
        colorName: "Black",
      },
    ],
    customerNote: null,
    pickedUpAt: days(30.8),
    outForDeliveryAt: days(30.5),
    deliveredAt: days(30),
    failedAt: null,
    failureReason: null,
    createdAt: days(31),
  },
];

export const seedDeliveryEvents: DeliveryEvent[] = [
  {
    id: "dev_001",
    orderId: "ORD-2026-0051",
    riderId: "rdr_001",
    riderName: "Kwame Mensah",
    type: "assigned",
    note: null,
    at: days(1),
  },
  {
    id: "dev_002",
    orderId: "ORD-2026-0051",
    riderId: "rdr_001",
    riderName: "Kwame Mensah",
    type: "picked_up",
    note: null,
    at: hours(4),
  },
  {
    id: "dev_003",
    orderId: "ORD-2026-0051",
    riderId: "rdr_001",
    riderName: "Kwame Mensah",
    type: "out_for_delivery",
    note: null,
    at: hours(2),
  },
  {
    id: "dev_004",
    orderId: "ORD-2026-0050",
    riderId: "rdr_002",
    riderName: "Abena Osei",
    type: "assigned",
    note: null,
    at: days(2),
  },
  {
    id: "dev_005",
    orderId: "ORD-2026-0050",
    riderId: "rdr_002",
    riderName: "Abena Osei",
    type: "picked_up",
    note: null,
    at: days(1.5),
  },
  {
    id: "dev_006",
    orderId: "ORD-2026-0049",
    riderId: "rdr_001",
    riderName: "Kwame Mensah",
    type: "assigned",
    note: null,
    at: days(3),
  },
  {
    id: "dev_007",
    orderId: "ORD-2026-0041",
    riderId: "rdr_003",
    riderName: "Kofi Asante",
    type: "assigned",
    note: null,
    at: days(0.5),
  },
  {
    id: "dev_008",
    orderId: "ORD-2026-0040",
    riderId: "rdr_001",
    riderName: "Kwame Mensah",
    type: "assigned",
    note: null,
    at: days(31),
  },
  {
    id: "dev_009",
    orderId: "ORD-2026-0040",
    riderId: "rdr_001",
    riderName: "Kwame Mensah",
    type: "picked_up",
    note: null,
    at: days(30.8),
  },
  {
    id: "dev_010",
    orderId: "ORD-2026-0040",
    riderId: "rdr_001",
    riderName: "Kwame Mensah",
    type: "out_for_delivery",
    note: null,
    at: days(30.5),
  },
  {
    id: "dev_011",
    orderId: "ORD-2026-0040",
    riderId: "rdr_001",
    riderName: "Kwame Mensah",
    type: "delivered",
    note: "Left with security",
    at: days(30),
  },
];
