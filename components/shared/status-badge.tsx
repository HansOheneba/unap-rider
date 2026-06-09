import type { AssignmentStatus } from "@/types";
import { assignmentStatusLabel } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

const config: Record<
  AssignmentStatus,
  "amber" | "blue" | "orange" | "emerald" | "red"
> = {
  assigned: "amber",
  picked_up: "blue",
  out_for_delivery: "orange",
  delivered: "emerald",
  failed: "red",
};

export function AssignmentStatusBadge({
  status,
}: {
  status: AssignmentStatus;
}) {
  return (
    <Badge variant={config[status]}>{assignmentStatusLabel(status)}</Badge>
  );
}
