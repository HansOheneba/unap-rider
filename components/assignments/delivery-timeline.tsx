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
    <Card>
      <CardTitle className="px-4 pt-4">Timeline</CardTitle>
      <CardContent className="space-y-0 p-4">
        {sorted.map((event, i) => {
          const theme = eventTheme[event.type];
          const Icon = theme.icon;

          return (
            <div key={event.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full text-white shadow-sm",
                    theme.dot,
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                {i < sorted.length - 1 ? (
                  <div className="my-1 w-0.5 flex-1 bg-zinc-200" />
                ) : null}
              </div>
              <div className="pb-5">
                <p className="font-medium">{eventTypeLabel(event.type)}</p>
                <small>{formatDateTime(event.at)}</small>
                {event.note ? (
                  <p className="mt-1 rounded-lg bg-zinc-50 px-2 py-1 text-zinc-600">
                    {event.note}
                  </p>
                ) : null}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
