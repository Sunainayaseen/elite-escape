"use client";

import { type CSSProperties, type ReactNode, useEffect, useRef } from "react";

import { useFinePointer, usePrefersReducedMotion } from "@/lib/use-motion-env";
import { cn } from "@/lib/utils";

/**
 * Cursor-parallax scene. It tracks the mouse over itself (mouse pointers only, never touch),
 * eases the value each frame and exposes it as --px / --py (-1..1). <PointerLayer> children
 * translate by that value × their own depth, so the whole effect is CSS transforms and causes
 * no React re-renders.
 */
export function PointerScene({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const fine = useFinePointer();
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    // Listen on the enclosing section, not the direct parent: the parent is often a background
    // wrapper that sits underneath the content and would never receive pointer events.
    const host = el?.closest("section") ?? el?.parentElement;
    if (!el || !host || !fine || reduced) return;

    let targetX = 0;
    let targetY = 0;
    let x = 0;
    let y = 0;
    let frame = 0;

    const tick = () => {
      x += (targetX - x) * 0.08;
      y += (targetY - y) * 0.08;
      el.style.setProperty("--px", x.toFixed(4));
      el.style.setProperty("--py", y.toFixed(4));
      frame = Math.abs(targetX - x) + Math.abs(targetY - y) > 0.001 ? requestAnimationFrame(tick) : 0;
    };
    const kick = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const rect = host.getBoundingClientRect();
      targetX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      targetY = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      kick();
    };
    const onLeave = () => {
      targetX = 0;
      targetY = 0;
      kick();
    };

    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    return () => {
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(frame);
      el.style.removeProperty("--px");
      el.style.removeProperty("--py");
    };
  }, [fine, reduced]);

  return (
    <div ref={ref} className={cn("pointer-scene", className)}>
      {children}
    </div>
  );
}

/** A layer inside a <PointerScene>. `depth` is the travel in px at the scene's edge. */
export function PointerLayer({
  depth,
  children,
  className,
}: {
  depth: number;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      style={{ "--depth": depth } as CSSProperties}
      className={cn("pointer-layer", className)}
    >
      {children}
    </div>
  );
}
