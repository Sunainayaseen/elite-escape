"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

import { GlobeFallback } from "@/components/globe/GlobeFallback";
import type { GlobePoint } from "@/lib/geo";

// The globe (and the cobe library it needs) is a separate chunk that is only downloaded once
// the slot is about to scroll into view.
const InteractiveGlobe = dynamic(() => import("@/components/globe/InteractiveGlobe"), {
  ssr: false,
  loading: () => <GlobeFallback />,
});

export function GlobeSlot({
  points,
  focusId,
  onActiveChange,
  decorative,
  className,
}: {
  points: readonly GlobePoint[];
  focusId?: string | null;
  onActiveChange?: (id: string | null) => void;
  decorative?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "400px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {near ? (
        <InteractiveGlobe
          points={points}
          focusId={focusId}
          onActiveChange={onActiveChange}
          decorative={decorative}
          fallback={<GlobeFallback />}
        />
      ) : (
        <GlobeFallback />
      )}
    </div>
  );
}
