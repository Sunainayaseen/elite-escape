import type { CSSProperties, ReactNode } from "react";

import { FloatingElement } from "@/components/motion/FloatingElement";

// CSS-only entrance (.fade-up in globals.css): the copy is visible without JavaScript.
const delay = (seconds: number) => ({ "--d": `${seconds}s` }) as CSSProperties;

export function PageHero({
  eyebrow,
  title,
  description,
  decor,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  /** Optional page-specific background artwork (e.g. the visa passport stamps). */
  decor?: ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-[#080f1c] pb-16 pt-32 sm:pt-40">
      <FloatingElement
        className="pointer-events-none absolute -left-32 top-0 h-72 w-72 rounded-full opacity-20 blur-3xl"
        duration={14}
        distance={16}
      >
        <div className="h-full w-full rounded-full" style={{ background: "#27B3CF" }} />
      </FloatingElement>
      <FloatingElement
        className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full opacity-15 blur-3xl"
        duration={16}
        distance={14}
        delay={2}
      >
        <div className="h-full w-full rounded-full" style={{ background: "#2A4596" }} />
      </FloatingElement>
      {decor}
      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <p
          style={delay(0.05)}
          className="fade-up text-xs font-semibold uppercase tracking-widest text-brand-teal-light"
        >
          {eyebrow}
        </p>
        <h1
          style={delay(0.12)}
          className="fade-up mt-3 font-serif text-3xl font-semibold text-white sm:text-5xl"
        >
          {title}
        </h1>
        {description && (
          <p
            style={delay(0.22)}
            className="fade-up mx-auto mt-4 max-w-xl text-sm text-white/65 sm:text-base"
          >
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
