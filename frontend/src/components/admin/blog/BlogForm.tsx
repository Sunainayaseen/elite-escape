"use client";

import { Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { useAdmin } from "@/components/admin/AdminShell";
import { EMPTY_SEO, ImageField, SeoEditor, pickSeo } from "@/components/admin/forms";
import { useConfirm, useToast } from "@/components/admin/overlays";
import {
  Btn,
  Card,
  ErrorState,
  Field,
  PageHeader,
  Select,
  Spinner,
  Tabs,
  TextArea,
  TextInput,
  Toggle,
} from "@/components/admin/ui";
import { adminApi, errorText } from "@/lib/admin/client";
import { formatDate, slugPreview } from "@/lib/admin/format";
import { useAdminQuery } from "@/lib/admin/hooks";
import type { BlogPost, Category, SeoFields } from "@/lib/admin/types";

type FormState = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string | null;
  category_id: string;
  is_published: boolean;
  seo: SeoFields;
};

const BLANK: FormState = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  cover_image: null,
  category_id: "",
  is_published: false,
  seo: EMPTY_SEO,
};

function fromPost(p: BlogPost): FormState {
  return {
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt ?? "",
    content: p.content,
    cover_image: p.cover_image,
    category_id: p.category?.id ?? "",
    is_published: p.is_published,
    seo: pickSeo(p),
  };
}

export function BlogForm({ id }: { id?: string }) {
  const existing = useAdminQuery<BlogPost>(id ? `/blog/${id}` : null);
  const categories = useAdminQuery<Category[]>("/blog-categories");

  if (id && existing.loading) return <Spinner />;
  if (id && existing.error) return <ErrorState message={existing.error} onRetry={existing.reload} />;

  return (
    <BlogFormBody
      key={existing.data?.id ?? "new"}
      id={id}
      post={existing.data}
      initial={existing.data ? fromPost(existing.data) : BLANK}
      categories={categories.data ?? []}
    />
  );
}

function BlogFormBody({
  id,
  post,
  initial,
  categories,
}: {
  id?: string;
  post: BlogPost | null;
  initial: FormState;
  categories: Category[];
}) {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const { isAdmin } = useAdmin();
  const [form, setForm] = useState<FormState>(initial);
  const [mode, setMode] = useState<"write" | "preview">("write");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }));
  const words = form.content.trim() ? form.content.trim().split(/\s+/).length : 0;
  const paragraphs = form.content.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const found: Record<string, string> = {};
    if (!form.title.trim()) found.title = "Enter a title.";
    if (!form.content.trim()) found.content = "Write the article text.";
    setErrors(found);
    if (Object.keys(found).length > 0) {
      toast.error("Please fix the highlighted fields.");
      return;
    }
    const body = {
      title: form.title.trim(),
      slug: form.slug.trim() || null,
      excerpt: form.excerpt.trim() || null,
      content: form.content,
      cover_image: form.cover_image,
      category_id: form.category_id || null,
      is_published: form.is_published,
      ...form.seo,
    };
    setSaving(true);
    try {
      await adminApi(id ? `/blog/${id}` : "/blog", { method: id ? "PUT" : "POST", body });
      toast.success(
        id ? "Article saved" : form.is_published ? "Article published" : "Draft saved",
      );
      router.push("/admin/blog");
    } catch (err) {
      toast.error(errorText(err));
      setSaving(false);
    }
  }

  async function remove() {
    const ok = await confirm({
      title: `Delete “${form.title}”?`,
      message: "The article will be permanently removed from the site. This cannot be undone.",
      confirmLabel: "Delete article",
      danger: true,
    });
    if (!ok || !id) return;
    setDeleting(true);
    try {
      await adminApi(`/blog/${id}`, { method: "DELETE" });
      toast.success("Article deleted");
      router.push("/admin/blog");
    } catch (err) {
      toast.error(errorText(err));
      setDeleting(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate>
      <PageHeader
        title={id ? "Edit article" : "New article"}
        description={
          post?.published_at
            ? `First published ${formatDate(post.published_at)}.`
            : "Drafts are saved privately. Turn on “Published” when it is ready."
        }
        actions={
          <>
            <Link
              href="/admin/blog"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </Link>
            <Btn type="submit" loading={saving}>
              {form.is_published ? (id ? "Save changes" : "Publish") : "Save draft"}
            </Btn>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-6">
          <Card>
            <div className="flex flex-col gap-4">
              <Field label="Title" required error={errors.title}>
                {(fid) => <TextInput id={fid} value={form.title} maxLength={220} onChange={(e) => set({ title: e.target.value })} />}
              </Field>
              <Field label="Summary" hint="One or two sentences shown on the blog list and in search previews.">
                {(fid) => (
                  <TextArea id={fid} rows={2} maxLength={400} value={form.excerpt} onChange={(e) => set({ excerpt: e.target.value })} />
                )}
              </Field>
            </div>
          </Card>

          <Card
            title="Article text"
            description="Plain text. Leave a blank line between paragraphs."
            actions={
              <Tabs
                value={mode}
                onChange={setMode}
                tabs={[
                  { value: "write", label: "Write" },
                  { value: "preview", label: "Preview" },
                ]}
              />
            }
          >
            {mode === "write" ? (
              <Field label="Content" required error={errors.content} hint={`${words} words`}>
                {(fid) => (
                  <TextArea
                    id={fid}
                    rows={18}
                    value={form.content}
                    maxLength={100000}
                    onChange={(e) => set({ content: e.target.value })}
                  />
                )}
              </Field>
            ) : (
              <div className="mx-auto flex max-w-2xl flex-col gap-4 leading-relaxed text-slate-700">
                <h2 className="text-2xl font-bold text-slate-900">{form.title || "Untitled article"}</h2>
                {paragraphs.length === 0 ? (
                  <p className="text-sm text-slate-400">Nothing to preview yet.</p>
                ) : (
                  paragraphs.map((p, i) => <p key={i}>{p}</p>)
                )}
              </div>
            )}
          </Card>

          <Card title="Search engine (SEO)">
            <SeoEditor value={form.seo} onChange={(seo) => set({ seo })} />
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card title="Publishing">
            <Toggle
              checked={form.is_published}
              onChange={(v) => set({ is_published: v })}
              label="Published"
              description="When on, the article is visible on the public blog."
            />
          </Card>

          <Card title="Details">
            <div className="flex flex-col gap-4">
              <Field label="Category">
                {(fid) => (
                  <Select id={fid} value={form.category_id} onChange={(e) => set({ category_id: e.target.value })}>
                    <option value="">No category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
              <Field
                label="Web address (slug)"
                hint={`Optional${form.title ? `. Default: ${slugPreview(form.title)}` : ""}`}
              >
                {(fid) => <TextInput id={fid} value={form.slug} maxLength={240} onChange={(e) => set({ slug: e.target.value })} />}
              </Field>
            </div>
          </Card>

          <Card title="Cover image">
            <ImageField label="Image" value={form.cover_image} onChange={(url) => set({ cover_image: url })} />
          </Card>

          {id && isAdmin && (
            <Btn variant="ghost" className="justify-start text-red-600 hover:bg-red-50" icon={<Trash2 size={15} />} loading={deleting} onClick={remove}>
              Delete this article
            </Btn>
          )}
        </div>
      </div>
    </form>
  );
}
