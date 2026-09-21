import type { Metadata } from "next";

import { HolidaysBrowser } from "@/components/holidays/HolidaysBrowser";
import { getCategories, getPackages } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Holiday Packages",
  description:
    "Browse Elite Escape Tourism holiday packages with day-by-day itineraries, inclusions and per-person prices in AED. Enquire online or on WhatsApp to tailor a trip to your dates.",
  path: "/holidays",
});

export default async function HolidaysPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const [{ q }, categories, packages] = await Promise.all([
    searchParams,
    getCategories(),
    getPackages(),
  ]);

  return (
    <>
      <section className="relative overflow-hidden bg-[#080f1c] pb-16 pt-32 sm:pt-40">
        <div
          className="pointer-events-none absolute -left-32 top-0 h-72 w-72 rounded-full opacity-20 blur-3xl"
          style={{ background: "#27B3CF" }}
        />
        <div
          className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full opacity-15 blur-3xl"
          style={{ background: "#2A4596" }}
        />
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-teal-light">
            Holidays
          </p>
          <h1 className="mt-3 font-serif text-3xl font-semibold text-white sm:text-5xl">
            Holiday packages for every kind of traveler
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-white/65 sm:text-base">
            Hotels, transfers and guided tours — curated into packages you can
            book as-is, or tell us what to change.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
        <HolidaysBrowser categories={categories} packages={packages} initialQuery={q?.slice(0, 100) ?? ""} />
      </section>
    </>
  );
}
