import type { Metadata } from "next";

import { CONTACT_EMAIL, OFFICES } from "@/lib/site-data";
import { SITE_URL } from "@/lib/site-url";
import type { Package } from "@/lib/types";

export const SITE_NAME = "Elite Escape Tourism";
export const SITE_TITLE = "Elite Escape Tourism | Holiday Packages & Visa Assistance";
export const SITE_DESCRIPTION =
  "Discover curated holiday packages, personalized travel experiences and visa assistance with Elite Escape Tourism. Plan your next journey with our travel experts.";

/** Trim to a search-result-friendly length on a word boundary. */
export function trimDescription(text: string, max = 158): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:–—-]+$/, "")}…`;
}

/**
 * Full per-page metadata: unique title and description, canonical URL, and matching Open Graph and
 * Twitter tags. Pages that only set `title`/`description` would otherwise inherit the site-wide
 * Open Graph title and have no canonical link.
 */
export function pageMetadata({
  title,
  description,
  path,
  image,
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
}): Metadata {
  const fullTitle = `${title} | ${SITE_NAME}`;
  const desc = trimDescription(description);
  return {
    title: fullTitle,
    description: desc,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      url: path,
      siteName: SITE_NAME,
      title: fullTitle,
      description: desc,
      ...(image ? { images: [{ url: image }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: desc,
      ...(image ? { images: [image] } : {}),
    },
  };
}

const abs = (path: string) => (path.startsWith("http") ? path : `${SITE_URL}${path}`);

// Country codes for the two verified offices, keyed by the city shown in OFFICES.
const OFFICE_COUNTRY: Record<string, string> = { Dubai: "AE", Pakistan: "PK" };

/**
 * TravelAgency schema built only from the verified office/contact data on the site.
 * `socialUrls` are the official profiles from site settings (empty entries are dropped).
 */
export function organizationSchema(socialUrls: string[] = []) {
  const sameAs = socialUrls.filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: abs("/logo.svg"),
    email: CONTACT_EMAIL,
    telephone: OFFICES[0].phones[0],
    description: SITE_DESCRIPTION,
    ...(sameAs.length ? { sameAs } : {}),
    address: OFFICES.map((office) => ({
      "@type": "PostalAddress",
      streetAddress: office.address,
      addressCountry: OFFICE_COUNTRY[office.city.split(" ")[0]] ?? undefined,
    })),
    contactPoint: OFFICES.map((office) => ({
      "@type": "ContactPoint",
      contactType: "customer service",
      telephone: office.phones[0],
      email: CONTACT_EMAIL,
    })),
    // Matches the published working hours: Monday to Friday, 9AM - 5PM.
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "17:00",
    },
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: abs(item.path),
    })),
  };
}

/** TouristTrip with the published price range. No ratings or reviews: none are verified. */
export function packageSchema(pkg: Package) {
  return {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: pkg.title,
    description: pkg.summary,
    image: abs(pkg.image),
    url: abs(`/holidays/${pkg.category}/${pkg.slug}`),
    touristType: pkg.tour_types.length ? [...pkg.tour_types] : undefined,
    provider: { "@id": `${SITE_URL}/#organization` },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: pkg.currency,
      lowPrice: pkg.price_from,
      highPrice: pkg.price_to,
      url: abs(`/holidays/${pkg.category}/${pkg.slug}`),
    },
    itinerary: {
      "@type": "ItemList",
      itemListElement: pkg.itinerary.map((d) => ({
        "@type": "ListItem",
        position: d.day,
        name: `Day ${d.day}: ${d.title}`,
        description: d.description || undefined,
      })),
    },
  };
}
