import { Check } from "lucide-react";
import type { DeliveryEvent } from "@/types";
import { eventTypeLabel, formatDateTime } from "@/lib/format";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

export function DeliveryTimeline({ events }: { events: DeliveryEvent[] }) {
  const sorted = [...events].sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
  );

  return (
    <Card>
      <CardTitle className="px-4 pt-4">Timeline</CardTitle>
      <CardContent className="space-y-0 p-4">
        {sorted.map((event, i) => (
          <div key={event.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-white">
                <Check className="h-4 w-4" />
              </div>
              {i < sorted.length - 1 ? (
                <div className="my-1 w-px flex-1 bg-zinc-200" />
              ) : null}
            </div>
            <div className="pb-5">
              <p className="font-medium text-zinc-900">
                {eventTypeLabel(event.type)}
              </p>
              <p className="text-sm text-zinc-500">
                {formatDateTime(event.at)}
              </p>
              {event.note ? (
                <p className="mt-1 text-sm text-zinc-600">{event.note}</p>
              ) : null}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
