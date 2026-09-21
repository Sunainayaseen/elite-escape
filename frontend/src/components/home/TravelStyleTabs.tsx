"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

import { Reveal } from "@/components/motion/Reveal";
import { IMG } from "@/lib/site-data";
import { cn } from "@/lib/utils";

const STYLES = [
  {
    key: "holidays",
    label: "Guided Holidays",
    image: IMG.europe,
    caption: "Curated itineraries with hotels, transfers and guided tours arranged for you.",
  },
  {
    key: "visa",
    label: "Visa-Assisted Trips",
    image: IMG.cityscape,
    caption: "Plan your holiday and your visa with one team — we guide you through the paperwork.",
  },
  {
    key: "seasonal",
    label: "Seasonal Tours",
    image: IMG.desert,
    caption: "Trips timed around the season, so you travel when a destination is at its best.",
  },
] as const;

type StyleKey = (typeof STYLES)[number]["key"];

export function TravelStyleTabs() {
  const [active, setActive] = useState<StyleKey>("holidays");
  const current = STYLES.find((s) => s.key === active) ?? STYLES[0];

  return (
    <section className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-blue">
          How you&apos;ll travel
        </p>
        <h2 className="mt-3 font-serif text-3xl font-semibold text-text-ink sm:text-4xl">
          Choose your travel style
        </h2>
      </Reveal>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
        {STYLES.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setActive(s.key)}
            className={cn(
              "rounded-full px-5 py-2.5 text-sm font-medium transition-colors duration-200",
              active === s.key
                ? "bg-brand-blue text-white shadow-md shadow-brand-blue/25"
                : "text-text-muted hover:bg-bg-navy-light hover:text-text-ink",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="relative mt-10 h-[420px] overflow-hidden rounded-3xl shadow-xl shadow-brand-blue/10 sm:h-[480px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.key}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <Image
              src={current.image}
              alt={current.label}
              fill
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-8 sm:p-10">
              <h3 className="font-serif text-2xl font-semibold text-white sm:text-3xl">
                {current.label}
              </h3>
              <p className="mt-2 max-w-md text-white/80">{current.caption}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
