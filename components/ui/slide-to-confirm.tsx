"use client";

import * as React from "react";
import { ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";

const THUMB = 56;
const THUMB_OFFSET = 4;
const THRESHOLD = 0.85;
const SNAP_EASING = "cubic-bezier(0.22, 1, 0.36, 1)";

type Props = {
  label: string;
  onConfirm: () => void;
  disabled?: boolean;
  loading?: boolean;
};

export function SlideToConfirm({
  label,
  onConfirm,
  disabled,
  loading,
}: Props) {
  const trackRef = React.useRef<HTMLDivElement>(null);
  const thumbRef = React.useRef<HTMLDivElement>(null);
  const fillRef = React.useRef<HTMLDivElement>(null);
  const dragXRef = React.useRef(0);
  const maxRef = React.useRef(0);
  const pointerIdRef = React.useRef<number | null>(null);
  const pointerXRef = React.useRef(0);
  const rafRef = React.useRef<number | null>(null);

  const [labelState, setLabelState] = React.useState<
    "idle" | "dragging" | "confirmed"
  >("idle");

  const measureMax = React.useCallback(() => {
    const w = trackRef.current?.offsetWidth ?? 0;
    maxRef.current = Math.max(0, w - THUMB - THUMB_OFFSET * 2);
  }, []);

  const paint = React.useCallback((x: number, animate: boolean) => {
    dragXRef.current = x;
    const max = maxRef.current;
    const progress = max > 0 ? x / max : 0;

    if (thumbRef.current) {
      thumbRef.current.style.transition = animate
        ? `transform 220ms ${SNAP_EASING}`
        : "none";
      thumbRef.current.style.transform = `translate3d(${x + THUMB_OFFSET}px, 0, 0)`;
    }

    if (fillRef.current) {
      fillRef.current.style.transition = animate
        ? `width 220ms ${SNAP_EASING}`
        : "none";
      fillRef.current.style.width = `${Math.max(progress * 100, 8)}%`;
    }
  }, []);

  const snapBack = React.useCallback(() => {
    pointerIdRef.current = null;
    setLabelState("idle");
    paint(0, true);
  }, [paint]);

  const finishDrag = React.useCallback(() => {
    const max = maxRef.current;
    const x = dragXRef.current;

    if (max > 0 && x / max >= THRESHOLD && !disabled && !loading) {
      setLabelState("confirmed");
      paint(max, true);
      onConfirm();
      return;
    }

    snapBack();
  }, [disabled, loading, onConfirm, paint, snapBack]);

  const syncPointerToPaint = React.useCallback(() => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = Math.min(
      Math.max(
        0,
        pointerXRef.current - rect.left - THUMB / 2 - THUMB_OFFSET,
      ),
      maxRef.current,
    );
    paint(x, false);
  }, [paint]);

  const schedulePaint = React.useCallback(() => {
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      if (pointerIdRef.current === null) return;
      syncPointerToPaint();
    });
  }, [syncPointerToPaint]);

  React.useEffect(() => {
    measureMax();
    const el = trackRef.current;
    if (!el) return;

    const ro = new ResizeObserver(measureMax);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measureMax]);

  React.useEffect(() => {
    if (!loading && labelState === "confirmed") {
      const t = window.setTimeout(() => {
        setLabelState("idle");
        paint(0, true);
      }, 1200);
      return () => window.clearTimeout(t);
    }
  }, [loading, labelState, paint]);

  React.useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || loading || labelState === "confirmed") return;

    e.preventDefault();
    measureMax();
    pointerIdRef.current = e.pointerId;
    pointerXRef.current = e.clientX;
    setLabelState("dragging");
    e.currentTarget.setPointerCapture(e.pointerId);
    syncPointerToPaint();
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== e.pointerId) return;
    pointerXRef.current = e.clientX;
    schedulePaint();
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== e.pointerId) return;

    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    pointerXRef.current = e.clientX;
    syncPointerToPaint();

    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }

    finishDrag();
  };

  const displayLabel =
    loading
      ? "Updating..."
      : labelState === "confirmed"
        ? "Confirmed"
        : label;

  return (
    <div
      ref={trackRef}
      className={cn(
        "relative h-14 w-full touch-none select-none overflow-hidden rounded-2xl bg-zinc-900",
        (disabled || loading) && "pointer-events-none opacity-60",
      )}
    >
      <div
        ref={fillRef}
        className="absolute inset-y-0 left-0 bg-[#E8192C]/30"
        style={{ width: "8%" }}
      />
      <p
        className={cn(
          "pointer-events-none absolute inset-0 flex items-center justify-center text-sm font-semibold text-white transition-opacity duration-150",
          labelState === "dragging" && "opacity-40",
        )}
      >
        {displayLabel}
      </p>
      <div
        ref={thumbRef}
        role="slider"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={
          maxRef.current > 0
            ? Math.round((dragXRef.current / maxRef.current) * 100)
            : 0
        }
        aria-label={label}
        tabIndex={disabled ? -1 : 0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (!disabled && !loading) onConfirm();
          }
        }}
        className={cn(
          "absolute top-1 z-10 flex h-12 w-14 cursor-grab items-center justify-center rounded-xl bg-[#E8192C] text-white shadow-lg will-change-transform active:cursor-grabbing",
        )}
        style={{ transform: `translate3d(${THUMB_OFFSET}px, 0, 0)` }}
      >
        <ChevronsRight className="h-6 w-6" />
      </div>
    </div>
  );
}
