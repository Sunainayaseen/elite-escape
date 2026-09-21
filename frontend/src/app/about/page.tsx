import type { Metadata } from "next";
import { CalendarDays, Compass, MapPin, Phone, Plane, ShieldCheck } from "lucide-react";
import Image from "next/image";

import { CTASection } from "@/components/home/CTASection";
import { PageHero } from "@/components/layout/PageHero";
import { Reveal } from "@/components/motion/Reveal";
import { TiltCard } from "@/components/motion/TiltCard";
import { IMG, OFFICES, TRUST_STATS } from "@/lib/site-data";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "About Us",
  description:
    "Meet Elite Escape Tourism, a travel agency with offices in Dubai and Lahore offering holiday packages, visa assistance, attractions and seasonal tours.",
  path: "/about",
});

const PILLARS = [
  {
    title: "Holidays",
    description: "Curated packages across Asia, Europe and the Caucasus, adjusted to your dates.",
    icon: Plane,
  },
  {
    title: "Global Visa",
    description: "Visa processing alongside your booking, or as a standalone service.",
    icon: ShieldCheck,
  },
  {
    title: "Attractions",
    description: "Guides to the landmarks and experiences worth planning a trip around.",
    icon: Compass,
  },
  {
    title: "Seasonal Tours",
    description: "Trips timed around the season, so you travel when a place is at its best.",
    icon: CalendarDays,
  },
] as const;

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About Us"
        title="Holidays, visas and tours with one team"
        description="Offices in Dubai and Lahore, one point of contact from first enquiry to departure."
      />

      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          <Reveal x={-40} y={0}>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-blue">
              Our story
            </p>
            <h2 className="mt-3 font-serif text-3xl font-semibold text-text-ink sm:text-4xl">
              Travel planning shouldn&apos;t feel like a second job
            </h2>
            <p className="mt-5 leading-relaxed text-text-muted">
              Elite Escape Tourism is a travel agency with offices in Dubai
              and Lahore. We put together holiday packages, guide visa
              applications, and help travelers plan around the season and the
              sights worth seeing.
            </p>
            <p className="mt-4 leading-relaxed text-text-muted">
              Every package on this site is a starting point. Tell us your
              dates, budget and preferences and our team will tailor it with
              you, with one point of contact from the first enquiry to the
              moment you land.
            </p>
          </Reveal>

          <Reveal delay={0.1} x={40} y={0}>
            <div className="relative h-[380px] overflow-hidden rounded-3xl shadow-xl shadow-brand-blue/10 sm:h-[440px]">
              <Image
                src={IMG.cityscape}
                alt="City skyline at golden hour"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.15}>
          <div className="mt-16 grid grid-cols-2 gap-6 rounded-3xl border border-line/10 bg-bg-navy/40 px-6 py-8 sm:grid-cols-4 sm:px-10">
            {TRUST_STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-serif text-2xl font-semibold text-text-ink sm:text-3xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs text-text-muted sm:text-sm">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-blue">
            What we do
          </p>
          <h2 className="mt-3 font-serif text-3xl font-semibold text-text-ink sm:text-4xl">
            Our services
          </h2>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <Reveal key={pillar.title} delay={i * 0.1}>
                <TiltCard className="h-full rounded-2xl">
                  <div className="h-full rounded-2xl border border-line/10 bg-white p-6 shadow-sm shadow-brand-blue/5 transition-shadow duration-300 hover:shadow-lg hover:shadow-brand-blue/10">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-bg-navy-light text-brand-blue">
                      <Icon size={22} />
                    </span>
                    <h3 className="mt-5 font-serif text-lg font-semibold text-text-ink">
                      {pillar.title}
                    </h3>
                    <p className="mt-2 text-sm text-text-muted">
                      {pillar.description}
                    </p>
                  </div>
                </TiltCard>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-blue">
            Where to find us
          </p>
          <h2 className="mt-3 font-serif text-3xl font-semibold text-text-ink sm:text-4xl">
            Our offices
          </h2>
        </Reveal>

        <div className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2">
          {OFFICES.map((office, i) => (
            <Reveal key={office.city} delay={i * 0.1}>
              <div className="h-full rounded-2xl border border-line/10 bg-white p-6 shadow-sm shadow-brand-blue/5">
                <div className="flex items-start gap-2.5">
                  <MapPin size={16} className="mt-0.5 shrink-0 text-brand-blue" />
                  <div>
                    <p className="font-serif text-lg font-semibold text-text-ink">
                      {office.city}
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-text-muted">
                      {office.address}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-col gap-2 pl-[26px]">
                  {office.phones.map((phone) => (
                    <a
                      key={phone}
                      href={`tel:${phone.replace(/\s+/g, "")}`}
                      className="flex items-center gap-2 text-sm text-text-muted transition-colors hover:text-brand-blue"
                    >
                      <Phone size={13} className="text-brand-blue" />
                      {phone}
                    </a>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <CTASection />
    </>
  );
}
