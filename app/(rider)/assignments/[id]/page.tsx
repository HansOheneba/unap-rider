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
  StickyNote,
} from "lucide-react";
import { useAssignment } from "@/lib/hooks/useAssignments";
import { AssignmentActions } from "@/components/assignments/assignment-actions";
import { DeliveryTimeline } from "@/components/assignments/delivery-timeline";
import { AssignmentStatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { telUrl, whatsAppUrl } from "@/lib/format";

export default function AssignmentDetailPage() {
  const params = useParams<{ id: string }>();
  const { data, isLoading, error } = useAssignment(params.id);

  const fullAddress = data
    ? [data.address, data.district, data.city, data.region]
        .filter(Boolean)
        .join(", ")
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
      <div className="space-y-4 px-4 py-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="px-4 py-6 text-center">
        <p className="text-sm text-zinc-500">Assignment not found.</p>
        <Button variant="link" asChild className="mt-2">
          <Link href="/">Back to today</Link>
        </Button>
      </div>
    );
  }

  const phone = data.customerPhone;
  const wa = data.customerWhatsapp ?? data.customerPhone;

  return (
    <>
      <div className="space-y-4 px-4 py-6 pb-36">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/" aria-label="Back">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex-1">
            <p className="text-xs text-zinc-500">{data.trackingNumber}</p>
            <h1 className="text-xl font-bold tracking-tight">
              {data.customerName}
            </h1>
          </div>
          <AssignmentStatusBadge status={data.status} />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" className="w-full" asChild>
            <a href={telUrl(phone)}>
              <Phone className="h-4 w-4" />
              Call
            </a>
          </Button>
          <Button variant="outline" className="w-full" asChild>
            <a href={whatsAppUrl(wa)} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
          </Button>
        </div>

        <Card>
          <CardTitle className="flex items-center justify-between px-4 pt-4">
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Delivery address
            </span>
            <Button variant="ghost" size="sm" onClick={copyAddress}>
              <Copy className="h-4 w-4" />
              Copy
            </Button>
          </CardTitle>
          <CardContent className="space-y-2">
            <p className="text-sm text-zinc-900">{fullAddress}</p>
            {data.landmark ? (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm font-medium text-amber-900">
                Landmark: {data.landmark}
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardTitle className="px-4 pt-4">Items ({data.itemCount})</CardTitle>
          <CardContent className="divide-y divide-zinc-100">
            {data.items.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-3 text-sm"
              >
                <div>
                  <p className="font-medium text-zinc-900">
                    {item.productName}
                  </p>
                  <p className="text-zinc-500">
                    {[item.size, item.colorName].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <span className="font-medium">x{item.quantity}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {data.customerNote ? (
          <Card>
            <CardTitle className="flex items-center gap-2 px-4 pt-4">
              <StickyNote className="h-4 w-4" />
              Customer note
            </CardTitle>
            <CardContent>
              <p className="text-sm text-zinc-700">{data.customerNote}</p>
            </CardContent>
          </Card>
        ) : null}

        {data.internalNote ? (
          <Card className="border-zinc-900/10 bg-zinc-50">
            <CardTitle className="px-4 pt-4">Rider note (internal)</CardTitle>
            <CardContent>
              <p className="text-sm font-medium text-zinc-800">
                {data.internalNote}
              </p>
            </CardContent>
          </Card>
        ) : null}

        <DeliveryTimeline events={data.events} />
      </div>

      <AssignmentActions orderId={data.id} status={data.status} />
    </>
  );
}
