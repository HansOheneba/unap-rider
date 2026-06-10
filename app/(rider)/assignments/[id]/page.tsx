"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  ChevronRight,
  Copy,
  MapPin,
  Navigation,
  Phone,
} from "lucide-react";
import { useAssignment } from "@/lib/hooks/useAssignments";
import { AssignmentActions } from "@/components/assignments/assignment-actions";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { DeliveryProgress } from "@/components/assignments/delivery-progress";
import { DeliveryTimeline } from "@/components/assignments/delivery-timeline";
import { AssignmentStatusBadge } from "@/components/shared/status-badge";
import { getStatusTheme } from "@/lib/status-theme";
import { Button } from "@/components/ui/button";
import { AssignmentDetailSkeleton } from "@/components/skeletons/shipment-skeletons";
import { formatDeliveryLocation, telUrl, whatsAppUrl } from "@/lib/format";
import { cn } from "@/lib/utils";

function ListRow({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 px-3 py-2",
        className,
      )}
    >
      <small className="shrink-0 text-zinc-500">{label}</small>
      <p className="truncate text-right font-medium">{value}</p>
    </div>
  );
}

function GroupCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-100">
      {children}
    </div>
  );
}

function RowDivider() {
  return <div className="mx-3 border-t border-zinc-100" />;
}

export default function AssignmentDetailPage() {
  const params = useParams<{ id: string }>();
  const { data, isLoading, error } = useAssignment(params.id);

  const location = data ? formatDeliveryLocation(data) : null;
  const fullAddress = location
    ? [location.primary, location.secondary].filter(Boolean).join(", ")
    : "";

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(fullAddress);
      toast.success("Address copied.");
    } catch {
      toast.error("Could not copy.");
    }
  };

  if (isLoading) {
    return <AssignmentDetailSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="bg-zinc-100 px-4 py-6 text-center">
        <p className="text-zinc-500">Shipment not found.</p>
        <Button variant="link" asChild className="mt-2">
          <Link href="/">Back to shipments</Link>
        </Button>
      </div>
    );
  }

  const theme = getStatusTheme(data.status);
  const phone = data.customerPhone;
  const wa = data.customerWhatsapp ?? data.customerPhone;
  return (
    <>
      <div className="on-dark bg-zinc-900 px-3 pb-3 pt-3">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="h-9 w-9 text-white hover:bg-white/10"
          >
            <Link href="/" aria-label="Back">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="min-w-0 flex-1">
            <small>{data.trackingNumber}</small>
            <h2 className="line-clamp-2 text-[length:var(--text-heading)] leading-snug">
              {data.address}
            </h2>
          </div>
          <AssignmentStatusBadge status={data.status} size="sm" />
        </div>
        <div className="mt-2.5">
          <DeliveryProgress status={data.status} />
        </div>
      </div>

      <div className="space-y-3 bg-zinc-100 px-3 py-3 pb-28">
        <div className="rounded-xl bg-white px-3 py-2.5 shadow-sm ring-1 ring-zinc-100">
          <AssignmentStatusBadge status={data.status} size="sm" />
          <small className="mt-1.5 block text-zinc-500">
            {data.status === "assigned"
              ? "Confirm pickup when you have the package."
              : data.status === "picked_up"
                ? "Head back to shipments when ready to leave."
                : data.status === "out_for_delivery"
                  ? "Slide to confirm when the customer receives it."
                  : "This stop is complete."}
          </small>
        </div>

        <GroupCard>
          <div className="flex items-center justify-between gap-2 px-3 py-2.5">
            <div className="min-w-0">
              <small>Deliver to</small>
              <h3 className="truncate">{data.customerName}</h3>
            </div>
            <div className="flex shrink-0 gap-1.5">
              <Button
                size="icon"
                className="h-8 w-8 rounded-full bg-[#25D366] text-white hover:bg-[#20BD5A]"
                asChild
              >
                <a
                  href={whatsAppUrl(wa)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp customer"
                >
                  <WhatsAppIcon />
                </a>
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8 rounded-full"
                asChild
              >
                <a href={telUrl(phone)}>
                  <Phone className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>

          <RowDivider />

          <div className="flex items-start gap-2 px-3 py-2">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#E8192C]" />
            <div className="min-w-0 flex-1">
              <p className="text-[length:var(--text-caption)] font-medium leading-snug">
                {fullAddress}
              </p>
              {data.landmark ? (
                <small className="mt-0.5 block text-amber-700">
                  {data.landmark}
                </small>
              ) : null}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={copyAddress}
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>

          {data.mapsUrl ? (
            <>
              <RowDivider />
              <a
                href={data.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2.5 text-[#007AFF] active:bg-zinc-50"
              >
                <Navigation className="h-4 w-4 shrink-0" />
                <span className="flex-1 font-medium">Open in Google Maps</span>
                <ChevronRight className="h-4 w-4 shrink-0 opacity-50" />
              </a>
            </>
          ) : null}
        </GroupCard>

        <GroupCard>
          <p className="section-label px-3 pb-1 pt-2.5">Shipment</p>
          <ListRow label="Items" value={`${data.itemCount}`} />
          <RowDivider />
          <ListRow
            label="Size"
            value={
              data.items
                .map((i) => i.size)
                .filter(Boolean)
                .join(", ") || "N/A"
            }
          />
          <RowDivider />
          <ListRow label="Status" value={theme.listLabel} />
          <RowDivider />
          <ListRow label="Payment" value="Paid" />
          {data.items.map((item, i) => (
            <React.Fragment key={i}>
              <RowDivider />
              <div className="flex items-center justify-between gap-3 px-3 py-2">
                <div className="min-w-0">
                  <p className="truncate font-medium">{item.productName}</p>
                  <small>
                    {[item.size, item.colorName].filter(Boolean).join(" · ")}
                  </small>
                </div>
                <p className="shrink-0 font-medium">x{item.quantity}</p>
              </div>
            </React.Fragment>
          ))}
        </GroupCard>

        {data.customerNote ? (
          <div className="rounded-xl border border-sky-200 bg-sky-50 px-3 py-2.5">
            <small className="font-medium text-sky-700">Customer note</small>
            <p className="mt-0.5 text-[length:var(--text-caption)] font-medium text-sky-900">
              {data.customerNote}
            </p>
          </div>
        ) : null}

        {data.internalNote ? (
          <div className="rounded-xl border border-violet-200 bg-violet-50 px-3 py-2.5">
            <small className="font-medium text-violet-700">Rider note</small>
            <p className="mt-0.5 text-[length:var(--text-caption)] font-medium text-violet-900">
              {data.internalNote}
            </p>
          </div>
        ) : null}

        <DeliveryTimeline events={data.events} />
      </div>

      <AssignmentActions orderId={data.id} status={data.status} />
    </>
  );
}
