"use client";

import * as React from "react";
import { format } from "date-fns";
import { useRiderAuth } from "@/lib/hooks/useRiderAuth";
import {
  useAssignments,
  useRunState,
} from "@/lib/hooks/useAssignments";
import { AssignmentCard } from "@/components/assignments/assignment-card";
import { OnMyWayBanner } from "@/components/assignments/on-my-way-banner";
import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

function ShipmentList({
  statuses,
}: {
  statuses: (
    | "assigned"
    | "picked_up"
    | "out_for_delivery"
    | "delivered"
    | "failed"
  )[];
}) {
  const { data, isLoading } = useAssignments(statuses);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-200 bg-white px-4 py-12 text-center">
        <p className="text-zinc-500">No shipments here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.map((a) => (
        <AssignmentCard key={a.id} assignment={a} />
      ))}
    </div>
  );
}

const tabClass =
  "rounded-full px-4 py-2 text-zinc-600 data-[state=active]:bg-[#E8192C] data-[state=active]:text-white data-[state=active]:shadow-md";

export default function TodayPage() {
  const { rider } = useRiderAuth();
  const { data: runState, isLoading: runLoading } = useRunState();
  const [tab, setTab] = React.useState("assigned");

  React.useEffect(() => {
    if (!runState) return;
    if (runState.phase === "delivering") setTab("delivering");
    else if (runState.phase === "ready_to_depart") setTab("assigned");
    else if (runState.phase === "pickup") setTab("assigned");
  }, [runState?.phase]);

  return (
    <div className="min-h-screen bg-zinc-100">
      <PageHeader
        title="My Shipments"
        subtitle={`${rider?.firstName ?? "Rider"} · Accra runs · ${format(new Date(), "EEE, MMM d")}`}
      />

      <div className="space-y-4 px-4 py-4">
        {!runLoading && runState?.canDepart ? (
          <OnMyWayBanner packageCount={runState.pickedUpCount} />
        ) : null}

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="h-auto w-full justify-start gap-2 overflow-x-auto rounded-none bg-transparent p-0">
            <TabsTrigger value="assigned" className={tabClass}>
              Assigned
              {runState && runState.assignedCount + runState.pickedUpCount > 0 ? (
                <small className="ml-1.5 rounded-full bg-white/20 px-1.5 text-inherit">
                  {runState.assignedCount + runState.pickedUpCount}
                </small>
              ) : null}
            </TabsTrigger>
            <TabsTrigger value="delivering" className={tabClass}>
              Delivering
              {runState && runState.deliveringCount > 0 ? (
                <small className="ml-1.5 rounded-full bg-white/20 px-1.5 text-inherit">
                  {runState.deliveringCount}
                </small>
              ) : null}
            </TabsTrigger>
            <TabsTrigger value="completed" className={tabClass}>
              Completed
            </TabsTrigger>
          </TabsList>

          <TabsContent value="assigned" className="mt-4">
            <ShipmentList statuses={["assigned", "picked_up"]} />
          </TabsContent>
          <TabsContent value="delivering" className="mt-4">
            <ShipmentList statuses={["out_for_delivery"]} />
          </TabsContent>
          <TabsContent value="completed" className="mt-4">
            <ShipmentList statuses={["delivered", "failed"]} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
