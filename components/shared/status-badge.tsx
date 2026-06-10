import type { AssignmentStatus } from "@/types";
import { getStatusTheme } from "@/lib/status-theme";
import { cn } from "@/lib/utils";

export function AssignmentStatusBadge({
  status,
  size = "default",
}: {
  status: AssignmentStatus;
  size?: "sm" | "default" | "lg";
}) {
  const theme = getStatusTheme(status);

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full font-normal",
        size === "sm"
          ? "px-2 py-0.5 text-[0.6875rem]"
          : "px-2.5 py-1 text-[length:var(--text-caption)]",
        theme.badge,
        size === "lg" && "px-3 py-1.5",
      )}
    >
      {theme.listLabel}
    </span>
  );
}
