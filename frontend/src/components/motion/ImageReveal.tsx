"use client";

import { type ReactNode, useEffect, useRef } from "react";

import { observeReveal } from "@/lib/reveal-observer";
import { cn } from "@/lib/utils";

/** Masked clip-path reveal with a slight scale-down for a hero-quality image entrance. */
export function ImageReveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    return el ? observeReveal(el, "0px 0px -8% 0px") : undefined;
  }, []);

  return (
    <div
      ref={ref}
      data-reveal-img
      style={{ "--rd": `${delay}s` } as React.CSSProperties}
      className={cn("overflow-hidden", className)}
    >
      <div className="reveal-img-inner h-full w-full">{children}</div>
    </div>
  );
}
