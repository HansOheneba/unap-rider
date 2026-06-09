"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Bike, LogOut, MapPinned } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { useRiderAuth } from "@/lib/hooks/useRiderAuth";
import { logout, updateRiderStatusMock } from "@/lib/api/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { statusLabel } from "@/lib/format";

export default function ProfilePage() {
  const router = useRouter();
  const { rider } = useRiderAuth();
  const setRider = useAuthStore((s) => s.setRider);
  const logoutStore = useAuthStore((s) => s.logout);
  const [onDuty, setOnDuty] = React.useState(
    rider?.status === "active" || rider?.status === "on_delivery",
  );
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (rider) {
      setOnDuty(rider.status === "active" || rider.status === "on_delivery");
    }
  }, [rider]);

  const handleDutyToggle = async (checked: boolean) => {
    if (!rider) return;
    setSaving(true);
    try {
      const next = checked ? "active" : "off_duty";
      const updated = updateRiderStatusMock(rider.id, next);
      setRider(updated);
      setOnDuty(checked);
      toast.success(checked ? "You are on duty." : "You are off duty.");
    } catch {
      toast.error("Could not update status.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      /* mock */
    }
    logoutStore();
    toast.success("Signed out.");
    router.replace("/login");
  };

  if (!rider) return null;

  return (
    <div className="px-4 py-6">
      <header className="mb-6">
        <p className="eyebrow mb-1">Your account</p>
        <h1>Profile</h1>
      </header>

      <Card className="mb-4">
        <CardContent className="space-y-4 pt-4">
          <div>
            <h3>
              {rider.firstName} {rider.lastName}
            </h3>
            <small>{rider.phone}</small>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="blue">{statusLabel(rider.status)}</Badge>
            <Badge variant="zinc">{statusLabel(rider.vehicleType)}</Badge>
          </div>

          <div className="space-y-3 text-zinc-600">
            <p className="flex items-start gap-2">
              <MapPinned className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
              <span>{rider.zone}</span>
            </p>
            <p className="flex items-center gap-2">
              <Bike className="h-4 w-4 text-zinc-400" />
              <span>{rider.plateNumber}</span>
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardTitle className="px-4 pt-4">Duty status</CardTitle>
        <CardContent className="flex items-center justify-between gap-4">
          <div>
            <Label htmlFor="duty">On duty</Label>
            <small className="mt-1 block">
              Toggle when you start or end your shift.
            </small>
          </div>
          <Switch
            id="duty"
            checked={onDuty}
            onCheckedChange={handleDutyToggle}
            disabled={saving}
          />
        </CardContent>
      </Card>

      <Button variant="outline" className="w-full" onClick={handleLogout}>
        <LogOut className="h-4 w-4" />
        Sign out
      </Button>
    </div>
  );
}
