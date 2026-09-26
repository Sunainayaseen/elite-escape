import { ArrowRight, MapPin } from "lucide-react";
import Image from "next/image";
import type { CSSProperties } from "react";

import { GoogleRatingBadge } from "@/components/home/GoogleRatingBadge";
import { WhatsAppLink } from "@/components/layout/WhatsAppLink";
import { FloatingElement } from "@/components/motion/FloatingElement";
import { Parallax } from "@/components/motion/Parallax";
import { Button } from "@/components/ui/Button";
import { IMG } from "@/lib/site-data";

// CSS-only entrance (.fade-up in globals.css): the copy is visible without JavaScript.
const delay = (seconds: number) => ({ "--d": `${seconds}s` }) as CSSProperties;

export function AboutHero({ cities }: { cities: readonly string[] }) {
  return (
    <section
      aria-labelledby="about-heading"
      className="relative isolate overflow-clip bg-[#080f1c] pb-20 pt-32 sm:pb-28 sm:pt-40"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(55% 60% at 80% 40%, rgba(39,179,207,0.16), transparent 70%), radial-gradient(45% 50% at 5% 100%, rgba(42,69,150,0.4), transparent 70%)",
        }}
      />

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-12">
        <div>
          <p
            style={delay(0.05)}
            className="fade-up text-xs font-semibold uppercase tracking-[0.24em] text-[#8fd8f5]"
          >
            About Elite Escape
          </p>
          <h1
            id="about-heading"
            className="mt-5 font-serif text-[clamp(2.5rem,4.8vw,4rem)] font-medium leading-[1.04] tracking-[-0.025em] text-white"
          >
            <span className="hero-line">
              <span style={delay(0.12)}>Real people,</span>
            </span>
            <span className="hero-line">
              <span style={delay(0.24)}>
                planning <em className="font-normal text-[#8fd8f5]">real journeys.</em>
              </span>
            </span>
          </h1>
          <p
            style={delay(0.45)}
            className="fade-up mt-6 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg"
          >
            Elite Escape Tourism is a travel agency with offices in Dubai and Lahore. We plan
            holidays, guide visa applications and arrange the experiences in between, with one team
            from your first message to your flight home.
          </p>

          <div
            style={delay(0.6)}
            className="fade-up mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <WhatsAppLink
              message="Hello Elite Escape Tourism, I'd like to talk to your team."
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-text-ink shadow-lg shadow-black/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl sm:w-auto"
            >
              Talk to our team
              <ArrowRight
                size={16}
                aria-hidden
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </WhatsAppLink>
            <Button
              href="/holidays"
              variant="ghost"
              className="w-full border border-white/25 px-7 py-3.5 text-white hover:border-white hover:bg-white/10 hover:text-white sm:w-auto"
            >
              View holidays
            </Button>
          </div>

          <GoogleRatingBadge className="mt-7" />

          {cities.length > 0 && (
            <ul style={delay(0.75)} className="fade-up mt-10 flex flex-wrap gap-2">
              {cities.map((city) => (
                <li
                  key={city}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-sm text-white/80"
                >
                  <MapPin size={13} aria-hidden className="text-[#8fd8f5]" />
                  {city}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Photo collage: each tile drifts at its own pace; the whole group has scroll parallax */}
        <div aria-hidden className="relative mx-auto h-[420px] w-full max-w-[560px] sm:h-[520px]">
          <Parallax range={40}>
            <div
              style={delay(0.3)}
              className="fade-up absolute left-0 top-6 h-[78%] w-[60%] overflow-hidden rounded-[1.75rem] shadow-2xl shadow-black/40 ring-1 ring-white/10"
            >
              <Image
                src={IMG.cityscape}
                alt=""
                fill
                priority
                sizes="(min-width: 1024px) 340px, 60vw"
                className="object-cover"
              />
            </div>

            <FloatingElement className="absolute right-0 top-0 h-[44%] w-[44%]" duration={11} distance={8}>
              <div
                style={delay(0.45)}
                className="fade-up relative h-full w-full overflow-hidden rounded-[1.5rem] shadow-2xl shadow-black/40 ring-1 ring-white/10"
              >
                <Image src="/packages/paris.jpg" alt="" fill sizes="250px" className="object-cover" />
              </div>
            </FloatingElement>

            <FloatingElement
              className="absolute bottom-0 right-[6%] h-[46%] w-[48%]"
              duration={13}
              distance={10}
              delay={1.5}
            >
              <div
                style={delay(0.6)}
                className="fade-up relative h-full w-full overflow-hidden rounded-[1.5rem] shadow-2xl shadow-black/40 ring-1 ring-white/10"
              >
                <Image src={IMG.desert} alt="" fill sizes="270px" className="object-cover" />
              </div>
            </FloatingElement>
          </Parallax>
        </div>
      </div>
    </section>
  );
}
