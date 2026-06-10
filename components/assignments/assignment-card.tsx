"use client";

import Link from "next/link";
import { ChevronRight, MapPin } from "lucide-react";
import type { RiderAssignment } from "@/types";
import { getStatusTheme } from "@/lib/status-theme";

type Props = {
  assignment: RiderAssignment;
};

export function AssignmentCard({ assignment }: Props) {
  const theme = getStatusTheme(assignment.status);
  const headline = assignment.address;
  const meta = [assignment.customerName, assignment.district]
    .filter(Boolean)
    .join(" · ");

  return (
    <Link href={`/assignments/${assignment.id}`} className="block">
      <article className="flex items-center gap-3 rounded-xl bg-white px-3 py-2.5 shadow-sm ring-1 ring-zinc-100 transition active:bg-zinc-50/80">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-50">
          <MapPin className="h-3.5 w-3.5 text-zinc-400" strokeWidth={1.75} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="line-clamp-1 font-medium leading-snug text-zinc-800">
            {headline}
          </p>
          <p className="mt-0.5 line-clamp-1 text-[length:var(--text-caption)] text-zinc-400">
            <span>{assignment.trackingNumber}</span>
            <span> · </span>
            <span className={theme.text}>{theme.listLabel}</span>
          </p>
          <p className="mt-0.5 line-clamp-1 text-[0.6875rem] font-normal text-zinc-400">
            {meta}
            {assignment.landmark ? ` · ${assignment.landmark}` : ""}
          </p>
        </div>

        <ChevronRight
          className="h-4 w-4 shrink-0 text-zinc-300"
          strokeWidth={1.75}
          aria-hidden
        />
      </article>
    </Link>
  );
}
