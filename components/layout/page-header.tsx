"use client";

import { Bell } from "lucide-react";

type Props = {
  title: string;
  subtitle?: string;
};

export function PageHeader({ title, subtitle }: Props) {
  return (
    <header className="bg-zinc-900 px-4 pb-5 pt-6 text-white">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {subtitle ? (
            <p className="mt-1 text-sm text-zinc-400">{subtitle}</p>
          ) : null}
        </div>
        <button
          type="button"
          aria-label="Notifications"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10"
        >
          <Bell className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
