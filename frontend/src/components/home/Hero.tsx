import { ArrowRight, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

import { GoogleRatingBadge } from "@/components/home/GoogleRatingBadge";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { Parallax } from "@/components/motion/Parallax";
import { PARALLAX } from "@/lib/motion";
import type { Package } from "@/lib/types";

// Entrance animation is CSS-only (.fade-up / .hero-line in globals.css) so the copy is always visible.
const delay = (seconds: number) => ({ "--d": `${seconds}s` }) as CSSProperties;

export function Hero({ packages, planner }: { packages: readonly Package[]; planner: ReactNode }) {
  const quickLinks = packages.slice(0, 4);

  return (
    // overflow-clip, not overflow-hidden: the parallax layer overhangs the section, and a "hidden"
    // box is still a scroll container, so focusing the planner or jumping to #plan-your-trip
    // would scroll the hero's contents and expose a strip of the photo below it.
    <section aria-labelledby="hero-heading" className="relative isolate overflow-clip bg-[#080f1c]">
      {/* Destination photograph: gentle scroll parallax and a slow Ken Burns zoom */}
      <Parallax range={PARALLAX.background}>
        <div className="kenburns absolute -inset-4">
          <Image
            src="https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=2400&q=80"
            alt="Overwater villas in a turquoise lagoon"
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
            className="object-cover"
          />
        </div>
      </Parallax>

      {/* Readability: darker on the left where the copy sits, and at the bottom behind the planner */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#080f1c]/90 via-[#080f1c]/55 to-[#080f1c]/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#080f1c] via-[#080f1c]/20 to-[#080f1c]/50" />

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-7xl flex-col px-6 pb-10 pt-32 sm:pt-40 lg:max-h-[1000px] lg:min-h-[860px]">
        <div className="flex flex-1 items-center">
          <div className="max-w-2xl">
            <h1
              id="hero-heading"
              className="font-serif text-[clamp(2.75rem,7vw,5.75rem)] font-medium leading-[1.02] tracking-[-0.025em] text-white"
            >
              <span className="hero-line">
                <span style={delay(0.15)}>Travel beyond</span>
              </span>
              <span className="hero-line">
                <span style={delay(0.29)}>
                  the <em className="font-normal text-[#8fd8f5]">ordinary.</em>
                </span>
              </span>
            </h1>

            <p
              style={delay(0.55)}
              className="fade-up mt-6 max-w-lg text-base leading-relaxed text-white/75 sm:text-lg"
            >
              Carefully curated holidays, personalised itineraries and visa guidance, planned by one
              team from your first question to your flight home.
            </p>

            <div
              style={delay(0.7)}
              className="fade-up mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              <MagneticButton className="w-full sm:w-auto">
                <Link
                  href="/holidays"
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-text-ink shadow-lg shadow-black/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl sm:w-auto"
                >
                  Explore holidays
                  <ArrowRight
                    size={16}
                    aria-hidden
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </Link>
              </MagneticButton>
              <Link
                href="/global-visa"
                className="inline-flex w-full items-center justify-center rounded-full border border-white/30 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-white hover:bg-white/10 sm:w-auto"
              >
                Visa assistance
              </Link>
            </div>

            {/* Real Google rating only; renders nothing until one is available */}
            <GoogleRatingBadge className="mt-7" />

            {quickLinks.length > 0 && (
              <div style={delay(0.85)} className="fade-up mt-10 hidden sm:block">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">
                  Popular trips
                </p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {quickLinks.map((p) => (
                    <li key={p.slug}>
                      <Link
                        href={`/holidays/${p.category}/${p.slug}`}
                        className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-sm text-white/85 backdrop-blur-sm transition-colors hover:border-white/40 hover:bg-white/15 hover:text-white"
                      >
                        <MapPin size={13} aria-hidden className="text-[#8fd8f5]" />
                        {p.country}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div style={delay(0.8)} className="fade-up mt-12">
          {planner}
        </div>
      </div>
    </section>
  );
}
