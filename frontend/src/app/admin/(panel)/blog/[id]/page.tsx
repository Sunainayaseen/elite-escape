"use client";

import { useParams } from "next/navigation";

import { BlogForm } from "@/components/admin/blog/BlogForm";

export default function EditBlogPage() {
  const { id } = useParams<{ id: string }>();
  return <BlogForm id={id} />;
}
