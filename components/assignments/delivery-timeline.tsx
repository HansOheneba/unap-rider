import type { DeliveryEvent } from "@/types";
import { eventTheme } from "@/lib/status-theme";
import { eventTypeLabel, formatDateTime } from "@/lib/format";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function DeliveryTimeline({ events }: { events: DeliveryEvent[] }) {
  const sorted = [...events].sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
  );

  return (
    <Card className="gap-0 py-0 shadow-sm ring-1 ring-zinc-100">
      <CardTitle className="section-label px-3 pb-0 pt-2.5">Activity</CardTitle>
      <CardContent className="space-y-0 p-3 pt-2">
        {sorted.map((event, i) => {
          const theme = eventTheme[event.type];
          const Icon = theme.icon;

          return (
            <div key={event.id} className="flex gap-2">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-white",
                    theme.dot,
                  )}
                >
                  <Icon className="h-3 w-3" />
                </div>
                {i < sorted.length - 1 ? (
                  <div className="my-0.5 w-px flex-1 bg-zinc-200" />
                ) : null}
              </div>
              <div className="pb-3">
                <p className="text-[length:var(--text-caption)] font-medium">
                  {eventTypeLabel(event.type)}
                </p>
                <small>{formatDateTime(event.at)}</small>
                {event.note ? (
                  <small className="mt-0.5 block text-zinc-500">
                    {event.note}
                  </small>
                ) : null}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
