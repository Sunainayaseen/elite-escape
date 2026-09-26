"use client";

import { ArrowRight, CheckCircle2, Mail, Sparkles } from "lucide-react";
import { type FormEvent, useId, useState } from "react";

import { Reveal } from "@/components/motion/Reveal";
import { PointerLayer, PointerScene } from "@/components/motion/PointerScene";
import { apiRequest } from "@/lib/api";

// Flight paths across a 1200×420 sky. Every depth layer shares this viewBox, so the planes and
// their contrails line up however wide the card is (the SVGs use `slice`, never stretch).
const ROUTES = {
  far: "M-80 330 C 220 250 420 120 720 110 S 1150 60 1300 20",
  mid: "M-80 120 C 200 170 420 300 700 280 S 1100 150 1300 190",
  near: "M-120 400 C 180 330 380 210 640 200 S 1060 120 1340 40",
} as const;

type Depth = keyof typeof ROUTES;

// A top-down airliner pointing along +x, centred on (0,0), about 40 units long.
function PlaneShape({ gradientId }: { gradientId: string }) {
  return (
    <g>
      <path
        d="M4 -2.4 L-6 -18 L-10 -18 L-4 -2.4 Z M4 2.4 L-6 18 L-10 18 L-4 2.4 Z"
        fill={`url(#${gradientId})`}
        opacity="0.9"
      />
      <path
        d="M-13 -2 L-18 -8 L-20.5 -8 L-17 -1.5 Z M-13 2 L-18 8 L-20.5 8 L-17 1.5 Z"
        fill={`url(#${gradientId})`}
        opacity="0.9"
      />
      <path
        d="M20 0 C20 -2 17 -2.6 14 -2.6 L-14 -2.2 C-17 -2 -19.5 -1 -19.5 0 C-19.5 1 -17 2 -14 2.2 L14 2.6 C17 2.6 20 2 20 0 Z"
        fill={`url(#${gradientId})`}
      />
      <rect x="-1" y="-9.5" width="5" height="2" rx="1" fill="#ffffff" opacity="0.7" />
      <rect x="-1" y="7.5" width="5" height="2" rx="1" fill="#ffffff" opacity="0.7" />
    </g>
  );
}

const LAYER = {
  far: { scale: 0.9, opacity: 0.45, dur: 30, begin: -12, blur: 1.2, trail: 0.2 },
  mid: { scale: 1.5, opacity: 0.7, dur: 22, begin: -4, blur: 0.4, trail: 0.3 },
  near: { scale: 2.6, opacity: 1, dur: 16, begin: -9, blur: 0, trail: 0.45 },
} as const;

/** One depth layer of sky: a contrail and a plane flying along it. */
function SkyLayer({ depth, className }: { depth: Depth; className?: string }) {
  const uid = useId().replace(/:/g, "");
  const cfg = LAYER[depth];
  const routeId = `route-${depth}-${uid}`;
  const bodyId = `body-${depth}-${uid}`;
  const trailId = `trail-${depth}-${uid}`;
  const blurId = `blur-${depth}-${uid}`;

  return (
    <svg aria-hidden viewBox="0 0 1200 420" preserveAspectRatio="xMidYMid slice" className={className}>
      <defs>
        <path id={routeId} d={ROUTES[depth]} />
        <linearGradient id={bodyId} x1="0" y1="-1" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.55" stopColor="#E6F6FD" />
          <stop offset="1" stopColor="#9FDDF5" />
        </linearGradient>
        <linearGradient id={trailId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="0.6" stopColor="#ffffff" stopOpacity={cfg.trail} />
          <stop offset="1" stopColor="#ffffff" stopOpacity={cfg.trail * 1.6} />
        </linearGradient>
        {cfg.blur > 0 && (
          <filter id={blurId}>
            <feGaussianBlur stdDeviation={cfg.blur} />
          </filter>
        )}
      </defs>

      <g filter={cfg.blur > 0 ? `url(#${blurId})` : undefined} opacity={cfg.opacity}>
        {/* Contrail: the route as a dashed line whose dashes drift along with the plane */}
        <use
          href={`#${routeId}`}
          fill="none"
          stroke={`url(#${trailId})`}
          strokeWidth={depth === "near" ? 2.5 : 1.6}
          strokeLinecap="round"
          strokeDasharray="2 10"
        >
          <animate attributeName="stroke-dashoffset" from="0" to="-240" dur="6s" repeatCount="indefinite" />
        </use>

        {/* Moving plane: hidden under reduced motion, where the static one below shows instead */}
        <g className="motion-reduce:hidden">
          <g>
            <animateMotion dur={`${cfg.dur}s`} begin={`${cfg.begin}s`} repeatCount="indefinite" rotate="auto">
              <mpath href={`#${routeId}`} />
            </animateMotion>
            <g transform={`scale(${cfg.scale})`}>
              {/* soft shadow a little below the plane sells the height above the "ground" */}
              <g transform="translate(6 10)" opacity="0.25">
                <PlaneShape gradientId={bodyId} />
              </g>
              <PlaneShape gradientId={bodyId} />
            </g>
          </g>
        </g>

        <g className="hidden motion-reduce:inline">
          <g
            transform={
              depth === "near"
                ? `translate(940 72) rotate(-10) scale(${cfg.scale})`
                : depth === "mid"
                  ? `translate(560 365) rotate(-8) scale(${cfg.scale})`
                  : `translate(665 75) rotate(-14) scale(${cfg.scale})`
            }
          >
            <PlaneShape gradientId={bodyId} />
          </g>
        </g>
      </g>
    </svg>
  );
}

const PERKS = ["New packages", "Visa updates", "No spam"] as const;

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);
    try {
      await apiRequest("/api/newsletter", { body: { email, website } });
      setStatus("sent");
      setEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setStatus("idle");
    }
  }

  return (
    <section aria-labelledby="newsletter-title" className="mx-auto max-w-7xl px-6 py-12 sm:py-16">
      <Reveal y={24}>
        <div className="relative isolate overflow-hidden rounded-[2rem] bg-[#1C7FB0] shadow-[0_24px_60px_-28px_rgba(11,42,74,0.55)]">
          {/* Sky: layered gradient, sun glow, horizon haze */}
          <div
            aria-hidden
            className="absolute inset-0 -z-20 bg-[linear-gradient(120deg,#0B2A4A_0%,#12568C_42%,#1C7FB0_78%,#2890BD_100%)]"
          />
          <div
            aria-hidden
            className="absolute -right-24 -top-32 -z-20 h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle,rgba(232,192,125,0.28)_0%,rgba(232,192,125,0.06)_40%,transparent_70%)]"
          />
          <div
            aria-hidden
            className="absolute -bottom-40 -left-20 -z-20 h-[24rem] w-[36rem] rounded-full bg-[#27B3CF] opacity-15 blur-3xl"
          />
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 -z-20 h-1/2 bg-gradient-to-t from-[#12568C]/45 to-transparent"
          />

          {/* Planes at three depths; the mouse shifts each layer by a different amount (desktop) */}
          <PointerScene className="pointer-events-none absolute inset-0 -z-10">
            <PointerLayer depth={6} className="absolute inset-0">
              <SkyLayer depth="far" className="absolute inset-0 h-full w-full" />
            </PointerLayer>
            <PointerLayer depth={14} className="absolute inset-0">
              <SkyLayer depth="mid" className="absolute inset-0 hidden h-full w-full sm:block" />
            </PointerLayer>
            <PointerLayer depth={28} className="absolute inset-0">
              <SkyLayer depth="near" className="absolute inset-0 h-full w-full" />
            </PointerLayer>
          </PointerScene>

          {/* Content scrim on the left keeps the copy readable over the moving sky */}
          <div
            aria-hidden
            className="absolute inset-y-0 left-0 -z-10 w-full bg-gradient-to-r from-[#0E4674]/85 via-[#0E4674]/55 to-transparent lg:w-3/4"
          />

          <div className="grid grid-cols-1 items-center gap-8 px-7 py-10 sm:px-12 sm:py-12 lg:grid-cols-[1fr_minmax(0,440px)] lg:gap-14 lg:px-14 lg:py-12">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#F3D9A8] backdrop-blur">
                <Sparkles size={14} aria-hidden />
                Travel newsletter
              </p>
              <h2
                id="newsletter-title"
                className="mt-5 font-serif text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl"
              >
                Travel ideas,{" "}
                <span className="bg-gradient-to-r from-[#F3D9A8] to-[#E8C07D] bg-clip-text italic text-transparent">
                  now and then
                </span>
              </h2>
              <p className="mt-4 max-w-lg text-base leading-relaxed text-white/90">
                New packages and visa updates, straight to your inbox. No spam.
              </p>
              <ul className="mt-6 flex flex-wrap gap-2">
                {PERKS.map((perk) => (
                  <li
                    key={perk}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white/95 backdrop-blur"
                  >
                    <CheckCircle2 size={13} aria-hidden className="text-[#5CC3EF]" />
                    {perk}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl bg-white/[0.08] p-5 shadow-2xl shadow-[#0B2A4A]/30 backdrop-blur-xl sm:p-6">
              {status === "sent" ? (
                <div role="status" className="flex items-center gap-4 py-2">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-brand-blue-strong">
                    <CheckCircle2 size={24} aria-hidden />
                  </span>
                  <p className="text-sm font-semibold text-white">
                    You&apos;re subscribed — watch your inbox for our next update.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <label htmlFor="newsletter-email" className="text-sm font-semibold text-white">
                    Your email address
                  </label>
                  <input
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="absolute left-[-9999px] h-0 w-0 opacity-0"
                  />
                  <div className="relative mt-3">
                    <Mail
                      size={18}
                      aria-hidden
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-brand-blue-strong"
                    />
                    <input
                      id="newsletter-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="w-full rounded-2xl bg-white py-3.5 pl-12 pr-4 text-sm text-text-ink shadow-inner outline-none placeholder:text-text-muted focus:ring-4 focus:ring-[#5CC3EF]/30"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="group mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#E8C07D] to-[#F3D9A8] px-6 py-3.5 text-sm font-bold text-[#0B2A4A] shadow-lg shadow-[#E8C07D]/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#E8C07D]/35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:translate-y-0 disabled:opacity-70"
                  >
                    {status === "submitting" ? "Subscribing..." : "Subscribe"}
                    <ArrowRight
                      size={16}
                      aria-hidden
                      className="transition-transform duration-200 group-hover:translate-x-1"
                    />
                  </button>
                </form>
              )}
              {error && (
                <p role="alert" className="mt-3 rounded-xl bg-red-500/15 px-3 py-2 text-sm text-red-100">
                  {error}
                </p>
              )}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
