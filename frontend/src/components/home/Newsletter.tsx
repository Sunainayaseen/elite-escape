"use client";

import Image from "next/image";
import { type FormEvent, useState } from "react";

import { Reveal } from "@/components/motion/Reveal";
import { apiRequest } from "@/lib/api";
import { IMG } from "@/lib/site-data";

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
    <section className="relative isolate overflow-hidden bg-[#080f1c] py-24 sm:py-32">
      <Image
        src={IMG.beach}
        alt="Tropical beach"
        fill
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#080f1c]/80 via-[#080f1c]/60 to-[#080f1c]/85" />

      <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center px-6 text-center">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium text-brand-teal-light backdrop-blur-sm">
            Stay in the loop
          </span>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="mt-6 font-serif text-3xl font-semibold text-white sm:text-4xl">
            Get travel inspiration and updates
          </h2>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="mt-4 text-white/75">
            New packages and visa updates, straight to your inbox. No spam.
          </p>
        </Reveal>

        <Reveal delay={0.2} className="mt-8 w-full">
          {status === "sent" ? (
            <p role="status" className="rounded-full bg-white px-6 py-4 text-sm font-semibold text-text-ink">
              You&apos;re subscribed — watch your inbox for our next update.
            </p>
          ) : (
          <form
            onSubmit={handleSubmit}
            className="neon-glow flex w-full flex-col gap-3 rounded-full bg-white p-1.5 sm:flex-row sm:items-center"
          >
            <input
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="absolute left-[-9999px] h-0 w-0 opacity-0"
            />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full flex-1 bg-transparent px-5 py-3 text-sm text-text-ink outline-none placeholder:text-text-muted focus:outline-none focus-visible:outline-none"
            />
            <button
              type="submit"
              disabled={status === "submitting"}
              className="shrink-0 rounded-full bg-brand-blue px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-brand-teal disabled:opacity-70"
            >
              {status === "submitting" ? "Subscribing..." : "Subscribe"}
            </button>
          </form>
          )}
          {error && (
            <p role="alert" className="mt-3 text-sm text-red-200">
              {error}
            </p>
          )}
        </Reveal>
      </div>
    </section>
  );
}
