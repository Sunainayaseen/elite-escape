import type { Metadata } from "next";
import {
  ArrowUpRight,
  BadgeCheck,
  Building2,
  CalendarDays,
  Clock3,
  Compass,
  Headset,
  Mail,
  MapPin,
  Navigation,
  Phone,
  Plane,
  Receipt,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { AboutHero } from "@/components/about/AboutHero";
import { CountUp } from "@/components/about/CountUp";
import { ProcessSteps } from "@/components/about/ProcessSteps";
import { CTASection } from "@/components/home/CTASection";
import { WhatsAppLink } from "@/components/layout/WhatsAppLink";
import { ImageReveal } from "@/components/motion/ImageReveal";
import { Parallax } from "@/components/motion/Parallax";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHeader } from "@/components/motion/SectionHeader";
import { SplitText } from "@/components/motion/SplitText";
import { getPackages, getSiteSettings, getVisaCountries } from "@/lib/data";
import { ATTRACTIONS, IMG } from "@/lib/site-data";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "About Us",
  description:
    "Meet Elite Escape Tourism, a travel agency with offices in Dubai and Lahore offering holiday packages, visa assistance, attractions and seasonal tours.",
  path: "/about",
});

// Trust content is limited to how the agency actually works (as stated across the site):
// no invented years in business, traveller counts, awards, ratings or reviews.
const PROMISES = [
  {
    icon: Receipt,
    title: "Clear, upfront pricing",
    text: "Every package shows a per-person price range in AED, with its inclusions and exclusions listed on the package page.",
  },
  {
    icon: SlidersHorizontal,
    title: "Tailored, not templated",
    text: "Each package is a starting point. Dates, hotels and pace are adjusted to what you actually want.",
  },
  {
    icon: ShieldCheck,
    title: "Honest visa guidance",
    text: "We help prepare your documents and application, and we're upfront that the final decision rests with the embassy or consulate.",
  },
  {
    icon: UserRound,
    title: "One point of contact",
    text: "The same team handles your enquiry, itinerary and visa questions, so your plans stay in one place.",
  },
  {
    icon: Building2,
    title: "Real offices you can visit",
    text: "Walk into our offices in Dubai or Lahore. Full addresses are listed below.",
  },
  {
    icon: Headset,
    title: "Easy to reach",
    text: "WhatsApp, phone or email during working hours, with real people on the other end.",
  },
] as const;

const SERVICES = [
  {
    href: "/holidays",
    title: "Holidays",
    text: "Curated packages across Asia, Europe and the Caucasus, adjusted to your dates.",
    icon: Plane,
  },
  {
    href: "/global-visa",
    title: "Visa assistance",
    text: "Visa guidance alongside your booking, or as a standalone service.",
    icon: BadgeCheck,
  },
  {
    href: "/attractions",
    title: "UAE attractions",
    text: "The landmarks and experiences worth planning a UAE trip around.",
    icon: Compass,
  },
  {
    href: "/seasonal-tours",
    title: "Seasonal tours",
    text: "Trips timed so you travel when a destination is at its best.",
    icon: CalendarDays,
  },
] as const;

/** "…Office 16 — Dubai, UAE" → "Dubai, UAE"; "…Gulberg III, Lahore, Pakistan" → "Lahore, Pakistan". */
function cityFromAddress(address: string) {
  const tail = address.split(",").slice(-2).join(",");
  return tail.split("—").pop()!.trim();
}

const mapsUrl = (address: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

export default async function AboutPage() {
  const [settings, packages, visaCountries] = await Promise.all([
    getSiteSettings(),
    getPackages(),
    getVisaCountries(),
  ]);

  const offices = settings.offices;
  const cities = offices.map((o) => cityFromAddress(o.address));
  const hours = settings.working_hours.replace(/^working days:\s*/i, "");

  // Every figure is counted from live data, so it stays true as the catalogue changes.
  const stats = [
    { value: offices.length, label: "Offices", detail: cities.join(" · ") },
    {
      value: new Set(packages.map((p) => p.country)).size,
      label: "Holiday destinations",
      detail: "Across Asia, Europe and the Caucasus",
    },
    { value: visaCountries.length, label: "Visa destinations", detail: "Guidance on documents and forms" },
    { value: ATTRACTIONS.length, label: "UAE attractions", detail: "Experiences to add to your trip" },
  ].filter((s) => s.value > 0);

  const socials = [
    { label: "Instagram", href: settings.instagram_url },
    { label: "Facebook", href: settings.facebook_url },
    { label: "X", href: settings.x_url },
  ].filter((s) => s.href);

  return (
    <>
      <AboutHero cities={cities} />

      {/* Figures: a white card lifted over the hero's bottom edge */}
      {stats.length > 0 && (
        <section aria-label="Elite Escape in numbers" className="relative z-10 -mt-12 px-6 sm:-mt-16">
          <Reveal y={30}>
            <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-px overflow-hidden rounded-3xl border border-line/10 bg-[#E4E9EF] shadow-[0_30px_60px_-30px_rgba(15,27,43,0.35)] lg:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label} className="bg-white px-6 py-7 sm:px-8 sm:py-9">
                  <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
                    {s.label}
                  </dt>
                  <dd className="mt-3 font-serif text-4xl font-medium tracking-tight text-text-ink sm:text-5xl">
                    <CountUp value={s.value} />
                  </dd>
                  <dd className="mt-2 text-sm leading-snug text-text-muted">{s.detail}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </section>
      )}

      {/* Our story */}
      <section className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-6 py-24 sm:py-32 lg:grid-cols-2 lg:gap-20">
        <ImageReveal className="rounded-3xl shadow-2xl shadow-brand-blue/15">
          <div className="relative h-[420px] overflow-hidden rounded-3xl sm:h-[540px]">
            <Parallax range={36}>
              <Image
                src={IMG.europe}
                alt="Whitewashed terrace above a blue sea"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </Parallax>
          </div>
        </ImageReveal>

        <div>
          <Reveal y={12}>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-blue-strong">
              Our story
            </p>
          </Reveal>
          <SplitText
            text="Travel planning shouldn't feel like a second job"
            className="mt-3 font-serif text-3xl font-semibold tracking-tight text-text-ink sm:text-4xl"
          />
          <Reveal delay={0.1} y={16}>
            <p className="mt-6 leading-relaxed text-text-muted">
              Elite Escape Tourism puts together holiday packages, guides visa applications and helps
              travellers plan around the season and the sights worth seeing, from offices in Dubai
              and Lahore.
            </p>
            <p className="mt-4 leading-relaxed text-text-muted">
              Every package on this site is a starting point. Tell us your dates, budget and
              preferences and our team will tailor it with you, with one point of contact from the
              first enquiry to the moment you land.
            </p>
          </Reveal>
          <Reveal delay={0.2} y={16}>
            <figure className="mt-9 border-l-2 border-brand-blue pl-6">
              <blockquote className="font-serif text-xl italic leading-snug text-text-ink sm:text-2xl">
                &ldquo;Let us take you beyond the ordinary, where every trip becomes a cherished
                memory.&rdquo;
              </blockquote>
              <figcaption className="mt-3 text-sm font-semibold text-text-muted">
                Elite Escape Tourism
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </section>

      {/* Trust */}
      <section className="bg-bg-navy py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeader
            eyebrow="Why travel with us"
            title="What you can count on"
            description="The way we work, in plain words."
          />
          <ul className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {PROMISES.map(({ icon: Icon, title, text }, i) => (
              <li key={title}>
                <Reveal delay={(i % 3) * 0.08} y={28} className="h-full">
                  <div className="group h-full rounded-3xl border border-line/8 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-blue/20 hover:shadow-xl hover:shadow-brand-blue/10">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-bg-navy-light text-brand-blue-strong transition-colors duration-300 group-hover:bg-brand-blue-strong group-hover:text-white">
                      <Icon size={22} aria-hidden />
                    </span>
                    <h3 className="mt-6 font-serif text-xl font-semibold tracking-tight text-text-ink">
                      {title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-text-muted">{text}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Process */}
      <section className="mx-auto max-w-7xl px-6 py-24 sm:py-32">
        <SectionHeader
          eyebrow="How we work"
          title="From first message to flight home"
          description="Four simple steps, with the same team throughout."
        />
        <ProcessSteps />
      </section>

      {/* Services */}
      <section className="mx-auto max-w-7xl px-6 pb-24 sm:pb-32">
        <div className="rounded-[2rem] bg-[#081a2c] px-6 py-14 sm:px-12 sm:py-16">
          <SectionHeader tone="dark" eyebrow="What we do" title="Four ways we can help" />
          <ul className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICES.map(({ href, title, text, icon: Icon }, i) => (
              <li key={href}>
                <Reveal delay={i * 0.08} y={24} className="h-full">
                  <Link
                    href={href}
                    className="group flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#8fd8f5]/40 hover:bg-white/[0.08]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-[#8fd8f5]">
                        <Icon size={20} aria-hidden />
                      </span>
                      <ArrowUpRight
                        size={18}
                        aria-hidden
                        className="text-white/40 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white"
                      />
                    </div>
                    <h3 className="mt-6 font-serif text-lg font-semibold text-white">{title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/60">{text}</p>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Offices and contact */}
      <section className="bg-bg-navy py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeader
            eyebrow="Where to find us"
            title="Visit us, call us or message us"
            description="Two offices, one team."
          />

          <div className="mt-14 grid grid-cols-1 gap-5 lg:grid-cols-3">
            {offices.map((office, i) => (
              <Reveal key={office.city} delay={i * 0.1} y={28} className="h-full">
                <div className="flex h-full flex-col rounded-3xl border border-line/8 bg-white p-7 shadow-sm">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-bg-navy-light text-brand-blue-strong">
                    <MapPin size={22} aria-hidden />
                  </span>
                  <h3 className="mt-6 font-serif text-xl font-semibold text-text-ink">{office.city}</h3>
                  <p className="mt-1 text-sm font-medium text-brand-blue-strong">{cities[i]}</p>
                  <address className="mt-4 text-sm not-italic leading-relaxed text-text-muted">
                    {office.address}
                  </address>
                  <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 pt-6 text-sm">
                    {office.phones.map((phone) => (
                      <a
                        key={phone}
                        href={`tel:${phone.replace(/[^\d+]/g, "")}`}
                        className="inline-flex items-center gap-2 font-medium text-text-ink transition-colors hover:text-brand-blue-strong"
                      >
                        <Phone size={14} aria-hidden className="text-brand-blue" />
                        {phone}
                      </a>
                    ))}
                    <a
                      href={mapsUrl(office.address)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 font-medium text-text-ink transition-colors hover:text-brand-blue-strong"
                    >
                      <Navigation size={14} aria-hidden className="text-brand-blue" />
                      Get directions
                      <span className="sr-only"> (opens Google Maps in a new tab)</span>
                    </a>
                  </div>
                </div>
              </Reveal>
            ))}

            <Reveal delay={offices.length * 0.1} y={28} className="h-full">
              <div className="flex h-full flex-col rounded-3xl bg-[#081a2c] p-7 text-white shadow-xl shadow-[#081a2c]/20">
                <p className="font-serif text-xl font-semibold">Prefer to message?</p>
                <p className="mt-2 text-sm leading-relaxed text-white/65">
                  Send us your plans on WhatsApp or by email and our team will get back to you.
                </p>
                <ul className="mt-6 space-y-3 text-sm text-white/80">
                  {settings.contact_email && (
                    <li>
                      <a
                        href={`mailto:${settings.contact_email}`}
                        className="inline-flex items-center gap-2.5 transition-colors hover:text-white"
                      >
                        <Mail size={15} aria-hidden className="text-[#8fd8f5]" />
                        {settings.contact_email}
                      </a>
                    </li>
                  )}
                  {hours && (
                    <li className="flex items-center gap-2.5">
                      <Clock3 size={15} aria-hidden className="text-[#8fd8f5]" />
                      {hours}
                    </li>
                  )}
                </ul>
                <div className="mt-auto pt-7">
                  <WhatsAppLink
                    message="Hello Elite Escape Tourism, I'd like to talk to your team."
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-semibold text-[#062a14] transition-colors hover:bg-[#3be07c]"
                  >
                    Chat on WhatsApp
                  </WhatsAppLink>
                  {socials.length > 0 && (
                    <div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
                      <span className="text-white/50">Follow us:</span>
                      {socials.map((s) => (
                        <a
                          key={s.label}
                          href={s.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-full border border-white/15 px-3 py-1 text-white/75 transition-colors hover:border-white/40 hover:text-white"
                        >
                          {s.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <div className="pt-20 sm:pt-28">
        <CTASection />
      </div>
    </>
  );
}
