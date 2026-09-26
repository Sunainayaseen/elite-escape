import { getGoogleReviews } from "@/lib/google-reviews";
import { GOOGLE_RATING } from "@/lib/site-data";

export type RatingSummary = {
  rating: number;
  count?: number;
  url?: string;
  /** Set only for the owner-copied figure, which can go stale; live data never needs it. */
  asOf?: string;
};

/**
 * The business's Google rating: live from the Places API when it's configured, otherwise the
 * figure the owner copied into GOOGLE_RATING, otherwise null (and nothing rating-related renders).
 */
export async function getRatingSummary(): Promise<RatingSummary | null> {
  const place = await getGoogleReviews();
  if (place?.rating) {
    return { rating: place.rating, count: place.user_ratings_total, url: place.url };
  }
  if (GOOGLE_RATING) return { ...GOOGLE_RATING };
  return null;
}

export function formatRating({ rating, count }: Pick<RatingSummary, "rating" | "count">) {
  return `${rating.toFixed(1)} on Google${count ? ` · ${count} ${count === 1 ? "review" : "reviews"}` : ""}`;
}
