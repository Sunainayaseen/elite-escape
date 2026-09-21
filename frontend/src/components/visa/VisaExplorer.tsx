"use client";

import { ArrowUpRight, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Reveal } from "@/components/motion/Reveal";
import type { VisaCountry } from "@/lib/types";

// Fees and timelines are only shown once the agency has published them.
// Null, 0 and "On enquiry" all mean "not published yet".
function publishedFee(country: VisaCountry) {
  return country.fee && country.fee > 0 ? `From ${country.fee.toLocaleString("en-US")} USD` : null;
}

function publishedTime(country: VisaCountry) {
  const value = country.processing_time?.trim();
  return value && value.toLowerCase() !== "on enquiry" ? value : null;
}

export function VisaExplorer({ countries }: { countries: readonly VisaCountry[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? countries.filter((c) => c.country_name.toLowerCase().includes(q)) : countries;
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
          <Link
            href="/contact?topic=Visa%20assistance"
            className="font-medium text-brand-blue-strong hover:underline"
          >
            tell us where you&apos;re headed
          </Link>
          .
        </p>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((country, i) => {
            const fee = publishedFee(country);
            const time = publishedTime(country);
            return (
              <Reveal key={country.id} y={24} delay={(i % 3) * 0.06} className="h-full">
              <div className="group flex h-full flex-col justify-between rounded-2xl border border-line/10 bg-white p-6 shadow-sm shadow-brand-blue/5 transition-all duration-300 hover:-translate-y-1 hover:border-brand-blue/30 hover:shadow-lg hover:shadow-brand-blue/10">
                <div>
                  <div className="flex items-center gap-3">
                    <span
                      className="inline-block text-2xl transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6"
                      aria-hidden="true"
                    >
                      {country.flag_emoji}
                    </span>
                    <h3 className="font-serif text-lg font-semibold text-text-ink">
                      {country.country_name}
                    </h3>
                  </div>
                  <p className="mt-2 text-sm text-text-muted">{country.visa_type}</p>
                  {country.description && (
                    <p className="mt-2 text-sm leading-relaxed text-text-muted">
                      {country.description}
                    </p>
                  )}
                  <p className="mt-3 text-xs text-text-muted">
                    {fee || time
                      ? [fee, time].filter(Boolean).join(" · ")
                      : "Contact us for fees and timelines"}
                  </p>
                </div>
                <Link
                  href={`/contact?topic=${encodeURIComponent(`Visa assistance for ${country.country_name}`)}`}
                  className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand-blue-strong transition-colors hover:text-brand-navy-accent"
                >
                  Enquire
                  <ArrowUpRight
                    size={14}
                    className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </Link>
              </div>
              </Reveal>
            );
          })}
        </div>
      )}
    </div>
  );
}
