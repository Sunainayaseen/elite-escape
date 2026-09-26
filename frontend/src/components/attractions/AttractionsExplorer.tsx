"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, MapPin, MessageCircle } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { WhatsAppLink } from "@/components/layout/WhatsAppLink";
import { EASE } from "@/lib/motion";
import { ATTRACTIONS, type Attraction } from "@/lib/site-data";
import { cn } from "@/lib/utils";
import { attractionWhatsAppMessage } from "@/lib/whatsapp";

const FILTERS = ["All", ...new Set(ATTRACTIONS.map((a) => a.city))] as const;
type Filter = (typeof FILTERS)[number];

/**
 * Bento placement for however many cards the filter leaves: the first card is featured (2×2 on
 * desktop), the rest fill rows of three, and a leftover row is stretched so no card sits alone.
 */
function spanClasses(i: number, n: number) {
  // Two-column tablet grid: the featured card and an odd one out take the full width.
  const sm = i === 0 || ((n - 1) % 2 === 1 && i === n - 1) ? "sm:col-span-2" : "sm:col-span-1";
  // Every card sets its desktop span explicitly, so a tablet span never leaks into the lg grid.
  return cn(sm, lgSpan(i, n));
}

function lgSpan(i: number, n: number) {
  if (n === 1) return "lg:col-span-3";
  if (n === 2) return i === 0 ? "lg:col-span-2" : "lg:col-span-1";
  if (i === 0) return "lg:col-span-2 lg:row-span-2";
  if (i < 3) return "lg:col-span-1";
  const rest = n - 3;
  const full = rest - (rest % 3);
  const j = i - 3;
  if (j < full) return "lg:col-span-1";
  if (rest % 3 === 1) return "lg:col-span-3";
  return j === full ? "lg:col-span-2" : "lg:col-span-1";
}

function AttractionCard({
  attraction,
  featured,
  priority,
}: {
  attraction: Attraction;
  featured: boolean;
  priority: boolean;
}) {
  return (
    <article className="group relative isolate flex h-full flex-col justify-end overflow-hidden rounded-3xl bg-[#081a2c] shadow-[0_18px_40px_-24px_rgba(8,26,44,0.55)] ring-1 ring-black/5">
      <Image
        src={attraction.image}
        alt={attraction.name}
        fill
        priority={priority}
        sizes={featured ? "(min-width: 1024px) 66vw, 100vw" : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"}
        className="-z-20 object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.06]"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-t from-[#081a2c]/95 via-[#081a2c]/45 to-[#081a2c]/5"
      />

      <div className="absolute inset-x-5 top-5 flex items-start justify-between gap-3">
        <span className="rounded-full border border-white/15 bg-[#081a2c]/55 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-md">
          {attraction.kind}
        </span>
        <span className="flex items-center gap-1.5 rounded-full border border-white/15 bg-[#081a2c]/55 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-md">
          <MapPin size={12} aria-hidden className="text-[#8fd8f5]" />
          {attraction.city}
        </span>
      </div>

      <div className={cn("p-6", featured && "sm:p-8")}>
        <h3
          className={cn(
            "font-serif font-medium leading-tight tracking-tight text-white",
            featured ? "text-2xl sm:text-[2rem]" : "text-xl",
          )}
        >
          {attraction.name}
        </h3>
        <p
          className={cn(
            "mt-2 max-w-xl text-sm leading-relaxed text-white/75",
            !featured && "line-clamp-2",
          )}
        >
          {attraction.description}
        </p>

        {/* Always shown on touch screens; on desktop it slides in on hover or keyboard focus */}
        <div className="mt-5 transition-all duration-300 ease-out lg:translate-y-2 lg:opacity-0 lg:group-focus-within:translate-y-0 lg:group-focus-within:opacity-100 lg:group-hover:translate-y-0 lg:group-hover:opacity-100">
          <WhatsAppLink
            message={attractionWhatsAppMessage(attraction.name)}
            fallbackHref={`/contact?topic=${encodeURIComponent(attraction.name)}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#080f1c] transition-colors hover:bg-[#8fd8f5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Ask about this
            <span className="sr-only"> — {attraction.name}</span>
            <ArrowUpRight size={14} aria-hidden />
          </WhatsAppLink>
        </div>
      </div>
    </article>
  );
}

export function AttractionsExplorer() {
  const [filter, setFilter] = useState<Filter>("All");
  const shown = filter === "All" ? ATTRACTIONS : ATTRACTIONS.filter((a) => a.city === filter);

  return (
    <section id="attractions" className="scroll-mt-28 mx-auto max-w-7xl px-6 py-20 sm:py-24">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-blue-strong">
            Explore
          </p>
          <h2 className="mt-3 font-serif text-3xl font-medium tracking-tight text-text-ink sm:text-4xl">
            Worth building a trip around
          </h2>
        </div>

        <div
          role="group"
          aria-label="Filter attractions by city"
          className="inline-flex self-start rounded-full border border-line/10 bg-white p-1 shadow-sm sm:self-auto"
        >
          {FILTERS.map((f) => {
            const count =
              f === "All" ? ATTRACTIONS.length : ATTRACTIONS.filter((a) => a.city === f).length;
            const active = f === filter;
            return (
              <button
                key={f}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(f)}
                className={cn(
                  "relative isolate rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200",
                  active ? "text-white" : "text-text-muted hover:text-text-ink",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="attraction-filter"
                    transition={{ duration: 0.35, ease: EASE }}
                    className="absolute inset-0 -z-10 rounded-full bg-[#081a2c]"
                  />
                )}
                {f}
                <span className={cn("ml-1.5 text-xs", active ? "text-white/60" : "text-text-muted/70")}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <motion.ul
        layout
        className="mt-10 grid auto-rows-[21rem] grid-cols-1 gap-5 sm:grid-cols-2 sm:auto-rows-[19rem] lg:grid-cols-3 lg:auto-rows-[18rem]"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {shown.map((attraction, i) => (
            <motion.li
              key={attraction.name}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.45, ease: EASE }}
              className={spanClasses(i, shown.length)}
            >
              <AttractionCard attraction={attraction} featured={i === 0} priority={i < 3} />
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>

      {/* Planning nudge: turns browsing into an enquiry without promising prices or tickets */}
      <div className="mt-12 flex flex-col items-start gap-5 rounded-3xl border border-line/10 bg-bg-navy-light px-6 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="flex items-start gap-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white text-brand-blue-strong shadow-sm">
            <MessageCircle size={20} aria-hidden />
          </span>
          <div>
            <p className="font-serif text-lg font-semibold text-text-ink">
              Not sure what fits your dates?
            </p>
            <p className="mt-1 text-sm leading-relaxed text-text-muted">
              Tell us how many days you have and what you enjoy, and we&apos;ll suggest what to see.
            </p>
          </div>
        </div>
        <WhatsAppLink
          message={attractionWhatsAppMessage()}
          fallbackHref="/contact?topic=UAE%20attractions"
          variant="primary"
          className="shrink-0"
        >
          Get suggestions
        </WhatsAppLink>
      </div>
    </section>
  );
}
