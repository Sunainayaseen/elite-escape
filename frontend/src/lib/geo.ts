import type { Package } from "@/lib/types";

export type GlobePoint = {
  id: string;
  label: string;
  sublabel?: string;
  lat: number;
  lng: number;
  href: string;
  kind: "destination" | "office";
};

// Representative coordinates (a well-known city) for the countries a package can be filed under.
// A package whose country is not listed here simply gets no pin; it still appears in the list.
const COUNTRY_COORDS: Record<string, [number, number]> = {
  japan: [35.68, 139.69],
  georgia: [41.72, 44.79],
  armenia: [40.18, 44.51],
  azerbaijan: [40.41, 49.87],
  indonesia: [-8.41, 115.19],
  bali: [-8.41, 115.19],
  russia: [55.75, 37.62],
  "united kingdom": [51.51, -0.13],
  uk: [51.51, -0.13],
  england: [51.51, -0.13],
  france: [48.86, 2.35],
  italy: [41.9, 12.5],
  spain: [40.42, -3.7],
  switzerland: [46.95, 7.45],
  germany: [52.52, 13.4],
  greece: [37.98, 23.73],
  turkey: [41.01, 28.98],
  türkiye: [41.01, 28.98],
  thailand: [13.76, 100.5],
  malaysia: [3.14, 101.69],
  singapore: [1.35, 103.82],
  vietnam: [21.03, 105.85],
  "sri lanka": [6.93, 79.86],
  maldives: [4.18, 73.51],
  china: [39.9, 116.4],
  "south korea": [37.57, 126.98],
  kazakhstan: [51.17, 71.43],
  uzbekistan: [41.3, 69.24],
  egypt: [30.04, 31.24],
  morocco: [33.57, -7.59],
  "united arab emirates": [25.2, 55.27],
  uae: [25.2, 55.27],
  usa: [40.71, -74.0],
  "united states": [40.71, -74.0],
  canada: [43.65, -79.38],
  australia: [-33.87, 151.21],
  "new zealand": [-36.85, 174.76],
  mauritius: [-20.16, 57.5],
  kenya: [-1.29, 36.82],
  "south africa": [-33.92, 18.42],
};

const CITY_COORDS: Record<string, [number, number]> = {
  dubai: [25.2, 55.27],
  lahore: [31.55, 74.34],
};

export const HUB: [number, number] = CITY_COORDS.dubai;

function lookupCountry(country: string): [number, number] | null {
  const key = country.toLowerCase();
  if (COUNTRY_COORDS[key]) return COUNTRY_COORDS[key];
  // "Georgia & Armenia" → first known part.
  for (const part of key.split(/&|,|\band\b|\//).map((p) => p.trim())) {
    if (COUNTRY_COORDS[part]) return COUNTRY_COORDS[part];
  }
  return null;
}

/** One pin per location: a single package links straight to it, several link to their category. */
export function packagesToPoints(packages: readonly Package[]): GlobePoint[] {
  const grouped = new Map<string, { coords: [number, number]; country: string; pkgs: Package[] }>();
  for (const pkg of packages) {
    const coords = lookupCountry(pkg.country);
    if (!coords) continue;
    const key = coords.join(",");
    const entry = grouped.get(key) ?? { coords, country: pkg.country, pkgs: [] };
    entry.pkgs.push(pkg);
    grouped.set(key, entry);
  }

  return [...grouped.values()].map(({ coords, country, pkgs }) => ({
    id: pkgs[0].slug,
    label: country,
    sublabel: pkgs.length === 1 ? pkgs[0].title : `${pkgs.length} packages`,
    lat: coords[0],
    lng: coords[1],
    href:
      pkgs.length === 1
        ? `/holidays/${pkgs[0].category}/${pkgs[0].slug}`
        : `/holidays/${pkgs[0].category}`,
    kind: "destination" as const,
  }));
}

export function officesToPoints(offices: readonly { city: string }[]): GlobePoint[] {
  const points: GlobePoint[] = [];
  for (const office of offices) {
    const coords = CITY_COORDS[office.city.trim().toLowerCase()];
    if (!coords) continue;
    points.push({
      id: `office-${office.city.toLowerCase()}`,
      label: `${office.city} office`,
      sublabel: "Get in touch",
      lat: coords[0],
      lng: coords[1],
      href: "/contact",
      kind: "office",
    });
  }
  return points;
}

/** cobe's camera angles that bring a lat/lng to the centre of the globe. */
export function focusAngles(lat: number, lng: number) {
  return {
    phi: (3 * Math.PI) / 2 - (lng * Math.PI) / 180,
    theta: Math.max(-0.5, Math.min(0.6, (lat * Math.PI) / 180)),
  };
}
