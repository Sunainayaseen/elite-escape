import type { MetadataRoute } from "next";

import { getBlogPosts, getCategories, getPackages } from "@/lib/data";
import { SITE_URL } from "@/lib/site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, packages, posts] = await Promise.all([
    getCategories(),
    getPackages(),
    getBlogPosts(),
  ]);

  const staticRoutes = [
    "",
    "/holidays",
    "/global-visa",
    "/attractions",
    "/seasonal-tours",
    "/about",
    "/contact",
    "/privacy-policy",
    "/cookie-policy",
    "/terms-conditions",
    ...(posts.length ? ["/blog"] : []),
  ].map((path) => ({ url: `${SITE_URL}${path}` }));

  return [
    ...staticRoutes,
    ...categories.map((cat) => ({ url: `${SITE_URL}/holidays/${cat.slug}` })),
    ...packages.map((pkg) => ({ url: `${SITE_URL}/holidays/${pkg.category}/${pkg.slug}` })),
    ...posts.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: post.published_at ? new Date(post.published_at) : undefined,
    })),
  ];
}
