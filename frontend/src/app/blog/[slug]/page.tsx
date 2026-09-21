import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CTASection } from "@/components/home/CTASection";
import { getBlogPost, getBlogPosts } from "@/lib/data";

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return {};
  return {
    title: `${post.seo_title || post.title} | Elite Escape Tourism`,
    description: post.meta_description || post.excerpt || undefined,
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) notFound();

  // Content is rendered as plain paragraphs, never as HTML, so nothing an editor pastes can inject markup.
  const paragraphs = post.content.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

  return (
    <>
      <article className="mx-auto max-w-3xl px-6 pb-16 pt-32 sm:pt-40">
        <Link href="/blog" className="text-sm font-medium text-brand-blue hover:underline">
          ← All articles
        </Link>
        <p className="mt-6 text-xs text-text-muted">
          {post.category?.name ? `${post.category.name} · ` : ""}
          {post.published_at
            ? new Date(post.published_at).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })
            : ""}
        </p>
        <h1 className="mt-3 font-serif text-3xl font-semibold text-text-ink sm:text-5xl">
          {post.title}
        </h1>
        {post.cover_image && (
          <div className="relative mt-8 h-64 overflow-hidden rounded-3xl sm:h-96">
            <Image
              src={post.cover_image}
              alt=""
              fill
              priority
              sizes="(min-width: 768px) 768px, 100vw"
              className="object-cover"
            />
          </div>
        )}
        <div className="mt-10 flex flex-col gap-5 leading-relaxed text-text-muted">
          {paragraphs.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </article>
      <CTASection />
    </>
  );
}
