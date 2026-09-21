import { ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import { FloatingElement } from "@/components/motion/FloatingElement";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { Parallax } from "@/components/motion/Parallax";
import { PointerLayer, PointerScene } from "@/components/motion/PointerScene";
import { PARALLAX, POINTER_DEPTH } from "@/lib/motion";

const HEADLINE_LINES = ["Your Journey.", "Your Story.", "Your Escape."];

// Entrance animation is CSS-only (.fade-up / .hero-line in globals.css) so the copy is always visible.
const delay = (seconds: number) => ({ "--d": `${seconds}s` }) as CSSProperties;

export function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative isolate overflow-hidden bg-[#080f1c]"
    >
      {/* Layer 1 — destination photograph: scroll parallax, cursor depth, slow Ken Burns zoom */}
      <Parallax range={PARALLAX.background}>
        <PointerScene>
          <PointerLayer depth={POINTER_DEPTH.background} className="absolute -inset-4">
            <div className="kenburns absolute inset-0">
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
          </PointerLayer>
        </PointerScene>
      </Parallax>

      {/* Layer 2 — atmosphere: readability gradients, a soft light bloom and slow drifting mist */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#080f1c]/80 via-[#080f1c]/55 to-[#080f1c]/85" />
      <div
        aria-hidden
        className="absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(60% 45% at 72% 28%, rgba(39,179,207,0.22), transparent 70%)",
        }}
      />
      <div aria-hidden className="drift pointer-events-none absolute -inset-x-[10%] top-[38%] h-40 opacity-40 blur-2xl"
        style={{
          background:
            "radial-gradient(50% 100% at 30% 50%, rgba(255,255,255,0.35), transparent), radial-gradient(40% 100% at 75% 50%, rgba(255,255,255,0.25), transparent)",
        }}
      />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white to-transparent" />

      {/* Layer 3 — midground travel details: desktop only, kept to the clear right-hand side so the
          headline stays fully readable */}
      <PointerScene className="pointer-events-none hidden lg:block">
        <PointerLayer depth={POINTER_DEPTH.midground} className="absolute inset-0">
          <FloatingElement
            className="absolute right-[4%] top-[20%] w-[24%] max-w-[360px]"
            duration={12}
            distance={8}
          >
            <svg viewBox="0 0 400 300" className="h-auto w-full" fill="none">
              <path
                d="M 10 290 C 90 210, 180 205, 250 140 S 340 55, 372 38"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="1.5"
                strokeDasharray="3 9"
                strokeLinecap="round"
              />
              <g transform="translate(372 38) rotate(-8) scale(1.5) translate(-12 -12)">
                <path
                  className="fill-white/85"
                  d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"
                  transform="rotate(45 12 12)"
                />
              </g>
            </svg>
          </FloatingElement>
        </PointerLayer>

        <PointerLayer depth={POINTER_DEPTH.foreground} className="absolute inset-0">
          <FloatingElement className="absolute bottom-40 right-[7%]" duration={11} distance={8}>
            <svg viewBox="0 0 120 120" className="spin-slow h-28 w-28 text-white/25" fill="none" stroke="currentColor" strokeWidth="1">
              <circle cx="60" cy="60" r="56" />
              <circle cx="60" cy="60" r="44" strokeDasharray="2 6" />
              <path d="M60 8v14M60 98v14M8 60h14M98 60h14" strokeLinecap="round" />
              <path d="M60 30 68 60 60 90 52 60Z" fill="currentColor" fillOpacity="0.25" />
            </svg>
          </FloatingElement>
        </PointerLayer>
      </PointerScene>

      {/* Layer 4 — content */}
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
            <span key={line} className="hero-line">
              <span style={delay(0.15 + i * 0.14)}>{line}</span>
            </span>
          ))}
        </h1>

        <p
          style={delay(0.65)}
          className="fade-up mt-6 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg"
        >
          Discover carefully curated holidays, personalized travel experiences, and seamless
          travel assistance designed around you.
        </p>

        {/* Layer 5 — calls to action */}
        <div
          style={delay(0.8)}
          className="fade-up mt-9 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row"
        >
          <MagneticButton className="w-full sm:w-auto">
            <Link
              href="/holidays"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-text-ink shadow-lg shadow-black/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-bg-navy-light hover:shadow-xl sm:w-auto"
            >
              Explore Destinations
              <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </MagneticButton>
          <MagneticButton className="w-full sm:w-auto">
            <Link
              href="/contact"
              className="inline-flex w-full items-center justify-center rounded-full border border-white/50 px-7 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-white hover:bg-white/10 sm:w-auto"
            >
              Plan My Trip
            </Link>
          </MagneticButton>
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
