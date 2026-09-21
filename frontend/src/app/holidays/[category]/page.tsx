import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PackageGrid } from "@/components/holidays/PackageGrid";
import { getCategories, getPackages } from "@/lib/data";
import { cn } from "@/lib/utils";

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((cat) => ({ category: cat.slug }));
}

async function getCategory(slug: string) {
  const categories = await getCategories();
  return categories.find((cat) => cat.slug === slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const category = await getCategory(categorySlug);
  if (!category) return {};
  return {
    title: `${category.name} Holiday Packages | Elite Escape Tourism`,
    description: category.description ?? undefined,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: categorySlug } = await params;
  const [categories, allPackages] = await Promise.all([getCategories(), getPackages()]);
  const category = categories.find((cat) => cat.slug === categorySlug);
  if (!category) notFound();

  const packages = allPackages.filter((p) => p.category === category.slug);

  return (
    <>
      <section className="relative overflow-hidden bg-[#080f1c] pb-16 pt-32 sm:pt-40">
        <div
          className="pointer-events-none absolute -left-32 top-0 h-72 w-72 rounded-full opacity-20 blur-3xl"
          style={{ background: "#27B3CF" }}
        />
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-widest text-brand-teal-light">
              <li>
                <Link href="/holidays" className="hover:text-white">
                  Holidays
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-white">
                {category.name}
              </li>
            </ol>
          </nav>
          <h1 className="mt-3 font-serif text-3xl font-semibold text-white sm:text-5xl">
            {category.name}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-white/65 sm:text-base">
            {category.description}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
        <div className="mb-10 flex flex-wrap gap-2">
          <Link
            href="/holidays"
            className="rounded-full border border-line/15 bg-white px-4 py-2 text-sm font-medium text-text-muted transition-colors duration-200 hover:border-brand-blue/40 hover:text-text-ink"
          >
            All Packages
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/holidays/${cat.slug}`}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-200",
                cat.slug === category.slug
                  ? "border-brand-blue bg-brand-blue text-white"
                  : "border-line/15 bg-white text-text-muted hover:border-brand-blue/40 hover:text-text-ink",
              )}
            >
              {cat.name}
            </Link>
          ))}
        </div>

        <PackageGrid packages={packages} />
      </section>
    </>
  );
}
