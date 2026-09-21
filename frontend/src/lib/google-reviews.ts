export type GooglePlaceReview = {
  author_name: string;
  profile_photo_url?: string;
  rating: number;
  relative_time_description: string;
  text: string;
  time: number;
};

export type GooglePlaceDetails = {
  name: string;
  rating?: number;
  user_ratings_total?: number;
  url?: string;
  reviews: GooglePlaceReview[];
};

type PlaceDetailsResponse = {
  status: string;
  result?: {
    name: string;
    rating?: number;
    user_ratings_total?: number;
    url?: string;
    reviews?: GooglePlaceReview[];
  };
};

// Requires GOOGLE_PLACES_API_KEY + GOOGLE_PLACE_ID in .env.local (server-only —
// never expose the key to the client). Returns null until both are set, or on
// any API/network failure, so callers can fall back to static content.
export async function getGoogleReviews(): Promise<GooglePlaceDetails | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  if (!apiKey || !placeId) return null;

  const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
  url.searchParams.set("place_id", placeId);
  url.searchParams.set("fields", "name,rating,user_ratings_total,url,reviews");
  url.searchParams.set("key", apiKey);

  try {
    const res = await fetch(url, { next: { revalidate: 60 * 60 * 6 } });
    const data: PlaceDetailsResponse = await res.json();

    if (data.status !== "OK" || !data.result?.reviews?.length) return null;

    return {
      name: data.result.name,
      rating: data.result.rating,
      user_ratings_total: data.result.user_ratings_total,
      url: data.result.url,
      reviews: data.result.reviews,
    };
  } catch {
    return null;
  }
}
