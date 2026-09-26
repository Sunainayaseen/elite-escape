"use client";

import { ArrowUpRight, Clock, Globe2, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { WhatsAppLink } from "@/components/layout/WhatsAppLink";
import { Reveal } from "@/components/motion/Reveal";
import type { VisaCountry } from "@/lib/types";
import { visaWhatsAppMessage } from "@/lib/whatsapp";

// Fees and timelines are only shown once the agency has published them.
// Null, 0 and "On enquiry" all mean "not published yet".
function publishedFee(country: VisaCountry) {
  return country.fee && country.fee > 0
    ? `From ${country.fee.toLocaleString("en-US")} USD`
    : null;
}

function publishedTime(country: VisaCountry) {
  const value = country.processing_time?.trim();
  return value && value.toLowerCase() !== "on enquiry" ? value : null;
}

// Windows has no flag emoji font (it shows "AU", "CA"...), so flags are self-hosted SVGs from
// flag-icons (public/flags, MIT). The ISO code is read back out of the stored emoji's two
// regional-indicator characters, so the admin form keeps working unchanged.
function flagCode(emoji: string | null | undefined) {
  const points = [...(emoji ?? "")].map((ch) => ch.codePointAt(0) ?? 0);
  if (points.length !== 2 || points.some((cp) => cp < 0x1f1e6 || cp > 0x1f1ff))
    return null;
  return points.map((cp) => String.fromCharCode(cp - 0x1f1e6 + 97)).join("");
}

export function VisaExplorer({
  countries,
}: {
  countries: readonly VisaCountry[];
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q
      ? countries.filter((c) => c.country_name.toLowerCase().includes(q))
      : countries;
  }, [countries, query]);

  return (
    <div>
      <div className="relative mx-auto max-w-md">
        <Search
          size={16}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a destination"
          aria-label="Search visa destinations"
          className="w-full rounded-full border border-line/15 bg-white py-3 pl-11 pr-5 text-sm text-text-ink outline-none transition-all duration-300 placeholder:text-text-muted focus:border-brand-blue focus:shadow-lg focus:shadow-brand-blue/10 focus:ring-4 focus:ring-brand-blue/10"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="mt-10 text-center text-sm text-text-muted">
          Don&apos;t see your destination? We can still help —{" "}
          <WhatsAppLink
            message={visaWhatsAppMessage()}
            fallbackHref="/contact?topic=Visa%20assistance"
            className="font-medium text-brand-blue-strong hover:underline"
          >
            tell us where you&apos;re headed
          </WhatsAppLink>
          .
        </p>
      ) : (
        <div className="relative mt-10">
          {/* Soft colour fields behind the grid so the frosted cards have something to blur */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10"
          >
            <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-brand-blue/20 blur-3xl" />
            <div className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-sky-300/25 blur-3xl" />
            <div className="absolute bottom-0 left-1/3 h-72 w-96 rounded-full bg-brand-teal/15 blur-3xl" />
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((country, i) => {
              const fee = publishedFee(country);
              const time = publishedTime(country);
              const code = flagCode(country.flag_emoji);
              return (
                <Reveal
                  key={country.id}
                  y={24}
                  delay={(i % 3) * 0.06}
                  className="h-full"
                >
                  <div className="group relative isolate flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-white/70 bg-white/55 p-6 shadow-[0_8px_32px_-12px_rgba(13,40,80,0.18),inset_0_1px_0_rgba(255,255,255,0.9)] ring-1 ring-brand-blue/10 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1.5 hover:border-brand-teal/40 hover:bg-white/70 hover:shadow-[0_20px_48px_-16px_rgba(40,144,189,0.35),inset_0_1px_0_rgba(255,255,255,1)]">
                    {/* Brand-coloured wash behind the glass, so every card shares the site palette */}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -right-12 -top-12 -z-10 h-44 w-56 rounded-full bg-gradient-to-br from-brand-teal/30 via-brand-blue/20 to-brand-navy-accent/15 blur-2xl transition-all duration-700 group-hover:scale-110 group-hover:from-brand-teal/40 group-hover:via-brand-blue/30"
                    />
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -bottom-16 -left-10 -z-10 h-36 w-44 rounded-full bg-brand-teal-light/10 blur-2xl transition-opacity duration-700 group-hover:bg-brand-teal-light/20"
                    />
                    {/* Neon top edge: a thin cyan tube that fades out at the corners, with a soft glow below */}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-6 top-0 h-[2px] rounded-full bg-gradient-to-r from-transparent via-[#22e4ff] to-transparent shadow-[0_0_8px_1px_rgba(34,228,255,0.7),0_0_20px_4px_rgba(26,168,216,0.35)] opacity-80 transition-all duration-500 group-hover:inset-x-3 group-hover:opacity-100"
                    />
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-10 top-0 -z-10 h-10 bg-gradient-to-b from-[#22e4ff]/20 to-transparent blur-md transition-opacity duration-500 group-hover:from-[#22e4ff]/30"
                    />
                    {/* Diagonal sheen that sweeps across the glass on hover */}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-y-0 -left-full -z-10 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/60 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-[400%]"
                    />
                    <div>
                      <div className="flex items-center gap-4">
                        <span className="relative flex h-11 w-14 shrink-0 overflow-hidden rounded-lg shadow-md shadow-brand-navy-accent/15 ring-1 ring-black/5 transition-transform duration-500 group-hover:-rotate-3 group-hover:scale-105">
                          {code ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={`/flags/${code}.svg`}
                              alt={`Flag of ${country.country_name}`}
                              loading="lazy"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center bg-brand-blue/10 text-brand-blue-strong">
                              <Globe2 size={20} />
                            </span>
                          )}
                          <span
                            aria-hidden="true"
                            className="absolute inset-0 bg-gradient-to-br from-white/35 via-transparent to-black/10"
                          />
                        </span>
                        <div className="min-w-0">
                          <h3 className="truncate font-serif text-xl font-semibold text-text-ink">
                            {country.country_name}
                          </h3>
                          <p className="mt-0.5 text-xs font-medium uppercase tracking-[0.14em] text-brand-blue-strong">
                            {country.visa_type}
                          </p>
                        </div>
                      </div>
                      {country.description && (
                        <p className="mt-4 text-sm leading-relaxed text-text-muted">
                          {country.description}
                        </p>
                      )}
                      <div className="mt-5 flex items-center gap-2 border-t border-brand-navy-accent/10 pt-4 text-xs text-text-muted">
                        <Clock
                          size={13}
                          className="shrink-0 text-brand-blue-strong/70"
                        />
                        {fee || time
                          ? [fee, time].filter(Boolean).join(" · ")
                          : "Contact us for fees and timelines"}
                      </div>
                    </div>
                    <WhatsAppLink
                      message={visaWhatsAppMessage(country.country_name)}
                      fallbackHref={`/contact?topic=${encodeURIComponent(`Visa assistance for ${country.country_name}`)}`}
                      className="mt-5 inline-flex w-fit items-center gap-1.5 rounded-full border border-brand-blue/20 bg-white/60 px-4 py-2 text-sm font-semibold text-brand-blue-strong backdrop-blur transition-all duration-300 hover:border-brand-blue hover:bg-brand-blue hover:text-white hover:shadow-md hover:shadow-brand-blue/25"
                    >
                      Enquire
                      <ArrowUpRight
                        size={14}
                        className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      />
                    </WhatsAppLink>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
