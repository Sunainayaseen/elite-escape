import { Compass, Headset, MapPin, Route, Users } from "lucide-react";
import Image from "next/image";

import { ImageReveal } from "@/components/motion/ImageReveal";
import { Parallax } from "@/components/motion/Parallax";
import { Reveal } from "@/components/motion/Reveal";
import { SplitText } from "@/components/motion/SplitText";
import { Button } from "@/components/ui/Button";
import type { Office } from "@/lib/types";

// Claims here are limited to what the business actually does; no numbers, response times or awards.
const HIGHLIGHTS = [
  { icon: Compass, title: "Tailor-made journeys", text: "Itineraries shaped around your dates, budget and interests." },
  { icon: Users, title: "Expert assistance", text: "Guidance through every step of planning your trip." },
  { icon: Route, title: "Seamless travel", text: "Hotels, transfers, tours and visas coordinated together." },
  { icon: Headset, title: "Dedicated support", text: "One point of contact, before and during your trip." },
] as const;

export function WhyEliteEscape({ offices }: { offices: readonly Office[] }) {
  return (
    <section className="bg-bg-navy py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-6 lg:grid-cols-2 lg:gap-20">
        <div className="relative">
          <ImageReveal className="rounded-3xl shadow-2xl shadow-brand-blue/15">
            <div className="relative h-[440px] overflow-hidden rounded-3xl sm:h-[580px]">
              <Parallax range={36}>
                <Image
                  src="https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1400&q=80"
                  alt="Snow-capped mountain range under a starry sky"
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              </Parallax>
            </div>
          </ImageReveal>

          {offices.length > 0 && (
            <Reveal
              delay={0.2}
              y={24}
              className="absolute -bottom-8 left-5 right-5 sm:left-auto sm:right-8 sm:w-72"
            >
              <div className="rounded-2xl border border-line/5 bg-white p-5 shadow-xl shadow-brand-blue/15">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-muted">
                  Our offices
                </p>
                <ul className="mt-3 space-y-2.5">
                  {offices.map((office) => (
                    <li key={office.city} className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-bg-navy-light text-brand-blue-strong">
                        <MapPin size={15} aria-hidden />
                      </span>
                      <span className="font-serif text-base font-semibold text-text-ink">
                        {office.city}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          )}
        </div>

        <div className="pt-6 lg:pt-0">
          <Reveal y={12}>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-blue-strong">
              Why Elite Escape
            </p>
          </Reveal>
          <SplitText
            text="One team, from the first idea to the flight home"
            className="mt-3 font-serif text-3xl font-semibold tracking-tight text-text-ink sm:text-4xl"
          />
          <Reveal delay={0.1} y={14}>
            <p className="mt-5 max-w-xl leading-relaxed text-text-muted">
              We turn &ldquo;I wish we could go there&rdquo; into a plan. Every package is a starting
              point that our travel team adjusts to your dates, your budget and the parts of a trip
              you actually care about.
            </p>
          </Reveal>

          <ul className="mt-10 grid grid-cols-1 gap-x-8 gap-y-7 sm:grid-cols-2">
            {HIGHLIGHTS.map(({ icon: Icon, title, text }, i) => (
              <li key={title}>
                <Reveal delay={0.1 + i * 0.07} y={16} className="flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-brand-blue-strong shadow-sm shadow-brand-blue/10">
                    <Icon size={20} aria-hidden />
                  </span>
                  <div>
                    <h3 className="font-serif text-lg font-semibold text-text-ink">{title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-text-muted">{text}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>

          <Reveal delay={0.3} y={12} className="mt-10">
            <Button href="/about" variant="outline" arrow className="bg-white">
              About us
            </Button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
