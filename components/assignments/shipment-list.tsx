"use client";

import * as React from "react";
import { ListFilter } from "lucide-react";
import type { AssignmentStatus } from "@/types";
import { useAssignments } from "@/lib/hooks/useAssignments";
import { AssignmentCard } from "@/components/assignments/assignment-card";
import { ShipmentListSkeleton } from "@/components/skeletons/shipment-skeletons";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type StatusFilter = AssignmentStatus | "all";

type Props = {
  statuses: AssignmentStatus[];
  title: string;
};

export function ShipmentList({ statuses, title }: Props) {
  const { data, isLoading } = useAssignments(statuses);
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all");

  const showStatusFilter =
    statuses.includes("assigned") && statuses.includes("picked_up");

  const filtered = React.useMemo(() => {
    if (!data) return [];
    if (!showStatusFilter || statusFilter === "all") return data;
    return data.filter((a) => a.status === statusFilter);
  }, [data, showStatusFilter, statusFilter]);

  if (isLoading) {
    return (
      <ShipmentListSkeleton rows={5} showFilter={showStatusFilter} />
    );
  }

  if (!data?.length) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-200 bg-white px-4 py-10 text-center">
        <p className="text-zinc-500">No shipments here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <h2 className="shrink-0 whitespace-nowrap text-[length:var(--text-body)] font-medium text-zinc-800">
          {title}
          <span className="ml-1 font-normal text-zinc-500">
            ({filtered.length})
          </span>
        </h2>

        {showStatusFilter ? (
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as StatusFilter)}
          >
            <SelectTrigger
              className={cn(
                "ml-auto h-8 w-auto shrink-0 gap-1.5 px-2.5 text-[length:var(--text-caption)] font-normal",
                statusFilter !== "all" && "border-zinc-400",
              )}
            >
              <ListFilter className="h-3.5 w-3.5 shrink-0" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="assigned">Awaiting pickup</SelectItem>
              <SelectItem value="picked_up">Picked up</SelectItem>
            </SelectContent>
          </Select>
        ) : null}
      </div>

      {statusFilter !== "all" && filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-200 bg-white px-4 py-8 text-center">
          <p className="text-[length:var(--text-caption)] text-zinc-500">
            No shipments match this filter.
          </p>
          <Button
            variant="link"
            className="mt-1 h-auto p-0 text-zinc-900"
            onClick={() => setStatusFilter("all")}
          >
            Clear filter
          </Button>
        </div>
      ) : (
        filtered.map((a) => <AssignmentCard key={a.id} assignment={a} />)
      )}
    </div>
  );
}
