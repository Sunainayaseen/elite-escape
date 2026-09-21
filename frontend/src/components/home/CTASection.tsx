import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";

export function CTASection() {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-20 sm:pb-28">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl border border-line/10 bg-gradient-to-br from-bg-navy-light via-white to-bg-navy-light px-8 py-16 text-center shadow-lg shadow-brand-blue/5 sm:px-16">
          <div
            className="pointer-events-none absolute -top-24 right-0 h-64 w-64 rounded-full opacity-30 blur-3xl"
            style={{ background: "#27B3CF" }}
          />
          <div
            className="pointer-events-none absolute -bottom-24 left-0 h-64 w-64 rounded-full opacity-20 blur-3xl"
            style={{ background: "#2890BD" }}
          />
          <h2 className="relative font-serif text-3xl font-semibold text-text-ink sm:text-4xl">
            Ready for your next escape?
          </h2>
          <p className="relative mx-auto mt-4 max-w-lg text-text-muted">
            Tell us where you want to go and we&apos;ll take it from there —
            itineraries, hotels, visas, and everything in between.
          </p>
          <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button href="/contact">Plan My Trip</Button>
            <Button href="/holidays" variant="outline">
              Browse Holidays
            </Button>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
