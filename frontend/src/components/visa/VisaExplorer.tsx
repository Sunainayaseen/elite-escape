"use client";

import { ArrowUpRight, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

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
          className="w-full rounded-full border border-line/15 bg-white py-3 pl-11 pr-5 text-sm text-text-ink outline-none placeholder:text-text-muted focus:border-brand-blue"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="mt-10 text-center text-sm text-text-muted">
          Don&apos;t see your destination? We can still help —{" "}
          <Link
            href="/contact?topic=Visa%20assistance"
            className="font-medium text-brand-blue hover:underline"
          >
            tell us where you&apos;re headed
          </Link>
          .
        </p>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((country) => {
            const fee = publishedFee(country);
            const time = publishedTime(country);
            return (
              <div
                key={country.id}
                className="flex flex-col justify-between rounded-2xl border border-line/10 bg-white p-6 shadow-sm shadow-brand-blue/5 transition-shadow duration-300 hover:shadow-lg hover:shadow-brand-blue/10"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl" aria-hidden="true">
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
                  className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand-blue transition-colors hover:text-brand-teal"
                >
                  Enquire
                  <ArrowUpRight size={14} />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
