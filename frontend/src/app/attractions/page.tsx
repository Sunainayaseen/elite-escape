import type { Metadata } from "next";

import { AttractionsExplorer } from "@/components/attractions/AttractionsExplorer";
import { AttractionsHero } from "@/components/attractions/AttractionsHero";
import { CTASection } from "@/components/home/CTASection";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "UAE Attractions & Activities",
  description:
    "A guide to the UAE's must-see attractions and activities, from Burj Khalifa and the Museum of the Future to Sheikh Zayed Grand Mosque and desert safaris.",
  path: "/attractions",
});

export default function AttractionsPage() {
  return (
    <>
      <AttractionsHero />
      <AttractionsExplorer />
      <CTASection />
    </>
  );
}
