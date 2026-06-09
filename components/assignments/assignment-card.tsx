"use client";

import Link from "next/link";
import { Box, ChevronRight, MapPin } from "lucide-react";
import type { RiderAssignment } from "@/types";
import { formatDeliveryLocation } from "@/lib/format";
import { getStatusTheme } from "@/lib/status-theme";
import { AssignmentStatusBadge } from "@/components/shared/status-badge";
import { cn } from "@/lib/utils";

export function AssignmentCard({ assignment }: { assignment: RiderAssignment }) {
  const theme = getStatusTheme(assignment.status);
  const primaryItem = assignment.items[0]?.productName ?? "Order";
  const location = formatDeliveryLocation(assignment);

  return (
    <Link href={`/assignments/${assignment.id}`} className="block">
      <article className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-zinc-100 transition active:scale-[0.99]">
        <div className="flex items-center justify-between gap-3 border-b border-zinc-100 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100">
              <Box className="h-4 w-4 text-zinc-700" />
            </div>
            <p className="truncate font-medium">{assignment.trackingNumber}</p>
          </div>
          <AssignmentStatusBadge status={assignment.status} />
        </div>

        <div className="space-y-3 px-4 py-3">
          <div>
            <h3>{primaryItem}</h3>
            <small className="mt-0.5">
              {assignment.itemCount} item{assignment.itemCount !== 1 ? "s" : ""}{" "}
              · {assignment.customerName}
            </small>
          </div>

          <div className="rounded-xl bg-zinc-50 px-3 py-2.5">
            <div className="flex items-start gap-2">
              <MapPin className={cn("mt-0.5 h-4 w-4 shrink-0", theme.text)} />
              <div className="min-w-0">
                <p className="font-medium leading-snug">{location.primary}</p>
                <small className="mt-0.5">{location.secondary}</small>
                {location.landmark ? (
                  <small className="mt-1.5 block rounded-lg bg-amber-50 px-2 py-1 font-medium text-amber-900">
                    Near {location.landmark}
                  </small>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-zinc-100 bg-zinc-50 px-4 py-3">
          <small>Tap for full details</small>
          <div className={cn("flex items-center gap-1 font-medium", theme.text)}>
            <small>Open</small>
            <ChevronRight className="h-4 w-4" />
          </div>
        </div>
      </article>
    </Link>
  );
}
