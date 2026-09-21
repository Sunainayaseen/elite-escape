"use client";

import { type PointerEvent, type ReactNode, useRef } from "react";

import { TILT_MAX_DEG } from "@/lib/motion";
import { useFinePointer, usePrefersReducedMotion } from "@/lib/use-motion-env";
import { cn } from "@/lib/utils";

/**
 * Very subtle cursor tilt with a soft light. Mouse only: touch devices and reduced-motion
 * visitors get a plain wrapper. The card's own link/content stays fully clickable.
 */
export function TiltCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const fine = useFinePointer();
  const reduced = usePrefersReducedMotion();
  const active = fine && !reduced;

  function apply(rx: number, ry: number, gx: number, gy: number) {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--tilt-x", `${rx.toFixed(2)}deg`);
    el.style.setProperty("--tilt-y", `${ry.toFixed(2)}deg`);
    el.style.setProperty("--glow-x", `${gx.toFixed(1)}%`);
    el.style.setProperty("--glow-y", `${gy.toFixed(1)}%`);
  }

  function onMove(e: PointerEvent<HTMLDivElement>) {
    if (!active || e.pointerType !== "mouse") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() =>
      apply((0.5 - py) * TILT_MAX_DEG * 2, (px - 0.5) * TILT_MAX_DEG * 2, px * 100, py * 100),
    );
  }

  function onLeave() {
    cancelAnimationFrame(frame.current);
    apply(0, 0, 50, 50);
  }

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={cn("tilt-card relative", active && "tilt-card-active", className)}
    >
      {children}
      {active && <span aria-hidden className="tilt-glow pointer-events-none absolute inset-0 rounded-[inherit]" />}
    </div>
  );
}
