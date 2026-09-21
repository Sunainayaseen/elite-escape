"use client";

import { useAnimationFrame } from "framer-motion";
import { type RefObject, useRef } from "react";

// Lucide "plane" glyph, 24x24 viewBox, nose pointing north-east (-45deg).
const PLANE_PATH =
  "M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z";

function FlyingPlane({
  pathRef,
  duration,
  delay = 0,
  color,
  reverse = false,
}: {
  pathRef: RefObject<SVGPathElement | null>;
  duration: number;
  delay?: number;
  color: string;
  reverse?: boolean;
}) {
  const groupRef = useRef<SVGGElement>(null);

  useAnimationFrame((time) => {
    const path = pathRef.current;
    const group = groupRef.current;
    if (!path || !group) return;

    const length = path.getTotalLength();
    const elapsed = time / 1000 - delay;
    if (elapsed <= 0) {
      group.style.opacity = "0";
      return;
    }

    const t = reverse
      ? 1 - (elapsed % duration) / duration
      : (elapsed % duration) / duration;

    const point = path.getPointAtLength(t * length);
    const aheadLength = Math.min(length, Math.max(0, t * length + (reverse ? -1 : 1)));
    const ahead = path.getPointAtLength(aheadLength);
    const angle = (Math.atan2(ahead.y - point.y, ahead.x - point.x) * 180) / Math.PI;

    group.style.opacity = "1";
    group.setAttribute(
      "transform",
      `translate(${point.x} ${point.y}) rotate(${angle + 45})`,
    );
  });

  return (
    <g ref={groupRef} opacity={0}>
      <path
        d={PLANE_PATH}
        transform="translate(-12,-12)"
        fill={color}
        style={{ filter: `drop-shadow(0 2px 6px ${color}66)` }}
      />
    </g>
  );
}

export function FlightRoutes() {
  const pathARef = useRef<SVGPathElement>(null);
  const pathBRef = useRef<SVGPathElement>(null);

  return (
    <div className="relative h-36 w-full overflow-hidden sm:h-48" aria-hidden="true">
      <svg viewBox="0 0 1600 220" preserveAspectRatio="none" className="h-full w-full">
        <path
          ref={pathARef}
          d="M-80 200 Q 400 -60 800 110 T 1680 20"
          fill="none"
          stroke="#1AA8D8"
          strokeWidth="2.5"
          strokeDasharray="2 10"
          strokeLinecap="round"
          opacity="0.85"
        />
        <path
          ref={pathBRef}
          d="M-80 20 Q 400 280 800 110 T 1680 200"
          fill="none"
          stroke="#2A4596"
          strokeWidth="2.5"
          strokeDasharray="2 10"
          strokeLinecap="round"
          opacity="0.75"
        />

        <FlyingPlane pathRef={pathARef} duration={13} color="#1AA8D8" />
        <FlyingPlane pathRef={pathBRef} duration={16} delay={2.5} color="#2890BD" reverse />
      </svg>
    </div>
  );
}
