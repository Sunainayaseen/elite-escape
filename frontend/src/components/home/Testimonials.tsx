import { ExternalLink, Star } from "lucide-react";
import Image from "next/image";

import { Parallax } from "@/components/motion/Parallax";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHeader } from "@/components/motion/SectionHeader";
import { Stars } from "@/components/home/GoogleRatingBadge";
import { formatRating, getRatingSummary } from "@/lib/google-rating";
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
  const [place, summary] = await Promise.all([getGoogleReviews(), getRatingSummary()]);

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
        subtitle: t.date,
        rating: t.rating,
        quote: t.quote,
      }));

  if (reviews.length === 0) return null;

  return (
    <section className="relative isolate overflow-hidden bg-[#080f1c] px-6 py-20 sm:py-28">
      <Parallax range={40}>
        <Image
          src={IMG.europe}
          alt="Scenic terrace overlooking the coast"
          fill
          sizes="100vw"
          className="object-cover"
        />
      </Parallax>
      <div className="absolute inset-0 bg-gradient-to-b from-[#080f1c]/90 via-[#080f1c]/70 to-[#080f1c]/90" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <SectionHeader
          tone="dark"
          eyebrow="Traveler stories"
          title="What our travelers say"
          description={
            summary ? (
              <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm">
                <Stars rating={summary.rating} />
                <span>{formatRating(summary)}</span>
                {summary.asOf && <span className="text-white/50">(as of {summary.asOf})</span>}
              </p>
            ) : undefined
          }
        />

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r, i) => (
            <Reveal key={r.key} delay={(i % 3) * 0.08} y={32} scale={0.98}>
              <div className="flex h-full flex-col rounded-2xl border border-white/15 bg-white/10 p-6 shadow-lg shadow-black/10 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-white/30 hover:bg-white/[0.14]">
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

        {summary?.url && (
          <div className="mt-10 text-center">
            <a
              href={summary.url}
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
