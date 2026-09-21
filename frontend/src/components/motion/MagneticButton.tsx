"use client";

import { type PointerEvent, type ReactNode, useRef } from "react";

import { MAGNET_MAX_PX } from "@/lib/motion";
import { useFinePointer, usePrefersReducedMotion } from "@/lib/use-motion-env";
import { cn } from "@/lib/utils";

/** Nudges its child a few px toward the cursor. Mouse only; a plain wrapper otherwise. */
export function MagneticButton({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const fine = useFinePointer();
  const reduced = usePrefersReducedMotion();
  const active = fine && !reduced;

  function onMove(e: PointerEvent<HTMLSpanElement>) {
    const el = ref.current;
    if (!active || !el || e.pointerType !== "mouse") return;
    const rect = el.getBoundingClientRect();
    const dx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const dy = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    el.style.transform = `translate3d(${(dx * MAGNET_MAX_PX).toFixed(1)}px, ${(dy * MAGNET_MAX_PX).toFixed(1)}px, 0)`;
  }

  function onLeave() {
    if (ref.current) ref.current.style.transform = "";
  }

  return (
    <span
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={cn("inline-flex transition-transform duration-300 ease-out", className)}
    >
      {children}
    </span>
  );
}
