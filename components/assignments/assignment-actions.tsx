"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ChevronRight, PackageCheck } from "lucide-react";
import type { AssignmentStatus } from "@/types";
import { useAssignmentActions } from "@/lib/hooks/useAssignments";
import { SlideToConfirm } from "@/components/ui/slide-to-confirm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  orderId: string;
  status: AssignmentStatus;
};

const RETURN_REASONS = [
  { value: "customer_unavailable", label: "Customer unavailable" },
  { value: "wrong_address", label: "Wrong address" },
  { value: "refused", label: "Customer refused" },
  { value: "returned", label: "Returned to warehouse" },
  { value: "other", label: "Other" },
];

export function AssignmentActions({ orderId, status }: Props) {
  const { pickedUp, delivered, failed } = useAssignmentActions(orderId);

  const [returnOpen, setReturnOpen] = React.useState(false);
  const [note, setNote] = React.useState("");
  const [reason, setReason] = React.useState("");

  const loading =
    pickedUp.isPending || delivered.isPending || failed.isPending;

  const handlePickup = async () => {
    try {
      await pickedUp.mutateAsync(undefined);
      toast.success("Package picked up.");
    } catch {
      toast.error("Could not confirm pickup.");
    }
  };

  const handleDelivered = async () => {
    try {
      await delivered.mutateAsync(undefined);
      toast.success("Delivery confirmed.");
    } catch {
      toast.error("Could not confirm delivery.");
    }
  };

  const handleReturn = async () => {
    if (!reason) {
      toast.error("Select a reason.");
      return;
    }
    try {
      await failed.mutateAsync({ reason, note: note || undefined });
      toast.success("Marked as returned.");
      setReturnOpen(false);
      setNote("");
      setReason("");
    } catch {
      toast.error("Could not update status.");
    }
  };

  if (status === "delivered" || status === "failed") return null;

  return (
    <>
      <div className="fixed inset-x-0 bottom-16 z-40 border-t border-zinc-200 bg-white p-4 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] safe-bottom">
        <div className="mx-auto max-w-lg space-y-3">
          {status === "assigned" ? (
            <Button
              size="lg"
              className="w-full bg-[#E8192C] hover:bg-[#c91526]"
              disabled={loading}
              onClick={handlePickup}
            >
              <PackageCheck className="h-5 w-5" />
              Confirm pickup
              <ChevronRight className="h-5 w-5" />
            </Button>
          ) : null}

          {status === "picked_up" ? (
            <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 text-center">
              <p className="font-medium text-sky-900">
                Package loaded on your bike
              </p>
              <p className="mt-1 text-sky-700">
                Pick up any remaining orders, then go back to shipments and tap
                <strong> I&apos;m on my way</strong> to notify customers.
              </p>
              <Button variant="outline" className="mt-3 w-full" asChild>
                <Link href="/">Back to shipments</Link>
              </Button>
            </div>
          ) : null}

          {status === "out_for_delivery" ? (
            <>
              <SlideToConfirm
                label="Slide to confirm delivery"
                onConfirm={handleDelivered}
                disabled={loading}
                loading={delivered.isPending}
              />
              <Button
                variant="outline"
                size="lg"
                className="w-full border-red-300 text-red-600 hover:bg-red-50"
                disabled={loading}
                onClick={() => setReturnOpen(true)}
              >
                Could not deliver / Return
              </Button>
            </>
          ) : null}
        </div>
      </div>

      <Dialog open={returnOpen} onOpenChange={setReturnOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Return package</DialogTitle>
            <DialogDescription>
              Tell us what happened. The order goes back to the team for
              follow-up.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label>Reason</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {RETURN_REASONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Note (optional)</Label>
            <Textarea
              id="note"
              placeholder="What happened at this stop?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setReturnOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={handleReturn}
              disabled={failed.isPending}
            >
              {failed.isPending ? "Saving..." : "Confirm return"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
