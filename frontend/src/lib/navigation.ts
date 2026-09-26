import { ATTRACTIONS } from "@/lib/site-data";
import type { Package } from "@/lib/types";
import { visaWhatsAppMessage } from "@/lib/whatsapp";

// Mega-menu content supplied by the client. Only names and groupings live here: where each item
// goes is worked out by resolveMenuItem(), so an item links to a real page whenever one exists
// (a package added in the admin later is picked up automatically) and otherwise opens an enquiry,
// never a 404.

export type MenuKind = "holidays" | "visa" | "attractions";

/** The only package fields the menu needs, so the layout sends a few bytes, not whole packages. */
export type MenuPackage = Pick<Package, "slug" | "category" | "country" | "title">;

export function toMenuPackages(packages: readonly Package[]): MenuPackage[] {
  return packages.map(({ slug, category, country, title }) => ({ slug, category, country, title }));
}

export type MenuItem = {
  name: string;
  /** Words matched against package titles/countries. Defaults to the parts of `name`. */
  keywords?: readonly string[];
  /** A fixed on-site destination (e.g. "All E-Visas" goes to the visa page). */
  href?: string;
};

export type MenuCategory = { name: string; items: readonly MenuItem[] };

export type MegaMenu = {
  kind: MenuKind;
  /** Must match the NAV_LINKS href of the bar link that opens this menu. */
  navHref: string;
  title: string;
  description: string;
  allLabel: string;
  categories: readonly MenuCategory[];
};

export const MEGA_MENUS: readonly MegaMenu[] = [
  {
    kind: "holidays",
    navHref: "/holidays",
    title: "Holidays",
    description: "Packages we can tailor to your dates and budget, plus more destinations on request.",
    allLabel: "All holiday packages",
    categories: [
      {
        name: "Budget & Visa-Free",
        items: [{ name: "Georgia" }, { name: "Azerbaijan" }, { name: "Armenia" }, { name: "Sri Lanka" }],
      },
      {
        name: "Trending — Europe",
        items: [
          { name: "Prague, Czechia" },
          { name: "Budapest, Hungary" },
          { name: "Istanbul, Türkiye", keywords: ["istanbul", "türkiye", "turkey"] },
          { name: "Stockholm, Sweden" },
          { name: "Copenhagen, Denmark" },
          { name: "Berlin, Germany" },
          { name: "Amsterdam, Netherlands" },
        ],
      },
      {
        name: "Beach & Islands",
        items: [
          { name: "Maldives" },
          { name: "Seychelles" },
          { name: "Bali, Indonesia" },
          { name: "Phuket/Krabi, Thailand" },
        ],
      },
      {
        name: "Long-Haul Signature",
        items: [
          { name: "Rio de Janeiro & São Paulo, Brazil", keywords: ["rio de janeiro", "são paulo", "brazil"] },
          { name: "Seoul, South Korea" },
          { name: "Sydney, Australia" },
        ],
      },
      {
        name: "Classic Favorites",
        items: [
          { name: "Malaysia (KL/Langkawi)", keywords: ["malaysia", "kuala lumpur", "langkawi"] },
          { name: "Switzerland" },
          { name: "Italy" },
          { name: "UK (London/Edinburgh)", keywords: ["uk", "united kingdom", "london", "edinburgh"] },
        ],
      },
    ],
  },
  {
    kind: "visa",
    navHref: "/global-visa",
    title: "Visa Assistance",
    description: "Guidance from document checklist to submission, with or without a holiday booking.",
    allLabel: "Visa services overview",
    categories: [
      {
        name: "Popular — Featured",
        items: [
          { name: "United Kingdom" },
          { name: "USA" },
          { name: "Canada" },
          { name: "Australia" },
          { name: "New Zealand" },
          { name: "Ireland" },
          { name: "Schengen (Europe)" },
        ],
      },
      {
        name: "Schengen Countries",
        items: [
          { name: "France" },
          { name: "Germany" },
          { name: "Italy" },
          { name: "Spain" },
          { name: "Switzerland" },
          { name: "Netherlands" },
          { name: "Austria" },
          { name: "More Schengen...", href: "/global-visa#destinations" },
        ],
      },
      {
        name: "E-Visa & Sticker Visa",
        items: [
          { name: "Turkey (E-Visa)" },
          { name: "Japan (E-Visa)" },
          { name: "Saudi Arabia (E-Visa)" },
          { name: "China (Sticker)" },
          { name: "Russia (Sticker)" },
          { name: "All E-Visas", href: "/global-visa#destinations" },
        ],
      },
    ],
  },
  {
    kind: "attractions",
    navHref: "/attractions",
    title: "UAE Attractions",
    description: "Tours, tickets and experiences across Dubai, Abu Dhabi and the other Emirates.",
    allLabel: "All UAE attractions",
    categories: [
      {
        name: "Dubai City Tours",
        items: [
          { name: "Dubai City Tour" },
          { name: "Old Dubai & Souk Tour" },
          { name: "Dubai Marina & JBR Cruise" },
          { name: "Dhow Cruise Dinner" },
          { name: "Museum of the Future" },
        ],
      },
      {
        name: "Desert & Theme Parks",
        items: [
          { name: "Evening BBQ Desert Safari" },
          { name: "Hot Air Balloon Ride" },
          { name: "Skydive Dubai" },
          { name: "IMG Worlds of Adventure" },
          { name: "Global Village" },
          { name: "Atlantis Aquaventure" },
        ],
      },
      {
        name: "Abu Dhabi & Other Emirates",
        items: [
          { name: "Abu Dhabi City Tour" },
          { name: "Louvre Abu Dhabi" },
          { name: "Ferrari World" },
          { name: "Jebel Jais Zipline (RAK)" },
          { name: "Yacht Cruise & Water Sports" },
        ],
      },
    ],
  },
];

export type ResolvedItem =
  | { type: "page"; href: string }
  | { type: "enquiry"; message: string; fallbackHref: string };

function keywordsFor(item: MenuItem) {
  return (
    item.keywords ??
    item.name
      .split(/[,/()&]/)
      .map((part) => part.trim())
      .filter(Boolean)
  ).map((k) => k.toLowerCase());
}

// Whole-word match, so "UK" finds "UK Tour Package" but not "Phuket".
function mentions(text: string, keyword: string) {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^\\p{L}])${escaped}($|[^\\p{L}])`, "iu").test(text);
}

function enquiry(message: string, topic: string): ResolvedItem {
  return { type: "enquiry", message, fallbackHref: `/contact?topic=${encodeURIComponent(topic)}` };
}

export function resolveMenuItem(kind: MenuKind, item: MenuItem, packages: readonly MenuPackage[]): ResolvedItem {
  if (item.href) return { type: "page", href: item.href };

  if (kind === "holidays") {
    const keys = keywordsFor(item);
    const pkg = packages.find((p) => keys.some((k) => mentions(`${p.country} ${p.title}`, k)));
    if (pkg) return { type: "page", href: `/holidays/${pkg.category}/${pkg.slug}` };
    return enquiry(
      `Hello Elite Escape Tourism, I'm interested in a holiday to ${item.name}. Please share the options.`,
      `Holiday to ${item.name}`,
    );
  }

  if (kind === "attractions") {
    if (ATTRACTIONS.some((a) => a.name.toLowerCase() === item.name.toLowerCase())) {
      return { type: "page", href: "/attractions" };
    }
    return enquiry(
      `Hello Elite Escape Tourism, I'm interested in the ${item.name}. Please share the details.`,
      item.name,
    );
  }

  // Visa: one overview page, so each country opens its own pre-filled enquiry, like the visa page does.
  return enquiry(visaWhatsAppMessage(item.name), `Visa assistance for ${item.name}`);
}
