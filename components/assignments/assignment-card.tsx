"use client";

import Link from "next/link";
import { MapPin, Package } from "lucide-react";
import type { RiderAssignment } from "@/types";
import { AssignmentStatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent } from "@/components/ui/card";

export function AssignmentCard({ assignment }: { assignment: RiderAssignment }) {
  return (
    <Link href={`/assignments/${assignment.id}`} className="block">
      <Card className="transition-colors hover:border-zinc-300 active:bg-zinc-50">
        <CardContent className="space-y-3 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs text-zinc-500">{assignment.trackingNumber}</p>
              <h3 className="text-base font-semibold text-zinc-900">
                {assignment.customerName}
              </h3>
            </div>
            <AssignmentStatusBadge status={assignment.status} />
          </div>

          <div className="flex items-start gap-2 text-sm text-zinc-600">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
            <span>
              {assignment.address}, {assignment.city}
              {assignment.landmark ? (
                <span className="block text-zinc-500">
                  Near {assignment.landmark}
                </span>
              ) : null}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <Package className="h-4 w-4" />
            <span>
              {assignment.itemCount} item{assignment.itemCount !== 1 ? "s" : ""}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
