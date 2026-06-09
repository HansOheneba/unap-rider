import { Box, MapPin } from "lucide-react";
import type { AssignmentStatus } from "@/types";
import { cn } from "@/lib/utils";

type Props = {
  status: AssignmentStatus;
  customerName: string;
  address: string;
};

export function DeliveryProgress({ status, customerName, address }: Props) {
  const progress =
    status === "assigned"
      ? 0
      : status === "picked_up"
        ? 33
        : status === "out_for_delivery"
          ? 66
          : 100;

  return (
    <div className="rounded-2xl bg-zinc-100 p-4">
      <div className="mb-3 flex items-center justify-between text-xs font-semibold text-zinc-500">
        <span>Warehouse</span>
        <span>{customerName}</span>
      </div>
      <div className="relative flex items-center">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-white">
          <Box className="h-4 w-4" />
        </div>
        <div className="relative mx-2 h-1 flex-1 overflow-hidden rounded-full bg-zinc-300">
          <div
            className={cn(
              "absolute inset-y-0 left-0 rounded-full bg-[#E8192C] transition-all duration-500",
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E8192C] text-white">
          <MapPin className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-3 truncate text-sm font-medium text-zinc-700">
        {address}
      </p>
    </div>
  );
}
