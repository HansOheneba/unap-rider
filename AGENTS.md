# Unapologetic Rider PWA — Build Brief

Copy this file to the root of the new rider project as **`AGENTS.md`** (or keep as `docs/RIDER_AGENTS.md` and point your agent at it).

Standalone **Next.js PWA** for Accra in-house delivery riders. Separate from the storefront and from **`unapadmin`** (staff CMS).

---

## Ecosystem

| Project | Port | Role |
|---------|------|------|
| Storefront (`unapologetic`) | 3000 | Customer shopping |
| Admin (`unapadmin`) | 3001 | Staff CMS, **assigns riders**, views delivery events |
| **Rider PWA (`unaprider`)** | 3002 | Riders report pickup / delivery |

All apps call the same backend: `NEXT_PUBLIC_API_URL`.

**Admin already implements (mock + API stubs):**

- `Order.deliveryType`: `"accra_inhouse"` | `"partner"`
- `Order.riderId`, `Order.riderNote`
- `PATCH /orders/:id/assign-rider` — admin assigns rider
- `GET /orders/:id/delivery-events` — timeline admin + rider app reads
- Rider-reported events append to the same `DeliveryEvent` log

---

## Source of truth for types

Mirror these shapes from **`unapadmin/types/index.ts`**:

```ts
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
```

**Rider session (auth response):**

```ts
type RiderSession = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  zone: string;
  status: RiderStatus;
  vehicleType: VehicleType;
  plateNumber: string;
};
```

**Assignment (rider-facing order view):**

```ts
type AssignmentStatus =
  | "assigned"
  | "picked_up"
  | "out_for_delivery"
  | "delivered"
  | "failed";

type RiderAssignment = {
  id: string;              // order id e.g. ORD-2026-0051
  orderNumber: string;
  trackingNumber: string;  // UNAP-000051
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
  internalNote: string | null;  // maps to Order.riderNote from admin
  assignedAt: string;
  pickedUpAt: string | null;
  outForDeliveryAt: string | null;
  deliveredAt: string | null;
  failedAt: string | null;
  failureReason: string | null;
};
```

Derive `AssignmentStatus` from order fields + latest event (backend should return this ready-made).

---

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 App Router, TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Server state | React Query v5 |
| Auth | Phone OTP → JWT (`role: "rider"`) |
| PWA | `@serwist/next` or equivalent + web manifest |
| Toasts | sonner |
| Dates | date-fns |

```json
"dev": "next dev -p 3002"
```

Read `node_modules/next/dist/docs/` before writing App Router code.

---

## Design

- Mobile-first, portrait, thumb-friendly (min 48px taps)
- `bg-zinc-50` page, white cards, `border-zinc-200`
- Primary CTA: black button, full width on detail screens
- Logo: `/logos/unapologeticBlack.png` (copy from `unapadmin/public/logos/`)
- Status pill colors match admin order badges
- No em dashes in UI copy

---

## Auth (phone OTP, not email)

```
POST /rider/auth/send-otp   { phone: "+233241234567" }
POST /rider/auth/verify-otp { phone, otp: "123456" }
  → { token, rider: RiderSession }
POST /rider/auth/logout
GET  /rider/auth/me
```

- JWT stored in zustand + persist (same pattern as `unapadmin/lib/auth-store.ts`)
- `middleware.ts` protects all routes except `/login`
- Mock dev: seeded rider phones + any 6-digit OTP

**Seed rider phones** (from `unapadmin/lib/data/seed.ts`):

| Rider | Phone |
|-------|-------|
| Kwame Mensah | +233 24 123 4567 |
| Abena Osei | +233 55 987 6543 |
| Kofi Asante | +233 20 456 7890 |
| Ama Darko | +233 27 321 0987 |

---

## Rider API (backend implements; mock in rider app until ready)

### Assignments

```
GET  /rider/assignments?date=today&status=assigned|picked_up|...
GET  /rider/assignments/:orderId
     → RiderAssignment & { events: DeliveryEvent[] }

POST /rider/assignments/:orderId/picked-up       { note?: string }
POST /rider/assignments/:orderId/out-for-delivery { note?: string }
POST /rider/assignments/:orderId/delivered        { note?: string; photoUrl?: string }
POST /rider/assignments/:orderId/failed           { reason: string; note?: string }
```

**Backend side effects:**

| Action | Order.status | Timestamps |
|--------|--------------|------------|
| picked-up | `in_transit` | `pickedUpAt` |
| out-for-delivery | `out_for_delivery` | `outForDeliveryAt` |
| delivered | `delivered` | `deliveredAt` |
| failed | `exception` | `failedAt`, `failureReason` |

Each action appends a `DeliveryEvent`. Admin `unapadmin` reads the same events at `GET /orders/:id/delivery-events`.

### Stats

```
GET /rider/stats/today
  → { assigned, pickedUp, outForDelivery, delivered, failed }
```

### Duty toggle (V1)

```
PATCH /rider/me/status  { status: "active" | "off_duty" }
```

---

## Pages

```
app/
  (auth)/login/page.tsx
  (rider)/
    layout.tsx          bottom nav + auth guard
    page.tsx            today's runs (default)
    assignments/[id]/page.tsx
    history/page.tsx
    profile/page.tsx
  offline/page.tsx      optional
middleware.ts
```

### `/` Today's runs

- Greeting + today stats
- Tabs: **To pick up** | **Out for delivery** | **Done**
- Assignment cards → tap for detail
- Pull-to-refresh; poll every 60s when tab visible

### `/assignments/[id]`

- Customer name, **Call** + **WhatsApp** (`tel:`, `wa.me`)
- Address (copy button), landmark highlighted
- Items list, customer note, internal rider note
- Event timeline
- Sticky bottom actions by status:

| Status | Primary | Secondary |
|--------|---------|-----------|
| assigned | Picked up | — |
| picked_up | Out for delivery | — |
| out_for_delivery | Delivered | Could not deliver |
| delivered / failed | Read-only | — |

Confirm dialog before each action. Failed flow: reason select + optional note.

### `/history`

- Completed assignments, paginated (20/page, shadcn pagination)

### `/profile`

- Rider info, duty toggle, sign out

### Bottom nav

`Today` · `History` · `Profile`

---

## PWA

**`public/manifest.webmanifest`:**

```json
{
  "name": "Unapologetic Rider",
  "short_name": "UNAP Rider",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#fafafa",
  "theme_color": "#000000",
  "orientation": "portrait"
}
```

- Service worker: cache app shell only; API = network-first
- `theme-color` meta black; apple-touch-icon
- Install prompt on first visit (Android); iOS add-to-home hint after login

---

## Project structure

```
unaprider/
  app/(auth)/login/
  app/(rider)/
  components/
    layout/bottom-nav.tsx, rider-guard.tsx
    assignments/assignment-card.tsx, assignment-actions.tsx, delivery-timeline.tsx
    ui/                    # shadcn
  lib/
    api/client.ts, auth.ts, assignments.ts
    hooks/useAssignments.ts, useRiderAuth.ts
    auth-store.ts
    constants/pagination.ts  # PAGE_SIZE = 20
  types/index.ts
  public/logos/
  middleware.ts
```

Copy `public/logos/` from `unapadmin` or storefront.

---

## Mock mode (build day one without backend)

`NEXT_PUBLIC_USE_MOCK_API=true`

Seed assignments from admin seed data:

- Orders with `riderId` set and `deliveryType: "accra_inhouse"` in `unapadmin/lib/data/seed.ts`
- Example assigned order: `ORD-2026-0051` → rider `rdr_001` (Kwame)
- Delivery events in `unapadmin/lib/data/seed.ts` → `seedDeliveryEvents`

Mock login: Kwame's phone + any 6-digit OTP.

Implement `lib/mock/data-store.ts` in rider app that:

1. Loads rider by phone on OTP verify
2. Returns assignments where `order.riderId === rider.id`
3. Status transitions update in-memory state + append events

---

## Environment

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_USE_MOCK_API=true
NEXT_PUBLIC_ADMIN_URL=http://localhost:3001
```

---

## Scope phases

### MVP (ship first)

- [ ] Phone OTP login + mock fallback
- [ ] Today's assignments list
- [ ] Assignment detail: call, WhatsApp, address, items
- [ ] Status buttons: picked up → out for delivery → delivered
- [ ] Failed delivery with reason
- [ ] PWA manifest + installable
- [ ] `npm run build` passes

### V1

- [ ] History + pagination
- [ ] Profile + duty toggle
- [ ] Pull-to-refresh
- [ ] Offline fallback page

### V2

- [ ] Photo proof on delivered
- [ ] WhatsApp assign notifications (backend)
- [ ] Offline action queue

---

## Security

- JWT `role` must be `"rider"`
- Every assignment endpoint verifies `assignment.riderId === session.riderId`
- No payment, refund, catalog, or other riders' data
- Rate-limit OTP and status updates on backend

---

## Getting started

```bash
npx create-next-app@latest unaprider --typescript --tailwind --app
cd unaprider

npm install @tanstack/react-query zustand sonner date-fns input-otp
npx shadcn@latest init
npx shadcn@latest add button input label card badge dialog tabs skeleton pagination

cp -r ../unapadmin/public/logos ./public/
cp docs/RIDER_AGENTS.md ./AGENTS.md   # if copied from admin repo

npm run dev   # :3002
```

---

## Admin integration checklist (already in unapadmin)

- [x] `Order.deliveryType`, `riderId`, `riderNote`, delivery timestamps
- [x] Assign rider on order detail (Accra in-house only)
- [x] Delivery event timeline on order detail
- [x] Partner orders still use carrier + tracking on status update
- [ ] Backend team implements `/rider/*` + persists events
- [ ] Rider app consumes same API

---

## Success criteria

- Rider completes a stop in under 30 seconds (open → confirm)
- Admin order status updates when rider taps
- Installable on Android home screen
- Works on mid-range phones over 3G
