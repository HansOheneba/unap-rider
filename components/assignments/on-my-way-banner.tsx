"use client";

import { toast } from "sonner";
import { Bike } from "lucide-react";
import { useOnMyWay } from "@/lib/hooks/useAssignments";
import { Button } from "@/components/ui/button";

type Props = {
  packageCount: number;
};

export function OnMyWayBanner({ packageCount }: Props) {
  const onMyWay = useOnMyWay();

  const handleDepart = async () => {
    try {
      const result = await onMyWay.mutateAsync();
      toast.success(
        `On your way. ${result.updated} customer${result.updated !== 1 ? "s" : ""} notified.`,
      );
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Could not start deliveries.",
      );
    }
  };

  return (
    <div className="on-dark rounded-2xl bg-zinc-900 p-4 shadow-lg">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E8192C]">
          <Bike className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h3>All packages loaded</h3>
          <p className="mt-1">
            Tap when you leave the warehouse. Customers get a heads up to keep
            their phone nearby.
          </p>
        </div>
      </div>
      <Button
        size="lg"
        className="mt-4 w-full bg-[#E8192C] hover:bg-[#c91526]"
        disabled={onMyWay.isPending}
        onClick={handleDepart}
      >
        {onMyWay.isPending
          ? "Notifying customers..."
          : `I'm on my way (${packageCount})`}
      </Button>
    </div>
  );
}
