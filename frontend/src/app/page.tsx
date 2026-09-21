import type { Metadata } from "next";

import { Categories } from "@/components/home/Categories";
import { CTASection } from "@/components/home/CTASection";
import { ExploreWorld } from "@/components/home/ExploreWorld";
import { FAQ } from "@/components/home/FAQ";
import { Hero } from "@/components/home/Hero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { LuxuryPackages } from "@/components/home/LuxuryPackages";
import { Newsletter } from "@/components/home/Newsletter";
import { ServiceHighlights } from "@/components/home/ServiceHighlights";
import { Testimonials } from "@/components/home/Testimonials";
import { TopExperiences } from "@/components/home/TopExperiences";
import { TravelStyleTabs } from "@/components/home/TravelStyleTabs";
import { TripPlanner } from "@/components/home/TripPlanner";
import { WhyEliteEscape } from "@/components/home/WhyEliteEscape";
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
      <Hero />
      <TripPlanner packages={packages} />
      <ServiceHighlights />
      <Categories categories={categories} />
      <ExploreWorld points={globePoints} />
      <TopExperiences categories={categories} packages={packages} />
      <LuxuryPackages packages={packages} />
      <HowItWorks />
      <TravelStyleTabs />
      <WhyEliteEscape />
      <Testimonials />
      <Newsletter />
      <FAQ />
      <CTASection />
    </>
  );
}
