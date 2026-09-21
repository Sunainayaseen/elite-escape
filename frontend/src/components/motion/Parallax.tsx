"use client";

import { type ReactNode, useEffect, useRef } from "react";

import { PARALLAX } from "@/lib/motion";
import { registerParallax } from "@/lib/scroll-parallax";
import { usePrefersReducedMotion } from "@/lib/use-motion-env";
import { cn } from "@/lib/utils";

/**
 * Scroll parallax layer. Place it inside a `relative overflow-hidden` section: it is drawn
 * `range` px taller than the section on both edges and slides by up to ±range while the section
 * scrolls past, so the edges never show. Disabled (static, centred) under reduced motion.
 */
export function Parallax({
  children,
  range = PARALLAX.media,
  className,
}: {
  children: ReactNode;
  range?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    const section = el?.parentElement;
    if (reduced || !el || !section) return;
    return registerParallax(el, section, range);
  }, [reduced, range]);

  return (
    <div
      ref={ref}
      aria-hidden={undefined}
      style={{ top: -range, bottom: -range }}
      className={cn("absolute inset-x-0 will-change-transform", className)}
    >
      {children}
    </div>
  );
}
