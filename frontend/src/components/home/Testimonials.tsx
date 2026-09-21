import { ExternalLink, Star } from "lucide-react";
import Image from "next/image";

import { Reveal } from "@/components/motion/Reveal";
import { getGoogleReviews } from "@/lib/google-reviews";
import { IMG, TESTIMONIALS } from "@/lib/site-data";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

type NormalizedReview = {
  key: string;
  name: string;
  subtitle: string;
  rating: number;
  quote: string;
  photo?: string;
};

export async function Testimonials() {
  const place = await getGoogleReviews();

  const reviews: NormalizedReview[] = place
    ? place.reviews.slice(0, 6).map((r) => ({
        key: `${r.author_name}-${r.time}`,
        name: r.author_name,
        subtitle: r.relative_time_description,
        rating: r.rating,
        quote: r.text,
        photo: r.profile_photo_url,
      }))
    : TESTIMONIALS.map((t) => ({
        key: t.name,
        name: t.name,
        subtitle: t.location,
        rating: t.rating,
        quote: t.quote,
      }));

  if (reviews.length === 0) return null;

  return (
    <section className="relative isolate overflow-hidden bg-[#080f1c] px-6 py-20 sm:py-28">
      <Image
        src={IMG.europe}
        alt="Scenic terrace overlooking the coast"
        fill
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#080f1c]/90 via-[#080f1c]/70 to-[#080f1c]/90" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-teal-light">
            Traveler stories
          </p>
          <h2 className="mt-3 font-serif text-3xl font-semibold text-white sm:text-4xl">
            What our travelers say
          </h2>
          {place?.rating && (
            <p className="mt-3 text-sm text-white/70">
              <span className="font-semibold text-white">
                {place.rating.toFixed(1)}★
              </span>{" "}
              on Google
              {place.user_ratings_total ? ` · ${place.user_ratings_total} reviews` : ""}
            </p>
          )}
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r, i) => (
            <Reveal key={r.key} delay={i * 0.08}>
              <div className="flex h-full flex-col rounded-2xl border border-white/15 bg-white/10 p-6 shadow-lg shadow-black/10 backdrop-blur-md">
                <div className="flex gap-1 text-gold">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star
                      key={idx}
                      size={15}
                      fill={idx < r.rating ? "currentColor" : "none"}
                      className={idx < r.rating ? "text-gold" : "text-white/20"}
                    />
                  ))}
                </div>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-white/80">
                  &ldquo;{r.quote}&rdquo;
                </p>
                <div className="mt-6 flex items-center gap-3">
                  {r.photo ? (
                    <Image
                      src={r.photo}
                      alt={r.name}
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-xs font-semibold text-white">
                      {initials(r.name)}
                    </span>
                  )}
                  <div>
                    <p className="text-sm font-medium text-white">{r.name}</p>
                    <p className="text-xs text-white/60">{r.subtitle}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {place?.url && (
          <div className="mt-10 text-center">
            <a
              href={place.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-teal-light transition-colors hover:text-white"
            >
              See all reviews on Google
              <ExternalLink size={14} />
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
