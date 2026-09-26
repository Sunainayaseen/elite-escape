"use client";

import { MapPin, Navigation } from "lucide-react";
import { useState } from "react";

// The Google Maps embed sets Google's own cookies, and the Cookie Policy says the public pages set
// none, so the map only loads after the visitor asks for it. Until then it is a static card.
export function OfficeMap({ city, address }: { city: string; address: string }) {
  const [show, setShow] = useState(false);
  const query = encodeURIComponent(address);
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${query}`;

  return (
    <div className="overflow-hidden rounded-2xl border border-line/10 bg-white shadow-sm shadow-brand-blue/5">
      <div className="relative aspect-[16/10] bg-[#081a2c]">
        {show ? (
          <iframe
            title={`Map of the ${city}`}
            src={`https://www.google.com/maps?q=${query}&output=embed`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0 h-full w-full border-0"
          />
        ) : (
          <div className="absolute inset-0 isolate flex flex-col items-center justify-center gap-4 px-6 text-center">
            <div
              aria-hidden
              className="absolute inset-0 -z-10 opacity-60 [background-image:radial-gradient(rgba(255,255,255,0.1)_1px,transparent_1px)] [background-size:18px_18px]"
            />
            <div
              aria-hidden
              className="absolute left-1/2 top-1/2 -z-10 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-teal opacity-25 blur-3xl"
            />
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-brand-teal-light ring-1 ring-white/20">
              <MapPin size={22} aria-hidden />
            </span>
            <button
              type="button"
              onClick={() => setShow(true)}
              className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#081a2c] transition-colors hover:bg-brand-teal-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal-light"
            >
              Show map
            </button>
            <p className="text-xs text-white/55">Loads Google Maps, which may set its own cookies.</p>
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 p-5">
        <div className="min-w-0">
          <p className="font-serif text-lg font-semibold text-text-ink">{city}</p>
          <p className="mt-0.5 text-sm text-text-muted">{address}</p>
        </div>
        <a
          href={directions}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line/15 px-4 py-2 text-sm font-semibold text-brand-blue-strong transition-colors hover:border-brand-blue hover:bg-bg-navy-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal-light"
        >
          <Navigation size={14} aria-hidden />
          Get directions
          <span className="sr-only"> to the {city} (opens Google Maps)</span>
        </a>
      </div>
    </div>
  );
}
