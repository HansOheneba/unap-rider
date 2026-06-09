"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Copy,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import { useAssignment } from "@/lib/hooks/useAssignments";
import { AssignmentActions } from "@/components/assignments/assignment-actions";
import { DeliveryProgress } from "@/components/assignments/delivery-progress";
import { DeliveryTimeline } from "@/components/assignments/delivery-timeline";
import { AssignmentStatusBadge } from "@/components/shared/status-badge";
import { getStatusTheme } from "@/lib/status-theme";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDeliveryLocation, telUrl, whatsAppUrl } from "@/lib/format";

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 text-sm">
      <span className="text-zinc-500">{label}</span>
      <span className="font-semibold text-zinc-900">{value}</span>
    </div>
  );
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
    return (
      <div className="space-y-4 bg-zinc-100 p-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-60 w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-zinc-100 px-4 py-6 text-center">
        <p className="text-sm text-zinc-500">Shipment not found.</p>
        <Button variant="link" asChild className="mt-2">
          <Link href="/">Back to shipments</Link>
        </Button>
      </div>
    );
  }

  const theme = getStatusTheme(data.status);
  const phone = data.customerPhone;
  const wa = data.customerWhatsapp ?? data.customerPhone;
  const primaryItem = data.items[0]?.productName ?? "Order";

  return (
    <>
      <div className="bg-zinc-900 px-4 pb-4 pt-4 text-white">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="text-white hover:bg-white/10"
          >
            <Link href="/" aria-label="Back">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-zinc-400">{data.trackingNumber}</p>
            <h1 className="truncate text-xl font-bold">{primaryItem}</h1>
          </div>
          <AssignmentStatusBadge status={data.status} />
        </div>
      </div>

      <div className="space-y-4 bg-zinc-100 px-4 py-4 pb-40">
        <DeliveryProgress
          status={data.status}
          customerName={data.customerName}
          address={fullAddress}
        />

        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500">Deliver to</p>
              <p className="text-lg font-bold text-zinc-900">
                {data.customerName}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="icon"
                className="rounded-full bg-[#E8192C] hover:bg-[#c91526]"
                asChild
              >
                <a href={whatsAppUrl(wa)} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-5 w-5" />
                </a>
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="rounded-full"
                asChild
              >
                <a href={telUrl(phone)}>
                  <Phone className="h-5 w-5" />
                </a>
              </Button>
            </div>
          </div>

          <div className="mt-3 flex items-start gap-2 rounded-xl bg-zinc-50 p-3">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#E8192C]" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium leading-snug text-zinc-900">
                {fullAddress}
              </p>
              {data.landmark ? (
                <p className="mt-1 text-sm font-semibold text-amber-700">
                  Landmark: {data.landmark}
                </p>
              ) : null}
            </div>
            <Button variant="ghost" size="sm" onClick={copyAddress}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="rounded-2xl bg-zinc-100 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Shipment details
          </p>
          <div className="divide-y divide-zinc-200">
            <SpecRow label="Items" value={`${data.itemCount}`} />
            <SpecRow
              label="Size"
              value={
                data.items
                  .map((i) => i.size)
                  .filter(Boolean)
                  .join(", ") || "N/A"
              }
            />
            <SpecRow label="Status" value={theme.listLabel} />
            <SpecRow label="Payment" value="Paid" />
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-100">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Package contents
          </p>
          <div className="divide-y divide-zinc-100">
            {data.items.map((item, i) => (
              <div key={i} className="flex justify-between py-3 text-sm">
                <div>
                  <p className="font-semibold text-zinc-900">
                    {item.productName}
                  </p>
                  <p className="text-zinc-500">
                    {[item.size, item.colorName].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <span className="font-bold">x{item.quantity}</span>
              </div>
            ))}
          </div>
        </div>

        {data.customerNote ? (
          <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4">
            <p className="text-xs font-semibold text-sky-700">Customer note</p>
            <p className="mt-1 text-sm font-medium text-sky-900">
              {data.customerNote}
            </p>
          </div>
        ) : null}

        {data.internalNote ? (
          <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4">
            <p className="text-xs font-semibold text-violet-700">
              Internal rider note
            </p>
            <p className="mt-1 text-sm font-semibold text-violet-900">
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
