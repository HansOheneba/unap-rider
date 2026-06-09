"use client";

import * as React from "react";
import { RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useRiderAuth } from "@/lib/hooks/useRiderAuth";
import { useAssignments, useTodayStats } from "@/lib/hooks/useAssignments";
import { AssignmentCard } from "@/components/assignments/assignment-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

function StatsRow({
  stats,
}: {
  stats: {
    assigned: number;
    pickedUp: number;
    outForDelivery: number;
    delivered: number;
  };
}) {
  const items = [
    { label: "To pick up", value: stats.assigned + stats.pickedUp },
    { label: "Out", value: stats.outForDelivery },
    { label: "Done today", value: stats.delivered },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-zinc-200 bg-white px-3 py-3 text-center"
        >
          <p className="text-2xl font-bold tracking-tight text-zinc-900">
            {item.value}
          </p>
          <p className="text-xs text-zinc-500">{item.label}</p>
        </div>
      ))}
    </div>
  );
}

function AssignmentList({ statuses }: { statuses: ("assigned" | "picked_up" | "out_for_delivery" | "delivered" | "failed")[] }) {
  const { data, isLoading, isFetching } = useAssignments(statuses);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-200 bg-white px-4 py-10 text-center">
        <p className="text-sm text-zinc-500">Nothing here right now.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {isFetching ? (
        <p className="text-xs text-zinc-400">Refreshing...</p>
      ) : null}
      {data.map((a) => (
        <AssignmentCard key={a.id} assignment={a} />
      ))}
    </div>
  );
}

export default function TodayPage() {
  const { rider } = useRiderAuth();
  const { data: stats, isLoading: statsLoading } = useTodayStats();
  const qc = useQueryClient();
  const [refreshing, setRefreshing] = React.useState(false);

  const greeting = React.useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await qc.invalidateQueries({ queryKey: ["rider"] });
    setRefreshing(false);
  };

  return (
    <div className="px-4 py-6">
      <header className="mb-6">
        <p className="eyebrow mb-1">Today&apos;s runs</p>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
              {greeting}, {rider?.firstName}
            </h1>
            <p className="text-sm text-zinc-500">
              {format(new Date(), "EEEE, MMM d")}
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={refreshing}
            aria-label="Refresh"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </header>

      {statsLoading || !stats ? (
        <Skeleton className="mb-6 h-20 w-full" />
      ) : (
        <div className="mb-6">
          <StatsRow stats={stats} />
        </div>
      )}

      <Tabs defaultValue="pickup">
        <TabsList>
          <TabsTrigger value="pickup">To pick up</TabsTrigger>
          <TabsTrigger value="out">Out for delivery</TabsTrigger>
          <TabsTrigger value="done">Done</TabsTrigger>
        </TabsList>

        <TabsContent value="pickup">
          <AssignmentList statuses={["assigned", "picked_up"]} />
        </TabsContent>
        <TabsContent value="out">
          <AssignmentList statuses={["out_for_delivery"]} />
        </TabsContent>
        <TabsContent value="done">
          <AssignmentList statuses={["delivered", "failed"]} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
