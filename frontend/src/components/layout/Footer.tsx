"use client";

import { motion } from "framer-motion";
import { ChevronRight, Mail, MapPin, Navigation, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { SVGProps } from "react";

import { Reveal } from "@/components/motion/Reveal";
import { FOOTER_QUICK_LINKS, FOOTER_TOUR_TYPES } from "@/lib/site-data";
import type { SiteSettings } from "@/lib/types";

function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M13.5 21v-7.5h2.5l.5-3H13.5V8.5c0-.87.24-1.46 1.49-1.46H16.5V4.36C16.24 4.32 15.35 4.25 14.31 4.25c-2.16 0-3.64 1.32-3.64 3.75V10.5H8.5v3H10.67V21h2.83Z" />
    </svg>
  );
}

function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="3.8" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function XIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M4 4l7.2 8.6L4.4 20H6.9l5.7-6.2L17 20h3l-7.5-9L19.6 4h-2.5l-5.3 5.8L7.1 4H4Z" />
    </svg>
  );
}

function WhatsAppIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.84.5 3.56 1.38 5.03L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.92C21.96 6.45 17.5 2 12.04 2Zm5.8 14.02c-.24.68-1.42 1.3-1.96 1.38-.5.08-1.13.11-1.83-.12-.42-.13-.96-.31-1.65-.6-2.9-1.25-4.8-4.15-4.94-4.34-.15-.19-1.18-1.57-1.18-3 0-1.42.75-2.12 1.01-2.41.27-.29.58-.36.78-.36.19 0 .39.002.56.01.18.008.42-.07.66.5.24.58.83 2.02.9 2.17.08.15.13.32.03.51-.1.19-.15.31-.3.48-.15.17-.3.38-.44.5-.15.13-.3.28-.13.56.17.29.75 1.24 1.62 2.01 1.12.99 2.05 1.31 2.35 1.46.3.14.47.12.65-.05.18-.17.75-.87.95-1.17.2-.3.4-.24.68-.14.28.1 1.79.85 2.1 1 .31.15.51.23.59.36.08.14.08.78-.16 1.46Z" />
    </svg>
  );
}

export function Footer({ settings, hasBlog = false }: { settings: SiteSettings; hasBlog?: boolean }) {
  const OFFICES = settings.offices;
  const CONTACT_EMAIL = settings.contact_email;
  const WORKING_HOURS = settings.working_hours;
  const SOCIALS = [
    { label: "Instagram", href: settings.instagram_url, icon: InstagramIcon },
    { label: "Facebook", href: settings.facebook_url, icon: FacebookIcon },
    { label: "X (Twitter)", href: settings.x_url, icon: XIcon },
    {
      label: "WhatsApp",
      href: `https://wa.me/${settings.whatsapp_number.replace(/\D/g, "")}?text=Hello`,
      icon: WhatsAppIcon,
    },
  ].filter((s) => s.href);

  return (
    <footer className="relative overflow-hidden bg-[#080f1c] text-white/80">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-teal-light/60 to-transparent" />
      <div
        className="float-el pointer-events-none absolute -left-32 top-0 h-72 w-72 rounded-full opacity-20 blur-3xl"
        style={{ background: "#27B3CF" }}
      />
      <div
        className="float-el pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full opacity-15 blur-3xl"
        style={{ background: "#2A4596" }}
      />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-x-8 gap-y-12 px-6 py-16 sm:grid-cols-2 lg:grid-cols-12">
        <Reveal className="flex flex-col gap-4 lg:col-span-4">
          <Link href="/" aria-label="Elite Escape Tourism — home" className="-ml-1 w-fit">
            <Image
              src="/logo.svg"
              alt="Elite Escape Tourism"
              width={190}
              height={190}
              className="h-24 w-auto sm:h-28"
            />
          </Link>
          <p className="max-w-sm text-sm leading-relaxed text-white/60">
            <span className="font-semibold text-white">Elite Escape Tourism</span> is
            your trusted partner in unforgettable travel experiences. From exotic
            getaways to cultural journeys, we craft personalized tours with comfort,
            safety, and adventure at heart. Let us take you beyond the ordinary —
            where every trip becomes a cherished memory.
          </p>
          <div className="inline-flex w-fit items-center gap-2 text-xs text-white/45">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-teal-light/70" />
            {WORKING_HOURS}
          </div>
          <div className="flex gap-3 pt-2">
            {SOCIALS.map(({ label, href, icon: Icon }) => (
              <motion.a
                key={label}
                href={href}
                aria-label={label}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/50 transition-colors duration-300 hover:border-brand-teal-light/50 hover:text-brand-teal-light"
              >
                <Icon width={16} height={16} />
              </motion.a>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.08} className="lg:col-span-2">
          <h2 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
            Quick Links
            <span className="mt-2 block h-0.5 w-8 rounded-full bg-gradient-to-r from-brand-teal-light to-transparent" />
          </h2>
          <ul className="flex flex-col gap-3.5">
            {[...FOOTER_QUICK_LINKS, ...(hasBlog ? [{ label: "Blog", href: "/blog" }] : [])].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="group inline-flex items-center gap-1.5 text-sm text-white/60 transition-colors duration-200 hover:text-brand-teal-light"
                >
                  <ChevronRight
                    size={14}
                    className="-ml-4 shrink-0 text-brand-teal-light opacity-0 transition-all duration-200 group-hover:-ml-0 group-hover:opacity-100"
                  />
                  <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                    {link.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.16} className="lg:col-span-3">
          <h2 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
            Tour Types
            <span className="mt-2 block h-0.5 w-8 rounded-full bg-gradient-to-r from-brand-teal-light to-transparent" />
          </h2>
          <ul className="flex flex-col gap-3.5">
            {FOOTER_TOUR_TYPES.map(({ label, href, icon: Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="group flex items-center gap-2.5 text-sm text-white/60 transition-colors duration-200 hover:text-white"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/5 text-brand-teal-light transition-all duration-200 group-hover:scale-110 group-hover:bg-brand-teal-light/15">
                    <Icon size={14} />
                  </span>
                  <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                    {label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.24} className="lg:col-span-3">
          <h2 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
            Contact Us
            <span className="mt-2 block h-0.5 w-8 rounded-full bg-gradient-to-r from-brand-teal-light to-transparent" />
          </h2>
          <div className="flex flex-col gap-4">
            {OFFICES.map((office) => (
              <div
                key={office.city}
                className="group -m-2.5 rounded-xl border border-transparent p-2.5 transition-colors duration-300 hover:border-white/10 hover:bg-white/[0.03]"
              >
                <div className="flex items-start gap-2">
                  <MapPin size={14} className="mt-0.5 shrink-0 text-brand-teal-light" />
                  <div>
                    <p className="text-sm font-medium text-brand-teal-light">
                      {office.city}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-white/55">
                      {office.address}
                    </p>
                  </div>
                </div>
                <div className="mt-2 flex flex-col gap-1.5 pl-[22px]">
                  {office.phones.map((phone) => (
                    <a
                      key={phone}
                      href={`tel:${phone.replace(/\s+/g, "")}`}
                      className="flex items-center gap-2 text-xs text-white/70 transition-colors duration-200 hover:text-brand-teal-light"
                    >
                      <Phone size={12} className="text-brand-teal" />
                      {phone}
                    </a>
                  ))}
                  {"note" in office && office.note && (
                    <span className="mt-0.5 inline-flex w-fit items-center gap-1.5 text-[11px] text-white/45">
                      <Navigation size={11} className="text-[#D99A52]" />
                      {office.note}
                    </span>
                  )}
                </div>
              </div>
            ))}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="group flex items-center gap-2 text-xs text-white/70 transition-colors duration-200 hover:text-brand-teal-light"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/5 text-brand-teal transition-colors duration-200 group-hover:bg-brand-teal-light/15">
                <Mail size={12} />
              </span>
              {CONTACT_EMAIL}
            </a>
          </div>
        </Reveal>
      </div>

      <Reveal delay={0.3}>
        <div className="relative border-t border-white/5 px-6 py-6">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-center text-xs text-white/50 sm:flex-row sm:text-left">
            <p>
              © {new Date().getFullYear()}{" "}
              <Link
                href="/"
                className="font-medium text-brand-teal-light transition-colors hover:text-white"
              >
                Elite Escape Tourism
              </Link>
              . All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="/privacy-policy"
                className="link-underline transition-colors hover:text-brand-teal-light"
              >
                Privacy Policy
              </Link>
              <span className="h-3 w-px bg-white/15" />
              <Link
                href="/terms-conditions"
                className="link-underline transition-colors hover:text-brand-teal-light"
              >
                Terms &amp; Conditions
              </Link>
              <span className="h-3 w-px bg-white/15" />
              <Link
                href="/cookie-policy"
                className="link-underline transition-colors hover:text-brand-teal-light"
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </footer>
  );
}
