import { Compass } from "lucide-react";

import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <section className="relative flex min-h-[70vh] items-center overflow-hidden bg-[#080f1c] pt-32">
      <div
        className="pointer-events-none absolute -left-32 top-0 h-72 w-72 rounded-full opacity-20 blur-3xl"
        style={{ background: "#27B3CF" }}
      />
      <div
        className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full opacity-15 blur-3xl"
        style={{ background: "#2A4596" }}
      />

      <div className="relative mx-auto flex max-w-xl flex-col items-center px-6 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/15 bg-white/5 text-brand-teal-light">
          <Compass size={28} />
        </span>
        <p className="mt-6 font-serif text-6xl font-semibold text-white">404</p>
        <h1 className="mt-3 font-serif text-2xl font-semibold text-white sm:text-3xl">
          Looks like this journey took a detour.
        </h1>
        <p className="mt-4 text-sm text-white/65 sm:text-base">
          The page you&apos;re looking for may have moved, or the link might
          be off. Let&apos;s get you back on route.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button href="/">Back to Home</Button>
          <Button href="/holidays" variant="outline" className="border-white/20 text-white hover:border-brand-teal-light hover:text-brand-teal-light">
            Explore Destinations
          </Button>
        </div>
      </div>
    </section>
  );
}
