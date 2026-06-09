import type { AssignmentStatus } from "@/types";
import { getStatusTheme } from "@/lib/status-theme";
import { cn } from "@/lib/utils";

export function AssignmentStatusBadge({
  status,
  size = "default",
}: {
  status: AssignmentStatus;
  size?: "default" | "lg";
}) {
  const theme = getStatusTheme(status);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[length:var(--text-caption)] font-medium",
        theme.badge,
        size === "lg" && "px-3 py-1.5",
      )}
    >
      {theme.listLabel}
    </span>
  );
}
