"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { GlobeSlot } from "@/components/globe/GlobeSlot";
import { Parallax } from "@/components/motion/Parallax";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHeader } from "@/components/motion/SectionHeader";
import { Button } from "@/components/ui/Button";
import type { GlobePoint } from "@/lib/geo";
import { cn } from "@/lib/utils";

/**
 * Destination map: a draggable 3D globe with a pin per package destination, next to the same
 * destinations as a plain list of links (which is what search engines, keyboards and
 * WebGL-less devices use). Hovering a list item turns the globe to that destination.
 */
export function ExploreWorld({ points }: { points: readonly GlobePoint[] }) {
  const [focusId, setFocusId] = useState<string | null>(null);
  const destinations = points.filter((p) => p.kind === "destination");
  if (destinations.length === 0) return null;

  return (
    <section className="relative isolate overflow-hidden bg-[#080f1c] py-20 sm:py-28">
      <Parallax range={50} className="-z-10">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(50% 55% at 75% 50%, rgba(39,179,207,0.16), transparent 70%), radial-gradient(40% 40% at 10% 90%, rgba(42,69,150,0.35), transparent 70%)",
          }}
        />
      </Parallax>

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-2 lg:gap-16">
        <div className="order-2 lg:order-1">
          <SectionHeader
            tone="dark"
            align="left"
            eyebrow="Around the world"
            title="Where will you go next?"
            description="Drag the globe to explore, then select a pin to open that package."
          />

          <ul className="mt-8 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {destinations.map((p, i) => (
              <li key={p.id}>
                <Reveal delay={i * 0.06} y={16}>
                  <Link
                    href={p.href}
                    onMouseEnter={() => setFocusId(p.id)}
                    onMouseLeave={() => setFocusId(null)}
                    onFocus={() => setFocusId(p.id)}
                    onBlur={() => setFocusId(null)}
                    className={cn(
                      "group flex items-center justify-between gap-4 rounded-xl border px-4 py-3 transition-all duration-300",
                      focusId === p.id
                        ? "border-brand-teal-light/50 bg-white/[0.08]"
                        : "border-white/10 bg-white/[0.03] hover:border-white/25",
                    )}
                  >
                    <span>
                      <span className="block font-serif text-base font-semibold text-white">
                        {p.label}
                      </span>
                      {p.sublabel && (
                        <span className="block text-xs text-white/60">{p.sublabel}</span>
                      )}
                    </span>
                    <ArrowUpRight
                      size={16}
                      aria-hidden
                      className="shrink-0 text-brand-teal-light transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>

          <div className="mt-8">
            <Button href="/holidays" arrow className="bg-white text-text-ink hover:bg-bg-navy-light">
              Browse all holidays
            </Button>
          </div>
        </div>

        <div className="order-1 mx-auto w-full max-w-[520px] lg:order-2">
          <GlobeSlot points={points} focusId={focusId} onActiveChange={setFocusId} />
        </div>
      </div>
    </section>
  );
}
