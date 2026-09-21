export function PageHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-[#080f1c] pb-16 pt-32 sm:pt-40">
      <div
        className="pointer-events-none absolute -left-32 top-0 h-72 w-72 rounded-full opacity-20 blur-3xl"
        style={{ background: "#27B3CF" }}
      />
      <div
        className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full opacity-15 blur-3xl"
        style={{ background: "#2A4596" }}
      />
      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-teal-light">
          {eyebrow}
        </p>
        <h1 className="mt-3 font-serif text-3xl font-semibold text-white sm:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="mx-auto mt-4 max-w-xl text-sm text-white/65 sm:text-base">
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
