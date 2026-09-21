import { Categories } from "@/components/home/Categories";
import { CTASection } from "@/components/home/CTASection";
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
import { FlightRoutes } from "@/components/motion/FlightRoutes";
import { getCategories, getPackages } from "@/lib/data";

export default async function Home() {
  const [categories, packages] = await Promise.all([getCategories(), getPackages()]);

  return (
    <>
      <Hero />
      <TripPlanner packages={packages} />
      <ServiceHighlights />
      <Categories categories={categories} />
      <FlightRoutes />
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
