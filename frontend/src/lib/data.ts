import { apiGet } from "@/lib/api";
import {
  CONTACT_EMAIL,
  HOLIDAY_CATEGORIES,
  OFFICES,
  PACKAGES,
  WORKING_HOURS,
} from "@/lib/site-data";
import type {
  BlogPost,
  Category,
  Package,
  SiteSettings,
  VisaCountry,
} from "@/lib/types";

// Public pages read from the API. If it is unreachable (first deploy, outage, local dev without the
// backend), they fall back to the bundled content so the site never renders empty.

const FALLBACK_ICONS: Record<string, string> = {
  asia: "Palmtree",
  europe: "Landmark",
  caucasus: "Mountain",
};

const FALLBACK_FEATURED = new Set([
  "paris-france-tour-package",
  "japan-tour-package",
  "bali-tour-package",
  "uk-tour-package",
  "russia-tour-package",
]);

const FALLBACK_CATEGORIES: Category[] = HOLIDAY_CATEGORIES.map((c, i) => ({
  id: c.slug,
  name: c.name,
  slug: c.slug,
  icon: FALLBACK_ICONS[c.slug] ?? null,
  description: c.description,
  image: c.image,
  sort_order: i,
}));

const FALLBACK_PACKAGES: Package[] = PACKAGES.map((p) => ({
  ...p,
  id: p.slug,
  category_name: HOLIDAY_CATEGORIES.find((c) => c.slug === p.category)?.name ?? p.category,
  gallery: p.gallery.length ? p.gallery : [p.image],
  is_featured: FALLBACK_FEATURED.has(p.slug),
  is_active: true,
}));

export const FALLBACK_SETTINGS: SiteSettings = {
  contact_email: CONTACT_EMAIL,
  whatsapp_number: "971555753133",
  working_hours: WORKING_HOURS,
  instagram_url: "https://www.instagram.com/eliteescapetourism/",
  facebook_url: "https://www.facebook.com/eliteescapetourism/",
  x_url: "https://x.com/EliteEscapeTour",
  offices: OFFICES,
};

function parseOffices(raw: unknown): SiteSettings["offices"] {
  try {
    const value = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (Array.isArray(value) && value.every((o) => o && typeof o.city === "string" && typeof o.address === "string")) {
      return value.map((o) => ({
        city: o.city,
        address: o.address,
        phones: Array.isArray(o.phones) ? o.phones.filter((p: unknown) => typeof p === "string") : [],
        note: typeof o.note === "string" ? o.note : undefined,
      }));
    }
  } catch {
    // fall through to the bundled offices
  }
  return OFFICES;
}

export async function getCategories(): Promise<Category[]> {
  try {
    return await apiGet<Category[]>("/api/categories?section=holidays");
  } catch {
    return FALLBACK_CATEGORIES;
  }
}

export async function getPackages(): Promise<Package[]> {
  try {
    return await apiGet<Package[]>("/api/packages");
  } catch {
    return FALLBACK_PACKAGES;
  }
}

export async function getPackage(slug: string): Promise<Package | null> {
  try {
    return await apiGet<Package>(`/api/packages/${encodeURIComponent(slug)}`);
  } catch {
    return FALLBACK_PACKAGES.find((p) => p.slug === slug) ?? null;
  }
}

const FALLBACK_VISA_COUNTRIES: VisaCountry[] = [
  ["United States", "🇺🇸"],
  ["United Kingdom", "🇬🇧"],
  ["Canada", "🇨🇦"],
  ["Australia", "🇦🇺"],
  ["China", "🇨🇳"],
  ["Singapore", "🇸🇬"],
  ["Indonesia", "🇮🇩"],
  ["Georgia", "🇬🇪"],
  ["Philippines", "🇵🇭"],
  ["France", "🇫🇷"],
].map(([name, flag]) => ({
  id: name,
  country_name: name,
  slug: name.toLowerCase().replace(/\s+/g, "-"),
  flag_emoji: flag,
  group: "Visa Assistance",
  visa_type: "Visa assistance",
  requirements: null,
  fee: null,
  processing_time: null,
}));

export async function getVisaCountries(): Promise<VisaCountry[]> {
  try {
    return await apiGet<VisaCountry[]>("/api/visa-countries");
  } catch {
    return FALLBACK_VISA_COUNTRIES;
  }
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    return await apiGet<BlogPost[]>("/api/blog");
  } catch {
    return [];
  }
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    return await apiGet<BlogPost>(`/api/blog/${encodeURIComponent(slug)}`);
  } catch {
    return null;
  }
}

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const remote = await apiGet<Record<string, unknown>>("/api/settings", 300);
    const text = (key: keyof SiteSettings) =>
      typeof remote[key] === "string" && remote[key] ? (remote[key] as string) : (FALLBACK_SETTINGS[key] as string);
    return {
      contact_email: text("contact_email"),
      whatsapp_number: text("whatsapp_number"),
      working_hours: text("working_hours"),
      instagram_url: text("instagram_url"),
      facebook_url: text("facebook_url"),
      x_url: text("x_url"),
      offices: remote.offices ? parseOffices(remote.offices) : OFFICES,
    };
  } catch {
    return FALLBACK_SETTINGS;
  }
}
