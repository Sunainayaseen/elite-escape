import type { Metadata } from "next";

import { BlogForm } from "@/components/admin/blog/BlogForm";

export const metadata: Metadata = { title: "New article" };

export default function NewBlogPage() {
  return <BlogForm />;
}
