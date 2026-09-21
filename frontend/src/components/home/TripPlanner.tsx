"use client";

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useId, useState } from "react";

import type { Package } from "@/lib/types";

const TRAVEL_TYPES = ["Family", "Couple", "Solo", "Luxury", "Adventure", "Honeymoon", "Business"];

const FIELD =
  "block w-full min-w-0 rounded-xl border border-line/15 bg-bg-navy px-3.5 py-3 text-sm text-text-ink outline-none transition-colors focus:border-brand-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal-light";

function formatDate(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

// Sends the traveller to the contact form with the details pre-filled. It creates no booking:
// the enquiry is only submitted when they complete the contact form.
export function TripPlanner({ packages }: { packages: Package[] }) {
  const router = useRouter();
  const uid = useId();
  const today = new Date().toISOString().slice(0, 10);

  const [departure, setDeparture] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [error, setError] = useState<string | null>(null);

  const destinations = Array.from(new Set(packages.map((p) => p.country))).sort();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (departure && returnDate && returnDate < departure) {
      setError("Return date must be on or after the departure date.");
      return;
    }
    setError(null);

    const data = new FormData(e.currentTarget);
    const destination = String(data.get("destination") || "");
    const travelers = String(data.get("travelers") || "");
    const type = String(data.get("type") || "");

    const parts = [
      `${type ? `${type} trip` : "Trip"}${destination ? ` to ${destination}` : ""}`,
      departure
        ? returnDate
          ? `${formatDate(departure)} – ${formatDate(returnDate)}`
          : `from ${formatDate(departure)}`
        : "",
      travelers ? `${travelers} ${travelers === "1" ? "traveler" : "travelers"}` : "",
    ].filter(Boolean);

    router.push(`/contact?topic=${encodeURIComponent(parts.join(", "))}`);
  }

  return (
    <section
      id="plan-your-trip"
      aria-labelledby={`${uid}-title`}
      className="relative z-20 -mt-24 scroll-mt-24 px-4 sm:px-6"
    >
      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-6xl rounded-2xl border border-line/10 bg-white p-5 shadow-xl shadow-brand-blue/10 sm:p-7"
      >
        <h2 id={`${uid}-title`} className="font-serif text-xl font-semibold text-text-ink">
          Plan your trip
        </h2>
        <p className="mt-1 text-sm text-text-muted">
          Tell us what you have in mind and our team will take it from there.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_0.7fr_1fr_auto] lg:items-end [&>*]:min-w-0">
          <div>
            <label htmlFor={`${uid}-dest`} className="mb-1.5 block text-xs font-semibold text-text-ink">
              Destination
            </label>
            <select id={`${uid}-dest`} name="destination" defaultValue="" className={FIELD}>
              <option value="">Not sure yet</option>
              {destinations.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor={`${uid}-from`} className="mb-1.5 block text-xs font-semibold text-text-ink">
              Departure
            </label>
            <input
              id={`${uid}-from`}
              type="date"
              min={today}
              value={departure}
              onChange={(e) => setDeparture(e.target.value)}
              className={FIELD}
            />
          </div>

          <div>
            <label htmlFor={`${uid}-to`} className="mb-1.5 block text-xs font-semibold text-text-ink">
              Return
            </label>
            <input
              id={`${uid}-to`}
              type="date"
              min={departure || today}
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              aria-describedby={error ? `${uid}-error` : undefined}
              aria-invalid={error ? true : undefined}
              className={FIELD}
            />
          </div>

          <div>
            <label htmlFor={`${uid}-pax`} className="mb-1.5 block text-xs font-semibold text-text-ink">
              Travelers
            </label>
            <input
              id={`${uid}-pax`}
              name="travelers"
              type="number"
              inputMode="numeric"
              min={1}
              max={50}
              defaultValue={2}
              className={FIELD}
            />
          </div>

          <div>
            <label htmlFor={`${uid}-type`} className="mb-1.5 block text-xs font-semibold text-text-ink">
              Travel type
            </label>
            <select id={`${uid}-type`} name="type" defaultValue="" className={FIELD}>
              <option value="">Any</option>
              {TRAVEL_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-navy-accent px-6 py-3 text-sm font-semibold text-white transition-colors duration-300 hover:bg-brand-blue-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal-light sm:col-span-2 lg:col-span-1"
          >
            Plan My Trip
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>

        {error && (
          <p id={`${uid}-error`} role="alert" className="mt-3 text-sm text-red-600">
            {error}
          </p>
        )}
      </form>
    </section>
  );
}
