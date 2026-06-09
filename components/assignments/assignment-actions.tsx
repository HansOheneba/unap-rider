"use client";

import * as React from "react";
import { toast } from "sonner";
import type { AssignmentStatus } from "@/types";
import { useAssignmentActions } from "@/lib/hooks/useAssignments";
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

const FAILURE_REASONS = [
  { value: "customer_unavailable", label: "Customer unavailable" },
  { value: "wrong_address", label: "Wrong address" },
  { value: "refused", label: "Customer refused" },
  { value: "other", label: "Other" },
];

export function AssignmentActions({ orderId, status }: Props) {
  const { pickedUp, outForDelivery, delivered, failed } =
    useAssignmentActions(orderId);

  const [dialog, setDialog] = React.useState<
    "picked_up" | "out_for_delivery" | "delivered" | "failed" | null
  >(null);
  const [note, setNote] = React.useState("");
  const [reason, setReason] = React.useState("");

  const loading =
    pickedUp.isPending ||
    outForDelivery.isPending ||
    delivered.isPending ||
    failed.isPending;

  const close = () => {
    setDialog(null);
    setNote("");
    setReason("");
  };

  const handleConfirm = async () => {
    try {
      if (dialog === "picked_up") {
        await pickedUp.mutateAsync(note || undefined);
        toast.success("Marked as picked up.");
      } else if (dialog === "out_for_delivery") {
        await outForDelivery.mutateAsync(note || undefined);
        toast.success("Marked out for delivery.");
      } else if (dialog === "delivered") {
        await delivered.mutateAsync(note || undefined);
        toast.success("Delivery complete.");
      } else if (dialog === "failed") {
        if (!reason) {
          toast.error("Select a reason.");
          return;
        }
        await failed.mutateAsync({ reason, note: note || undefined });
        toast.success("Delivery marked as failed.");
      }
      close();
    } catch {
      toast.error("Could not update. Try again.");
    }
  };

  if (status === "delivered" || status === "failed") return null;

  const primary =
    status === "assigned"
      ? { label: "Picked up", action: "picked_up" as const }
      : status === "picked_up"
        ? { label: "Out for delivery", action: "out_for_delivery" as const }
        : { label: "Delivered", action: "delivered" as const };

  return (
    <>
      <div className="fixed inset-x-0 bottom-16 z-40 border-t border-zinc-200 bg-white/95 p-4 backdrop-blur safe-bottom">
        <div className="mx-auto flex max-w-lg flex-col gap-2">
          <Button
            size="lg"
            className="w-full"
            disabled={loading}
            onClick={() => setDialog(primary.action)}
          >
            {primary.label}
          </Button>
          {status === "out_for_delivery" ? (
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              disabled={loading}
              onClick={() => setDialog("failed")}
            >
              Could not deliver
            </Button>
          ) : null}
        </div>
      </div>

      <Dialog open={dialog !== null} onOpenChange={(o) => !o && close()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialog === "picked_up" && "Confirm pickup"}
              {dialog === "out_for_delivery" && "Head out for delivery"}
              {dialog === "delivered" && "Confirm delivery"}
              {dialog === "failed" && "Could not deliver"}
            </DialogTitle>
            <DialogDescription>
              {dialog === "failed"
                ? "Tell us what happened so the team can follow up."
                : "This updates the order for the customer and admin team."}
            </DialogDescription>
          </DialogHeader>

          {dialog === "failed" ? (
            <div className="space-y-2">
              <Label>Reason</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {FAILURE_REASONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="note">Note (optional)</Label>
            <Textarea
              id="note"
              placeholder="Add a note for the team"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={close} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={loading}>
              {loading ? "Saving..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
