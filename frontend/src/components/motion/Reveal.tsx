"use client";

import { type CSSProperties, type ReactNode, useEffect, useRef } from "react";

import { EASE_CSS, REVEAL_DISTANCE } from "@/lib/motion";
import { observeReveal } from "@/lib/reveal-observer";

// Only the bottom edge is shrunk: horizontal margins would keep side-shifted elements from ever
// counting as "in view".
const DEFAULT_MARGIN = "0px 0px -8% 0px";

/**
 * Scroll-triggered fade + slide (+ optional scale) reveal.
 * Pure CSS animation, started by a shared IntersectionObserver, so there is no hydration flash
 * and content stays visible if JavaScript fails or motion is reduced (see globals.css).
 */
export function Reveal({
  children,
  delay = 0,
  x = 0,
  y = REVEAL_DISTANCE,
  scale = 1,
  margin = DEFAULT_MARGIN,
  className,
}: {
  children: ReactNode;
  delay?: number;
  x?: number;
  y?: number;
  scale?: number;
  margin?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    return el ? observeReveal(el, margin) : undefined;
  }, [margin]);

  const style = {
    "--rx": `${x}px`,
    "--ry": `${y}px`,
    "--rs": scale,
    "--rd": `${delay}s`,
    "--ease": EASE_CSS,
  } as CSSProperties;

  return (
    <div ref={ref} data-reveal style={style} className={className}>
      {children}
    </div>
  );
}
