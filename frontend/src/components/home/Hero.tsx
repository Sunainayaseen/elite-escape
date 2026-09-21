import { ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

const HEADLINE_LINES = ["Your Journey.", "Your Story.", "Your Escape."];

// Entrance animation is CSS-only (see .fade-up in globals.css) so the copy is always visible.
const delay = (seconds: number) => ({ "--d": `${seconds}s` }) as CSSProperties;

export function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative isolate overflow-hidden bg-[#080f1c]"
    >
      <Image
        src="https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=2400&q=80"
        alt="Overwater villas in a turquoise lagoon"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#080f1c]/80 via-[#080f1c]/60 to-[#080f1c]/85" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white to-transparent" />

      <div className="relative z-10 mx-auto flex min-h-[640px] max-w-5xl flex-col items-center justify-center px-6 pb-44 pt-32 text-center sm:min-h-[720px] sm:pb-56">
        <p
          style={delay(0.05)}
          className="fade-up text-xs font-semibold uppercase tracking-[0.28em] text-white/90 sm:text-sm"
        >
          Travel Beyond Ordinary
        </p>

        <h1
          id="hero-heading"
          className="mt-5 font-serif text-5xl font-semibold leading-[1.08] text-white sm:text-6xl lg:text-7xl"
        >
          {HEADLINE_LINES.map((line, i) => (
            <span key={line} style={delay(0.15 + i * 0.12)} className="fade-up block">
              {line}
            </span>
          ))}
        </h1>

        <p
          style={delay(0.6)}
          className="fade-up mt-6 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg"
        >
          Discover carefully curated holidays, personalized travel experiences, and seamless
          travel assistance designed around you.
        </p>

        <div
          style={delay(0.75)}
          className="fade-up mt-9 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row"
        >
          <Link
            href="/holidays"
            className="inline-flex w-full items-center justify-center rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-text-ink shadow-lg shadow-black/20 transition-colors duration-300 hover:bg-bg-navy-light sm:w-auto"
          >
            Explore Destinations
          </Link>
          <Link
            href="/contact"
            className="inline-flex w-full items-center justify-center rounded-full border border-white/50 px-7 py-3.5 text-sm font-semibold text-white transition-colors duration-300 hover:border-white hover:bg-white/10 sm:w-auto"
          >
            Plan My Trip
          </Link>
        </div>
      </div>

      <a
        href="#plan-your-trip"
        aria-label="Scroll to the trip planner"
        className="absolute bottom-32 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-1 text-[11px] font-medium uppercase tracking-[0.2em] text-white/70 transition-colors hover:text-white sm:flex"
      >
        Scroll
        <ChevronDown size={18} className="motion-safe:animate-pulse" />
      </a>
    </section>
  );
}
