import type { CSSProperties, ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Slow decorative bob. CSS only; switched off under reduced motion (see globals.css). */
export function FloatingElement({
  children,
  className,
  duration = 9,
  delay = 0,
  distance = 10,
}: {
  children?: ReactNode;
  className?: string;
  duration?: number;
  delay?: number;
  distance?: number;
}) {
  return (
    <div
      aria-hidden
      style={
        {
          "--float-d": `${duration}s`,
          "--float-delay": `${delay}s`,
          "--float-y": `${distance}px`,
        } as CSSProperties
      }
      className={cn("float-el", className)}
    >
      {children}
    </div>
  );
}
