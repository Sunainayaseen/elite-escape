import type { Metadata } from "next";

import { Categories } from "@/components/home/Categories";
import { CTASection } from "@/components/home/CTASection";
import { ExploreWorld } from "@/components/home/ExploreWorld";
import { FAQ } from "@/components/home/FAQ";
import { Hero } from "@/components/home/Hero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Newsletter } from "@/components/home/Newsletter";
import { PackageShowcase } from "@/components/home/PackageShowcase";
import { Services } from "@/components/home/Services";
import { Testimonials } from "@/components/home/Testimonials";
import { TripPlanner } from "@/components/home/TripPlanner";
import { WhyEliteEscape } from "@/components/home/WhyEliteEscape";
import { API_ENABLED } from "@/lib/api";
import { getCategories, getPackages, getSiteSettings } from "@/lib/data";
import { officesToPoints, packagesToPoints } from "@/lib/geo";

// Title, description and Open Graph tags come from the root layout; only the canonical is page-specific.
export const metadata: Metadata = { alternates: { canonical: "/" } };

export default async function Home() {
  const [categories, packages, settings] = await Promise.all([
    getCategories(),
    getPackages(),
    getSiteSettings(),
  ]);
  const globePoints = [...packagesToPoints(packages), ...officesToPoints(settings.offices)];

  return (
    <>
      <Hero packages={packages} planner={<TripPlanner packages={packages} />} />
      <Categories categories={categories} packages={packages} />
      <PackageShowcase categories={categories} packages={packages} />
      <Services />
      <ExploreWorld points={globePoints} />
      <HowItWorks />
      <WhyEliteEscape offices={settings.offices} />
      <Testimonials />
      <FAQ layout="split" />
      {API_ENABLED && <Newsletter />}
      <CTASection />
    </>
  );
}
