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
            <span className="truncate text-sm font-semibold text-zinc-900">
              {assignment.trackingNumber}
            </span>
          </div>
          <AssignmentStatusBadge status={assignment.status} />
        </div>

        <div className="space-y-3 px-4 py-3">
          <div>
            <h3 className="text-lg font-bold text-zinc-900">{primaryItem}</h3>
            <p className="mt-0.5 text-sm text-zinc-500">
              {assignment.itemCount} item{assignment.itemCount !== 1 ? "s" : ""}{" "}
              · {assignment.customerName}
            </p>
          </div>

          <div className="rounded-xl bg-zinc-50 px-3 py-2.5">
            <div className="flex items-start gap-2">
              <MapPin className={cn("mt-0.5 h-4 w-4 shrink-0", theme.text)} />
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-snug text-zinc-900">
                  {location.primary}
                </p>
                <p className="mt-0.5 text-xs text-zinc-500">
                  {location.secondary}
                </p>
                {location.landmark ? (
                  <p className="mt-1.5 rounded-lg bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-900">
                    Near {location.landmark}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-zinc-100 bg-zinc-50 px-4 py-3 text-sm">
          <p className="text-xs text-zinc-500">Tap for full details</p>
          <div className="flex items-center gap-1 font-medium text-zinc-500">
            <span className={cn("text-xs", theme.text)}>Open</span>
            <ChevronRight className="h-4 w-4" />
          </div>
        </div>
      </article>
    </Link>
  );
}
