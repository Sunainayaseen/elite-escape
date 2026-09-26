import { ArrowDown, Landmark, MapPin, Sparkles } from "lucide-react";
import Image from "next/image";
import type { CSSProperties } from "react";

import { WhatsAppLink } from "@/components/layout/WhatsAppLink";
import { Parallax } from "@/components/motion/Parallax";
import { buttonClasses } from "@/components/ui/Button";
import { ATTRACTIONS } from "@/lib/site-data";
import { attractionWhatsAppMessage } from "@/lib/whatsapp";

// CSS-only entrance (.fade-up in globals.css): the copy is visible without JavaScript.
const delay = (seconds: number) => ({ "--d": `${seconds}s` }) as CSSProperties;

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1550779864-6ccb28702fdb?auto=format&fit=crop&w=2000&q=80";

// Every figure is counted from the attraction list itself, so it can never drift from the grid.
const cities = [...new Set(ATTRACTIONS.map((a) => a.city))];
const FACTS = [
  { icon: Sparkles, label: `${ATTRACTIONS.length} hand-picked experiences` },
  { icon: MapPin, label: cities.join(" & ") },
  { icon: Landmark, label: "Landmarks, culture & desert" },
] as const;

export function AttractionsHero() {
  return (
    <section className="relative isolate flex min-h-[640px] items-end overflow-hidden bg-[#081a2c] pb-16 pt-36 sm:min-h-[700px] sm:pb-20 lg:min-h-[min(82vh,780px)]">
      {/* Dubai skyline at dusk; the navy washes keep the header and copy readable over it */}
      <Parallax range={40} className="-z-20">
        <Image
          src={HERO_IMAGE}
          alt=""
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          className="object-cover object-[50%_70%]"
        />
      </Parallax>
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-t from-[#081a2c] via-[#081a2c]/30 to-[#081a2c]/45"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-r from-[#081a2c]/70 via-[#081a2c]/15 to-transparent"
      />

      <div className="mx-auto w-full max-w-7xl px-6">
        <div className="max-w-2xl">
          <p
            style={delay(0.05)}
            className="fade-up inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8fd8f5] backdrop-blur-sm"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#8fd8f5]" />
            UAE attractions
          </p>
          <h1
            style={delay(0.12)}
            className="fade-up mt-5 font-serif text-[clamp(2.4rem,5.6vw,4.25rem)] font-medium leading-[1.04] tracking-[-0.02em] text-white"
          >
            The UAE&apos;s <em className="font-normal text-[#8fd8f5]">must-see</em> attractions &amp;
            activities
          </h1>
          <p
            style={delay(0.22)}
            className="fade-up mt-5 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg"
          >
            Whether it&apos;s your first trip to the UAE or your fifth, these are the experiences
            worth building your itinerary around.
          </p>

          <div
            style={delay(0.32)}
            className="fade-up mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <a
              href="#attractions"
              className={buttonClasses(
                "primary",
                "bg-white px-7 py-3.5 text-[#080f1c] shadow-lg shadow-black/25 hover:bg-white hover:text-[#080f1c]",
              )}
            >
              Explore attractions
              <ArrowDown
                size={16}
                aria-hidden
                className="transition-transform duration-300 group-hover:translate-y-0.5"
              />
            </a>
            <WhatsAppLink
              message={attractionWhatsAppMessage()}
              fallbackHref="/contact?topic=UAE%20attractions"
              variant="ghost"
              className="border border-white/25 bg-white/5 px-7 py-3.5 text-white backdrop-blur-sm hover:border-white/50 hover:bg-white/10 hover:text-white"
            >
              Plan it with us
            </WhatsAppLink>
          </div>
        </div>

        <ul
          style={delay(0.42)}
          className="fade-up mt-14 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/15 pt-6 text-sm text-white/70"
        >
          {FACTS.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-2">
              <Icon size={15} aria-hidden className="text-[#8fd8f5]" />
              {label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
