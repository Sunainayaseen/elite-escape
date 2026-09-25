import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { PageHero } from "@/components/layout/PageHero";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { getBlogPosts } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const posts = await getBlogPosts();
  return {
    ...pageMetadata({
      title: "Travel Blog",
      description:
        "Travel guides, visa advice and destination inspiration from Elite Escape Tourism.",
      path: "/blog",
    }),
    // An empty listing is thin content; keep it out of search results until articles are published.
    ...(posts.length === 0 ? { robots: { index: false, follow: true } } : {}),
  };
}

function formatDate(value: string | null) {
  return value
    ? new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : "";
}

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <>
      <PageHero
        eyebrow="Blog"
        title="Travel guides and advice"
        description="Destination inspiration and practical tips for your next trip."
      />

      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
        {posts.length === 0 ? (
          <div className="mx-auto max-w-xl py-12 text-center">
            <h2 className="font-serif text-2xl font-semibold text-text-ink">
              Our first articles are on the way
            </h2>
            <p className="mt-3 text-text-muted">
              In the meantime, browse our holiday packages or ask our team about your visa.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button href="/holidays" arrow>
                Browse Holidays
              </Button>
              <Button href="/global-visa" variant="outline">
                Visa Assistance
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, i) => (
              <Reveal key={post.id} delay={(i % 3) * 0.1} y={20}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line/10 bg-white shadow-sm shadow-brand-blue/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-blue/15"
                >
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-brand-blue to-brand-navy-accent">
                    {post.cover_image && (
                      <Image
                        src={post.cover_image}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <p className="text-xs text-text-muted">
                      {post.category?.name ? `${post.category.name} · ` : ""}
                      {formatDate(post.published_at)}
                    </p>
                    <h2 className="mt-2 font-serif text-lg font-semibold text-text-ink">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="mt-2 text-sm leading-relaxed text-text-muted">{post.excerpt}</p>
                    )}
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
