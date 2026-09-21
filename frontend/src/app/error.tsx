"use client";

import { Button } from "@/components/ui/Button";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 pt-32 text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-blue-strong">Something went wrong</p>
      <h1 className="mt-3 font-serif text-3xl font-semibold text-text-ink sm:text-4xl">
        We couldn&apos;t load this page
      </h1>
      <p className="mt-4 text-text-muted">
        Please try again. If it keeps happening, contact us and we&apos;ll help you directly.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button onClick={reset}>Try again</Button>
        <Button href="/contact" variant="outline">
          Contact us
        </Button>
      </div>
    </section>
  );
}
