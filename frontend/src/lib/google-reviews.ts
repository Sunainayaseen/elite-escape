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

// Places API (New): GET /v1/places/{id} with a field mask. https://developers.google.com/maps/documentation/places/web-service/place-details
type NewPlaceResponse = {
  displayName?: { text: string };
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  reviews?: {
    rating?: number;
    relativePublishTimeDescription?: string;
    publishTime?: string;
    text?: { text: string };
    originalText?: { text: string };
    authorAttribution?: { displayName?: string; photoUri?: string };
  }[];
};

type LegacyPlaceResponse = {
  status: string;
  result?: {
    name: string;
    rating?: number;
    user_ratings_total?: number;
    url?: string;
    reviews?: GooglePlaceReview[];
  };
};

const REVALIDATE = 60 * 60 * 6;

async function fromPlacesApiNew(apiKey: string, placeId: string): Promise<GooglePlaceDetails | null> {
  const res = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`, {
    headers: {
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "displayName,rating,userRatingCount,googleMapsUri,reviews",
    },
    next: { revalidate: REVALIDATE },
  });
  if (!res.ok) return null;
  const data: NewPlaceResponse = await res.json();

  const reviews = (data.reviews ?? [])
    .map((r) => ({
      author_name: r.authorAttribution?.displayName ?? "Google user",
      profile_photo_url: r.authorAttribution?.photoUri,
      rating: r.rating ?? 0,
      relative_time_description: r.relativePublishTimeDescription ?? "",
      text: r.text?.text ?? r.originalText?.text ?? "",
      time: r.publishTime ? Math.floor(Date.parse(r.publishTime) / 1000) : 0,
    }))
    .filter((r) => r.rating > 0);
  if (!reviews.length) return null;

  return {
    name: data.displayName?.text ?? "",
    rating: data.rating,
    user_ratings_total: data.userRatingCount,
    url: data.googleMapsUri,
    reviews,
  };
}

async function fromPlacesApiLegacy(apiKey: string, placeId: string): Promise<GooglePlaceDetails | null> {
  const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
  url.searchParams.set("place_id", placeId);
  url.searchParams.set("fields", "name,rating,user_ratings_total,url,reviews");
  url.searchParams.set("key", apiKey);

  const res = await fetch(url, { next: { revalidate: REVALIDATE } });
  const data: LegacyPlaceResponse = await res.json();
  if (data.status !== "OK" || !data.result?.reviews?.length) return null;

  return {
    name: data.result.name,
    rating: data.result.rating,
    user_ratings_total: data.result.user_ratings_total,
    url: data.result.url,
    reviews: data.result.reviews,
  };
}

// Requires GOOGLE_PLACES_API_KEY + GOOGLE_PLACE_ID (server-only — never expose the key to the
// client). Uses Places API (New), the only version new Google Cloud projects can enable since
// March 2025, and falls back to the legacy Places API for older keys that only have that one.
// Returns null until both are set, or on any API/network failure, so callers can fall back to
// static content. Google returns at most 5 reviews per place.
export async function getGoogleReviews(): Promise<GooglePlaceDetails | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  if (!apiKey || !placeId) return null;

  try {
    return (await fromPlacesApiNew(apiKey, placeId)) ?? (await fromPlacesApiLegacy(apiKey, placeId));
  } catch {
    return null;
  }
}
