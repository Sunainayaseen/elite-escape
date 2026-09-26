import type { Metadata } from "next";

import { HolidaysBrowser } from "@/components/holidays/HolidaysBrowser";
import { HolidaysHero } from "@/components/holidays/HolidaysHero";
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
      <HolidaysHero packages={packages} categories={categories} />

      <section id="packages" className="mx-auto max-w-7xl scroll-mt-28 px-6 py-16 sm:py-20">
        <HolidaysBrowser categories={categories} packages={packages} initialQuery={q?.slice(0, 100) ?? ""} />
      </section>
    </>
  );
}
