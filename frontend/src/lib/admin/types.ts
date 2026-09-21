// Shapes returned by the admin API (see backend/app/schemas). Dates arrive as ISO strings.

export type AdminUser = { id: string; name: string; email: string; role: "admin" | "staff" };
export type AdminSessionInfo = { user: AdminUser; csrf_token: string };

export type SeoFields = {
  seo_title: string | null;
  meta_description: string | null;
  og_title: string | null;
  og_description: string | null;
  canonical_url: string | null;
  focus_keyword: string | null;
};

export type ItineraryDay = { day: number; title: string; description: string };
export type OptionalExperience = { title: string; description: string | null };
export type FaqItem = { question: string; answer: string };

export type PackageStatus = "draft" | "published" | "unpublished";

export type AdminPackage = SeoFields & {
  id: string;
  slug: string;
  title: string;
  category: string;
  category_id: string;
  category_name: string;
  destination_id: string | null;
  country: string;
  summary: string;
  description: string | null;
  price_from: number;
  price_to: number;
  currency: string;
  duration: string;
  tour_types: string[];
  group_size: string | null;
  main_image: string | null;
  images: string[];
  highlights: string[];
  itinerary: ItineraryDay[];
  inclusions: string[];
  exclusions: string[];
  accommodation: string | null;
  transportation: string | null;
  optional_experiences: OptionalExperience[];
  important_notes: string | null;
  faq: FaqItem[];
  status: PackageStatus;
  is_featured: boolean;
  is_active: boolean;
  position: number;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  section: string;
  icon: string | null;
  description: string | null;
  image: string | null;
  sort_order: number;
};

export type Destination = SeoFields & {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  image: string | null;
  is_published: boolean;
  sort_order: number;
  package_ids: string[];
  package_count: number;
  created_at: string;
  updated_at: string;
};

export type VisaType = { name: string; description: string | null };

export type VisaCountry = SeoFields & {
  id: string;
  country_name: string;
  slug: string;
  flag_emoji: string | null;
  flag_image: string | null;
  group: string;
  description: string | null;
  visa_type: string;
  visa_types: VisaType[];
  requirements: string | null;
  fee: number | null;
  processing_time: string | null;
  is_active: boolean;
};

export type InquiryStatus = "new" | "contacted" | "in_progress" | "completed" | "closed";

export type Inquiry = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  source_page: string;
  inquiry_type: string;
  destination: string | null;
  package_id: string | null;
  package_title: string | null;
  travel_start: string | null;
  travel_end: string | null;
  travelers: number | null;
  status: InquiryStatus;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type InquiryPage = { items: Inquiry[]; total: number; counts: Record<InquiryStatus, number> };

export type BlogCategory = { id: string; name: string; slug: string };

export type BlogPost = SeoFields & {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  category: BlogCategory | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string | null;
};

export type MediaItem = {
  id: string;
  url: string;
  thumb_url: string;
  variants: Record<string, string>;
  original_name: string;
  mime_type: string;
  size_bytes: number;
  width: number;
  height: number;
  alt_text: string | null;
  created_at: string;
};

export type Office = { city: string; address: string; phones: string[]; note: string | null };
export type SiteSettings = Record<string, string>;

export type DashboardStats = {
  total_packages: number;
  published_packages: number;
  total_destinations: number;
  total_visa_countries: number;
  new_inquiries: number;
  total_inquiries: number;
  published_posts: number;
  subscribers: number;
  inquiries_by_status: Record<InquiryStatus, number>;
  recent_inquiries: Inquiry[];
};
