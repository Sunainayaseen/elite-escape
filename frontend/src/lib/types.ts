export type ItineraryDay = {
  day: number;
  title: string;
  description: string;
};

export type Package = {
  id: string;
  slug: string;
  title: string;
  category: string;
  category_name: string;
  country: string;
  summary: string;
  description?: string | null;
  price_from: number;
  price_to: number;
  currency: string;
  duration: string;
  tour_types: readonly string[];
  group_size: string | null;
  image: string;
  gallery: readonly string[];
  highlights: readonly string[];
  itinerary: readonly ItineraryDay[];
  inclusions: readonly string[];
  exclusions: readonly string[];
  is_featured: boolean;
  is_active: boolean;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  image: string | null;
  sort_order: number;
};

export type VisaCountry = {
  id: string;
  country_name: string;
  slug: string;
  flag_emoji: string | null;
  group: string;
  visa_type: string;
  description?: string | null;
  flag_image?: string | null;
  visa_types?: readonly { name: string; description?: string | null }[];
  requirements: string | null;
  // null (or the legacy 0 / "On enquiry") means the agency has not published this yet.
  fee: number | null;
  processing_time: string | null;
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  category?: { name: string; slug: string } | null;
  published_at: string | null;
  seo_title?: string | null;
  meta_description?: string | null;
};

export type Office = {
  city: string;
  address: string;
  phones: readonly string[];
  note?: string;
};

export type SiteSettings = {
  contact_email: string;
  whatsapp_number: string;
  working_hours: string;
  instagram_url: string;
  facebook_url: string;
  x_url: string;
  offices: readonly Office[];
};
