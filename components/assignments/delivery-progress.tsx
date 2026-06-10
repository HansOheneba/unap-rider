import { Box, MapPin } from "lucide-react";
import type { AssignmentStatus } from "@/types";

type Props = {
  status: AssignmentStatus;
};

export function DeliveryProgress({ status }: Props) {
  const progress =
    status === "assigned"
      ? 0
      : status === "picked_up"
        ? 33
        : status === "out_for_delivery"
          ? 66
          : 100;

  return (
    <div className="flex items-center gap-2 px-1">
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-white">
        <Box className="h-3 w-3" />
      </div>
      <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/25">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-white transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-zinc-900">
        <MapPin className="h-3 w-3" />
      </div>
    </div>
  );
}
