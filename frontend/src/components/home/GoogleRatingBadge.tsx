import { Star } from "lucide-react";

import { formatRating, getRatingSummary } from "@/lib/google-rating";
import { cn } from "@/lib/utils";

/** Five stars, filled to the nearest half. */
export function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className="relative inline-flex" aria-hidden>
      <span className="flex gap-0.5 text-current opacity-25">
        {Array.from({ length: 5 }, (_, i) => (
          <Star key={i} size={size} fill="currentColor" strokeWidth={0} />
        ))}
      </span>
      <span
        className="absolute inset-y-0 left-0 flex gap-0.5 overflow-hidden text-[#FBBC04]"
        style={{ width: `${(Math.round(rating * 2) / 2 / 5) * 100}%` }}
      >
        {Array.from({ length: 5 }, (_, i) => (
          <Star key={i} size={size} fill="currentColor" strokeWidth={0} className="shrink-0" />
        ))}
      </span>
    </span>
  );
}

/**
 * Compact "★★★★★ 4.8 on Google · 57 reviews" line, linking to the Google profile.
 * Renders nothing until a real rating exists (live API or owner-supplied GOOGLE_RATING).
 */
export async function GoogleRatingBadge({
  tone = "dark",
  className,
}: {
  tone?: "dark" | "light";
  className?: string;
}) {
  const summary = await getRatingSummary();
  if (!summary) return null;

  const dark = tone === "dark";
  const label = formatRating(summary);
  const content = (
    <>
      <Stars rating={summary.rating} />
      <span className={cn("font-semibold", dark ? "text-white" : "text-text-ink")}>
        {summary.rating.toFixed(1)}
      </span>
      <span className={dark ? "text-white/65" : "text-text-muted"}>
        on Google{summary.count ? ` · ${summary.count} reviews` : ""}
      </span>
    </>
  );
  const classes = cn(
    "inline-flex items-center gap-2 text-sm",
    dark ? "text-white" : "text-text-ink",
    className,
  );

  return summary.url ? (
    <a
      href={summary.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label}. Read our reviews on Google (opens in a new tab)`}
      className={cn(classes, "transition-opacity hover:opacity-80")}
    >
      {content}
    </a>
  ) : (
    <p className={classes} aria-label={label}>
      {content}
    </p>
  );
}
