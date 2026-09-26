import { ArrowUpRight, CalendarRange, FileCheck2, Luggage, Ticket } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Reveal } from "@/components/motion/Reveal";
import { SectionHeader } from "@/components/motion/SectionHeader";
import { IMG } from "@/lib/site-data";
import { cn } from "@/lib/utils";

// One card per service the agency actually offers; copy mirrors each section's own page.
const SERVICES = [
  {
    href: "/holidays",
    title: "Holiday packages",
    text: "Curated itineraries across Asia, Europe and the Caucasus, with hotels, transfers and tours arranged for you.",
    icon: Luggage,
    image: IMG.europe,
    wide: true,
  },
  {
    href: "/global-visa",
    title: "Visa assistance",
    text: "Document preparation and application guidance, alongside a holiday or on its own.",
    icon: FileCheck2,
    image: IMG.cityscape,
    wide: false,
  },
  {
    href: "/attractions",
    title: "UAE attractions",
    text: "The experiences worth building a UAE itinerary around.",
    icon: Ticket,
    image: IMG.desert,
    wide: false,
  },
  {
    href: "/seasonal-tours",
    title: "Seasonal tours",
    text: "Trips timed so you travel when a destination is at its best.",
    icon: CalendarRange,
    image: IMG.beach,
    wide: true,
  },
] as const;

export function Services() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24 sm:py-32">
      <SectionHeader
        eyebrow="What we do"
        title="Everything your trip needs"
        description="Plan a holiday, sort the visa and add the experiences, with the same team throughout."
      />

      <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-5">
        {SERVICES.map(({ href, title, text, icon: Icon, image, wide }, i) => (
          <Reveal
            key={href}
            delay={(i % 2) * 0.1}
            y={36}
            scale={0.98}
            className={cn(wide ? "md:col-span-3" : "md:col-span-2")}
          >
            <Link
              href={href}
              className="card-lift group relative flex h-[280px] flex-col justify-end overflow-hidden rounded-3xl bg-[#080f1c] p-7 sm:h-[380px]"
            >
              <Image
                src={image}
                alt=""
                fill
                sizes="(min-width: 768px) 60vw, 100vw"
                className="card-media object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080f1c]/95 via-[#080f1c]/40 to-[#080f1c]/5" />

              <span className="absolute left-7 top-7 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white backdrop-blur-md">
                <Icon size={22} aria-hidden />
              </span>
              <span className="absolute right-7 top-7 flex h-10 w-10 items-center justify-center rounded-full bg-white/0 text-white transition-all duration-300 group-hover:bg-white group-hover:text-text-ink">
                <ArrowUpRight size={18} aria-hidden />
              </span>

              <div className="relative max-w-md">
                <h3 className="font-serif text-2xl font-medium tracking-tight text-white sm:text-3xl">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/75">{text}</p>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
