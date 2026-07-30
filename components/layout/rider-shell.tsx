"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "@/components/layout/bottom-nav";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { cn } from "@/lib/utils";

/** Detail screen renders its own dock (CTA + tabs). Skip the list-only nav. */
function isAssignmentDetail(pathname: string): boolean {
  return /^\/assignments\/[^/]+$/.test(pathname);
}

export function RiderShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const onAssignmentDetail = isAssignmentDetail(pathname);

  return (
    <>
      <div
        className={cn(
          "mx-auto min-h-screen w-full max-w-lg bg-zinc-100",
          onAssignmentDetail ? "pb-44" : "pb-20",
        )}
      >
        <div className="pt-3">
          <InstallPrompt />
        </div>
        {children}
      </div>
      {onAssignmentDetail ? null : <BottomNav />}
    </>
  );
}
