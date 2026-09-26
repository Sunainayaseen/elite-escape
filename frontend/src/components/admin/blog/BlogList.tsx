"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { useAdmin } from "@/components/admin/AdminShell";
import { BlogCategories } from "@/components/admin/blog/BlogCategories";
import { useConfirm, useToast } from "@/components/admin/overlays";
import {
  Badge,
  Btn,
  Card,
  DataTable,
  EmptyState,
  ErrorState,
  PageHeader,
  SearchInput,
  Select,
  Spinner,
  Tabs,
  tdCls,
  thCls,
} from "@/components/admin/ui";
import { adminApi, errorText } from "@/lib/admin/client";
import { formatDate } from "@/lib/admin/format";
import { useAdminQuery } from "@/lib/admin/hooks";
import type { BlogPost } from "@/lib/admin/types";

type Tab = "posts" | "categories";

export function BlogList() {
  const { isAdmin } = useAdmin();
  const toast = useToast();
  const confirm = useConfirm();
  const [tab, setTab] = useState<Tab>("posts");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [state, setState] = useState<"all" | "published" | "draft">("all");
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setQuery(search.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const qs = new URLSearchParams();
  if (query) qs.set("q", query);
  if (state !== "all") qs.set("published", String(state === "published"));
  const { data, error, loading, reload } = useAdminQuery<BlogPost[]>(tab === "posts" ? `/blog?${qs.toString()}` : null);

  async function remove(post: BlogPost) {
    const ok = await confirm({
      title: `Delete “${post.title}”?`,
      message: "The article will be permanently removed from the site. This cannot be undone.",
      confirmLabel: "Delete article",
      danger: true,
    });
    if (!ok) return;
    setBusyId(post.id);
    try {
      await adminApi(`/blog/${post.id}`, { method: "DELETE" });
      toast.success("Article deleted");
      reload();
    } catch (err) {
      toast.error(errorText(err));
    } finally {
      setBusyId(null);
    }
  }

  const filtering = Boolean(query) || state !== "all";

  return (
    <>
      <PageHeader
        title="Blog"
        description="Travel guides and advice. Articles appear on the public blog once published."
        actions={
          <Link
            href="/admin/blog/new"
            className="inline-flex items-center gap-2 rounded-xl bg-[#081a2c] px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-slate-900/10 transition-colors hover:bg-[#12314d]"
          >
            <Plus size={16} />
            New article
          </Link>
        }
      />

      <div className="mb-5">
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { value: "posts", label: "Articles" },
            { value: "categories", label: "Categories" },
          ]}
        />
      </div>

      {tab === "categories" ? (
        <BlogCategories />
      ) : (
        <Card>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[2fr_1fr]">
              <SearchInput value={search} onChange={setSearch} placeholder="Search articles…" />
              <Select aria-label="Filter by status" value={state} onChange={(e) => setState(e.target.value as typeof state)}>
                <option value="all">Published and drafts</option>
                <option value="published">Published</option>
                <option value="draft">Drafts</option>
              </Select>
            </div>

            {loading ? (
              <Spinner />
            ) : error ? (
              <ErrorState message={error} onRetry={reload} />
            ) : !data || data.length === 0 ? (
              <EmptyState
                title={filtering ? "No articles match your filters" : "No articles yet"}
                description={filtering ? undefined : "Write your first travel guide. Nothing is published until you say so."}
                action={
                  filtering ? undefined : (
                    <Link href="/admin/blog/new" className="text-sm font-semibold text-brand-blue hover:underline">
                      Write an article
                    </Link>
                  )
                }
              />
            ) : (
              <DataTable>
                <thead className="border-b border-slate-200">
                  <tr>
                    <th className={thCls}>Title</th>
                    <th className={thCls}>Category</th>
                    <th className={thCls}>Status</th>
                    <th className={thCls}>Published</th>
                    <th className={thCls} />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.map((post) => (
                    <tr key={post.id} className="hover:bg-slate-50">
                      <td className={`${tdCls} max-w-sm`}>
                        <Link href={`/admin/blog/${post.id}`} className="font-medium text-slate-900 hover:text-brand-blue">
                          {post.title}
                        </Link>
                        <p className="truncate text-xs text-slate-500">/blog/{post.slug}</p>
                      </td>
                      <td className={tdCls}>{post.category?.name ?? "—"}</td>
                      <td className={tdCls}>
                        <Badge tone={post.is_published ? "green" : "amber"}>{post.is_published ? "Published" : "Draft"}</Badge>
                      </td>
                      <td className={tdCls}>{formatDate(post.published_at)}</td>
                      <td className={`${tdCls} text-right`}>
                        <div className="flex justify-end gap-1">
                          <Link
                            href={`/admin/blog/${post.id}`}
                            aria-label={`Edit ${post.title}`}
                            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                          >
                            <Pencil size={15} />
                          </Link>
                          {isAdmin && (
                            <Btn
                              variant="ghost"
                              size="sm"
                              aria-label={`Delete ${post.title}`}
                              loading={busyId === post.id}
                              icon={<Trash2 size={15} />}
                              className="text-red-600 hover:bg-red-50"
                              onClick={() => remove(post)}
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </DataTable>
            )}
          </div>
        </Card>
      )}
    </>
  );
}
