"use client";

import * as React from "react";
import { Loader2, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

const PULL_THRESHOLD_PX = 72;
const MAX_PULL_PX = 120;

type Props = {
  onRefresh: () => Promise<unknown>;
  children: React.ReactNode;
  className?: string;
};

/**
 * Touch pull-to-refresh for the shipments list. Only arms when the page
 * is scrolled to the top so normal scrolling stays unaffected.
 */
export function PullToRefresh({ onRefresh, children, className }: Props) {
  const startY = React.useRef(0);
  const pulling = React.useRef(false);
  const [offset, setOffset] = React.useState(0);
  const [refreshing, setRefreshing] = React.useState(false);

  const atTop = () =>
    typeof window !== "undefined" && window.scrollY <= 0;

  const onTouchStart = (e: React.TouchEvent) => {
    if (refreshing || !atTop()) {
      pulling.current = false;
      return;
    }
    startY.current = e.touches[0]?.clientY ?? 0;
    pulling.current = true;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!pulling.current || refreshing) return;
    if (!atTop()) {
      pulling.current = false;
      setOffset(0);
      return;
    }

    const currentY = e.touches[0]?.clientY ?? 0;
    const delta = currentY - startY.current;
    if (delta <= 0) {
      setOffset(0);
      return;
    }

    // Resist after threshold so it doesn't feel springy forever.
    const resisted =
      delta < PULL_THRESHOLD_PX
        ? delta
        : PULL_THRESHOLD_PX + (delta - PULL_THRESHOLD_PX) * 0.35;
    setOffset(Math.min(resisted, MAX_PULL_PX));
  };

  const onTouchEnd = () => {
    if (!pulling.current) return;
    pulling.current = false;

    if (offset >= PULL_THRESHOLD_PX && !refreshing) {
      setRefreshing(true);
      setOffset(PULL_THRESHOLD_PX * 0.6);
      void Promise.resolve(onRefresh())
        .catch(() => undefined)
        .finally(() => {
          setRefreshing(false);
          setOffset(0);
        });
      return;
    }

    setOffset(0);
  };

  const armed = offset >= PULL_THRESHOLD_PX;

  return (
    <div
      className={cn("relative", className)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
    >
      <div
        className="pointer-events-none flex items-end justify-center overflow-hidden transition-[height] duration-150 ease-out"
        style={{ height: offset > 0 || refreshing ? offset : 0 }}
        aria-hidden={!refreshing && offset === 0}
      >
        <div
          className={cn(
            "mb-2 flex items-center gap-1.5 text-[length:var(--text-caption)] font-medium text-zinc-500",
            armed && !refreshing && "text-zinc-900",
          )}
        >
          {refreshing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Refreshing…
            </>
          ) : (
            <>
              <ArrowDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  armed && "rotate-180",
                )}
              />
              {armed ? "Release to refresh" : "Pull to refresh"}
            </>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}
