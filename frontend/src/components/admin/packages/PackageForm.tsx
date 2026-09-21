"use client";

import { ExternalLink, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useMemo, useState } from "react";

import {
  EMPTY_SEO,
  GalleryField,
  ImageField,
  Repeater,
  SeoEditor,
  StringListEditor,
  pickSeo,
} from "@/components/admin/forms";
import { useToast } from "@/components/admin/overlays";
import { Btn, Card, Field, PackageStatusBadge, Select, TextArea, TextInput, Toggle } from "@/components/admin/ui";
import { adminApi, errorText } from "@/lib/admin/client";
import { useAdminQuery } from "@/lib/admin/hooks";
import type {
  AdminPackage,
  Category,
  Destination,
  FaqItem,
  ItineraryDay,
  OptionalExperience,
  PackageStatus,
  SeoFields,
} from "@/lib/admin/types";

type FormState = {
  title: string;
  slug: string;
  category_id: string;
  destination_id: string;
  country: string;
  tour_types: string[];
  duration: string;
  group_size: string;
  price_from: string;
  price_to: string;
  currency: string;
  summary: string;
  description: string;
  main_image: string | null;
  images: string[];
  highlights: string[];
  inclusions: string[];
  exclusions: string[];
  itinerary: { title: string; description: string }[];
  accommodation: string;
  transportation: string;
  optional_experiences: { title: string; description: string }[];
  important_notes: string;
  faq: FaqItem[];
  status: PackageStatus;
  is_featured: boolean;
  position: string;
  seo: SeoFields;
};

const CURRENCIES = ["AED", "USD", "EUR", "GBP", "PKR", "SAR"];
const TOUR_TYPE_SUGGESTIONS = ["Private", "Group", "Family", "Couples", "Honeymoon", "Adventure", "Luxury", "Budget"];

const BLANK: FormState = {
  title: "",
  slug: "",
  category_id: "",
  destination_id: "",
  country: "",
  tour_types: [],
  duration: "",
  group_size: "",
  price_from: "",
  price_to: "",
  currency: "AED",
  summary: "",
  description: "",
  main_image: null,
  images: [],
  highlights: [],
  inclusions: [],
  exclusions: [],
  itinerary: [],
  accommodation: "",
  transportation: "",
  optional_experiences: [],
  important_notes: "",
  faq: [],
  status: "draft",
  is_featured: false,
  position: "0",
  seo: EMPTY_SEO,
};

function fromPackage(p: AdminPackage): FormState {
  return {
    title: p.title,
    slug: p.slug,
    category_id: p.category_id,
    destination_id: p.destination_id ?? "",
    country: p.country,
    tour_types: p.tour_types,
    duration: p.duration,
    group_size: p.group_size ?? "",
    price_from: String(p.price_from),
    price_to: String(p.price_to),
    currency: p.currency,
    summary: p.summary,
    description: p.description ?? "",
    main_image: p.main_image,
    images: p.images,
    highlights: p.highlights,
    inclusions: p.inclusions,
    exclusions: p.exclusions,
    itinerary: p.itinerary.map((d: ItineraryDay) => ({ title: d.title, description: d.description })),
    accommodation: p.accommodation ?? "",
    transportation: p.transportation ?? "",
    optional_experiences: p.optional_experiences.map((o: OptionalExperience) => ({ title: o.title, description: o.description ?? "" })),
    important_notes: p.important_notes ?? "",
    faq: p.faq,
    status: p.status,
    is_featured: p.is_featured,
    position: String(p.position),
    seo: pickSeo(p),
  };
}

const nz = (value: string): string | null => (value.trim() === "" ? null : value.trim());

function toPayload(f: FormState) {
  return {
    title: f.title.trim(),
    slug: nz(f.slug),
    category_id: f.category_id,
    destination_id: f.destination_id || null,
    country: f.destination_id ? null : nz(f.country),
    summary: f.summary.trim(),
    description: nz(f.description),
    price_from: Number(f.price_from),
    price_to: Number(f.price_to),
    currency: f.currency.trim().toUpperCase(),
    duration: f.duration.trim(),
    tour_types: f.tour_types,
    group_size: nz(f.group_size),
    main_image: f.main_image,
    images: f.images,
    highlights: f.highlights,
    // Day numbers simply follow the order on screen.
    itinerary: f.itinerary.map((d, i) => ({ day: i + 1, title: d.title.trim(), description: d.description.trim() })),
    inclusions: f.inclusions,
    exclusions: f.exclusions,
    accommodation: nz(f.accommodation),
    transportation: nz(f.transportation),
    optional_experiences: f.optional_experiences.map((o) => ({ title: o.title.trim(), description: nz(o.description) })),
    important_notes: nz(f.important_notes),
    faq: f.faq.map((q) => ({ question: q.question.trim(), answer: q.answer.trim() })),
    status: f.status,
    is_featured: f.is_featured,
    position: Math.max(0, Math.round(Number(f.position) || 0)),
    ...f.seo,
  };
}

function validate(f: FormState): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!f.title.trim()) errors.title = "Enter the package name";
  if (!f.category_id) errors.category_id = "Choose a category";
  if (!f.destination_id && !f.country.trim()) errors.country = "Choose a destination or type the country";
  if (!f.duration.trim()) errors.duration = "Enter the duration, e.g. 5 Nights / 6 Days";
  const from = Number(f.price_from);
  const to = Number(f.price_to);
  if (!(from > 0)) errors.price_from = "Enter a price above 0";
  if (!(to > 0)) errors.price_to = "Enter a price above 0";
  else if (to < from) errors.price_to = "Must be the same as or higher than the starting price";
  if (!/^[A-Za-z]{3}$/.test(f.currency.trim())) errors.currency = "3-letter code, e.g. AED";
  if (!f.summary.trim()) errors.summary = "Write a short description";
  if (!f.main_image) errors.main_image = "Add a main image";
  if (f.itinerary.some((d) => !d.title.trim())) errors.itinerary = "Every itinerary day needs a title";
  if (f.optional_experiences.some((o) => !o.title.trim())) errors.optional_experiences = "Every optional experience needs a title";
  if (f.faq.some((q) => !q.question.trim() || !q.answer.trim())) errors.faq = "Every FAQ needs a question and an answer";
  return errors;
}

export function PackageForm({ pkg, onSaved }: { pkg?: AdminPackage; onSaved?: () => void }) {
  const router = useRouter();
  const toast = useToast();
  const initial = useMemo(() => (pkg ? fromPackage(pkg) : BLANK), [pkg]);
  const [form, setForm] = useState<FormState>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const categories = useAdminQuery<Category[]>("/categories?section=holidays");
  const destinations = useAdminQuery<Destination[]>("/destinations");

  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(initial), [form, initial]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));
  const err = (key: string) => errors[key] ?? null;

  async function submit() {
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      toast.error("Please fix the highlighted fields:\n" + Object.values(found).slice(0, 4).join("\n"));
      document.querySelector("[data-invalid]")?.scrollIntoView({ block: "center", behavior: "smooth" });
      return;
    }
    setSaving(true);
    try {
      if (pkg) {
        await adminApi<AdminPackage>(`/packages/${pkg.id}`, { method: "PUT", body: toPayload(form) });
        toast.success("Package saved. The website now shows your changes.");
        setSaving(false);
        onSaved?.();
      } else {
        const created = await adminApi<AdminPackage>("/packages", { method: "POST", body: toPayload(form) });
        toast.success(created.status === "published" ? "Package created and live on the website" : "Package created");
        router.replace(`/admin/packages/${created.id}`);
      }
    } catch (e) {
      toast.error(errorText(e));
      setSaving(false);
    }
  }

  const invalid = (key: string) => (errors[key] ? { "data-invalid": true } : {});
  const publicUrl = pkg && pkg.status === "published" && !pkg.deleted_at ? `/holidays/${pkg.category}/${pkg.slug}` : null;

  const section = (title: string, description: string | undefined, body: ReactNode) => (
    <Card title={title} description={description}>
      <div className="flex flex-col gap-5">{body}</div>
    </Card>
  );

  return (
    <div className="flex flex-col gap-6 pb-28">
      {pkg && (
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
          <PackageStatusBadge status={pkg.status} archived={!!pkg.deleted_at} />
          <span>/holidays/{pkg.category}/{pkg.slug}</span>
          {publicUrl && (
            <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-brand-blue hover:underline">
              View on website <ExternalLink size={13} />
            </a>
          )}
        </div>
      )}

      {section("Basics", undefined, (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field label="Package name" required error={err("title")} className="md:col-span-2">
            {(id) => <TextInput id={id} {...invalid("title")} value={form.title} maxLength={200} onChange={(e) => set("title", e.target.value)} />}
          </Field>
          <Field label="Category" required error={err("category_id")} hint="Where it appears on the Holidays page.">
            {(id) => (
              <Select id={id} {...invalid("category_id")} value={form.category_id} onChange={(e) => set("category_id", e.target.value)}>
                <option value="">Choose a category…</option>
                {categories.data?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="Destination" hint="Optional. Linking a destination keeps the place name in sync with it.">
            {(id) => (
              <Select id={id} value={form.destination_id} onChange={(e) => set("destination_id", e.target.value)}>
                <option value="">Not linked</option>
                {destinations.data?.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          {!form.destination_id && (
            <Field label="Country / place name" required error={err("country")} hint="Shown on the package card. Not needed when a destination is linked.">
              {(id) => <TextInput id={id} {...invalid("country")} value={form.country} maxLength={120} onChange={(e) => set("country", e.target.value)} />}
            </Field>
          )}
          <Field label="Duration" required error={err("duration")}>
            {(id) => (
              <TextInput id={id} {...invalid("duration")} placeholder="5 Nights / 6 Days" value={form.duration} maxLength={60} onChange={(e) => set("duration", e.target.value)} />
            )}
          </Field>
          <Field label="Group size" hint="Optional, e.g. 2–12 guests">
            {(id) => <TextInput id={id} value={form.group_size} maxLength={60} onChange={(e) => set("group_size", e.target.value)} />}
          </Field>
          <Field label="Starting price (per person)" required error={err("price_from")}>
            {(id) => <TextInput id={id} {...invalid("price_from")} type="number" min={0} step="1" inputMode="decimal" value={form.price_from} onChange={(e) => set("price_from", e.target.value)} />}
          </Field>
          <Field label="Highest price (per person)" required error={err("price_to")} hint="Use the same number if the price is fixed.">
            {(id) => <TextInput id={id} {...invalid("price_to")} type="number" min={0} step="1" inputMode="decimal" value={form.price_to} onChange={(e) => set("price_to", e.target.value)} />}
          </Field>
          <Field label="Currency" required error={err("currency")}>
            {(id) => (
              <>
                <TextInput id={id} {...invalid("currency")} list="currency-options" maxLength={3} value={form.currency} onChange={(e) => set("currency", e.target.value.toUpperCase())} />
                <datalist id="currency-options">
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </>
            )}
          </Field>
          <div className="md:col-span-2">
            <StringListEditor
              label="Tour type"
              items={form.tour_types}
              onChange={(v) => set("tour_types", v)}
              placeholder="e.g. Private, Family, Honeymoon"
              hint={`Ideas: ${TOUR_TYPE_SUGGESTIONS.join(", ")}`}
            />
          </div>
        </div>
      ))}

      {section("Descriptions", undefined, (
        <>
          <Field label="Short description" required error={err("summary")} hint="One or two sentences shown on cards and search results.">
            {(id) => <TextArea id={id} {...invalid("summary")} rows={3} maxLength={1000} value={form.summary} onChange={(e) => set("summary", e.target.value)} />}
          </Field>
          <Field label="Full description" hint="Optional longer overview. Leave a blank line between paragraphs.">
            {(id) => <TextArea id={id} rows={8} value={form.description} onChange={(e) => set("description", e.target.value)} />}
          </Field>
        </>
      ))}

      {section("Images", "Uploads are optimised automatically (WebP, several sizes).", (
        <>
          <div {...invalid("main_image")}>
            <ImageField label="Main image" required value={form.main_image} onChange={(v) => set("main_image", v)} hint={err("main_image") ?? "The large picture at the top of the package page and on its card."} />
          </div>
          <GalleryField label="Gallery images" value={form.images} onChange={(v) => set("images", v)} />
        </>
      ))}

      {section("What's included", undefined, (
        <>
          <StringListEditor label="Highlights" items={form.highlights} onChange={(v) => set("highlights", v)} placeholder="e.g. Kazbegi day trip" />
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <StringListEditor label="What's included" items={form.inclusions} onChange={(v) => set("inclusions", v)} placeholder="e.g. Airport transfers" />
            <StringListEditor label="What's not included" items={form.exclusions} onChange={(v) => set("exclusions", v)} placeholder="e.g. Travel insurance" />
          </div>
        </>
      ))}

      {section("Itinerary", "Days are numbered in the order shown here.", (
        <div {...invalid("itinerary")}>
          <Repeater<{ title: string; description: string }>
            label="Day-by-day plan"
            items={form.itinerary}
            onChange={(v) => set("itinerary", v)}
            newItem={() => ({ title: "", description: "" })}
            addLabel="Add day"
            itemLabel={(i) => `Day ${i + 1}`}
            render={(item, update) => (
              <div className="flex flex-col gap-2">
                <TextInput aria-label="Day title" placeholder="Title, e.g. Arrival in Tbilisi" value={item.title} maxLength={200} onChange={(e) => update({ title: e.target.value })} />
                <TextArea aria-label="Day description" rows={2} placeholder="What happens on this day" value={item.description} onChange={(e) => update({ description: e.target.value })} />
              </div>
            )}
          />
          {err("itinerary") && <p className="mt-1 text-xs text-red-600">{err("itinerary")}</p>}
        </div>
      ))}

      {section("Stay, transport & extras", "Only fill in what you can state accurately. Empty sections are hidden on the website.", (
        <>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Accommodation">
              {(id) => <TextArea id={id} rows={3} placeholder="e.g. 4-star hotel stays" value={form.accommodation} onChange={(e) => set("accommodation", e.target.value)} />}
            </Field>
            <Field label="Transportation">
              {(id) => <TextArea id={id} rows={3} placeholder="e.g. Private airport transfers" value={form.transportation} onChange={(e) => set("transportation", e.target.value)} />}
            </Field>
          </div>
          <div {...invalid("optional_experiences")}>
            <Repeater<{ title: string; description: string }>
              label="Optional experiences"
              items={form.optional_experiences}
              onChange={(v) => set("optional_experiences", v)}
              newItem={() => ({ title: "", description: "" })}
              addLabel="Add experience"
              itemLabel={(i) => `Experience ${i + 1}`}
              render={(item, update) => (
                <div className="flex flex-col gap-2">
                  <TextInput aria-label="Experience title" placeholder="Title" value={item.title} maxLength={150} onChange={(e) => update({ title: e.target.value })} />
                  <TextArea aria-label="Experience description" rows={2} placeholder="Description (optional)" value={item.description} onChange={(e) => update({ description: e.target.value })} />
                </div>
              )}
            />
            {err("optional_experiences") && <p className="mt-1 text-xs text-red-600">{err("optional_experiences")}</p>}
          </div>
          <Field label="Important notes">
            {(id) => <TextArea id={id} rows={3} value={form.important_notes} onChange={(e) => set("important_notes", e.target.value)} />}
          </Field>
          <div {...invalid("faq")}>
            <Repeater<FaqItem>
              label="FAQ"
              items={form.faq}
              onChange={(v) => set("faq", v)}
              newItem={() => ({ question: "", answer: "" })}
              addLabel="Add question"
              itemLabel={(i) => `Question ${i + 1}`}
              render={(item, update) => (
                <div className="flex flex-col gap-2">
                  <TextInput aria-label="Question" placeholder="Question" value={item.question} maxLength={250} onChange={(e) => update({ question: e.target.value })} />
                  <TextArea aria-label="Answer" rows={2} placeholder="Answer" value={item.answer} onChange={(e) => update({ answer: e.target.value })} />
                </div>
              )}
            />
            {err("faq") && <p className="mt-1 text-xs text-red-600">{err("faq")}</p>}
          </div>
        </>
      ))}

      {section("Visibility & order", undefined, (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field label="Status" hint="Only Published packages appear on the website. Drafts and unpublished packages stay private.">
            {(id) => (
              <Select id={id} value={form.status} onChange={(e) => set("status", e.target.value as PackageStatus)}>
                <option value="draft">Draft (not on the website)</option>
                <option value="published">Published (live on the website)</option>
                <option value="unpublished">Unpublished (hidden)</option>
              </Select>
            )}
          </Field>
          <Field label="Position" hint="Lower numbers appear first. You can also reorder from the package list.">
            {(id) => <TextInput id={id} type="number" min={0} value={form.position} onChange={(e) => set("position", e.target.value)} />}
          </Field>
          <div className="md:col-span-2">
            <Toggle checked={form.is_featured} onChange={(v) => set("is_featured", v)} label="Featured" description="Featured packages can be highlighted on the home page." />
          </div>
          <Field label="Web address (slug)" className="md:col-span-2" hint={pkg ? "Changing this changes the package's public link." : "Optional. Leave empty to create it from the package name."}>
            {(id) => <TextInput id={id} value={form.slug} maxLength={220} onChange={(e) => set("slug", e.target.value)} />}
          </Field>
        </div>
      ))}

      {section("Search engine (SEO)", undefined, <SeoEditor value={form.seo} onChange={(v) => set("seo", v)} />)}

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur lg:left-64">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <p className="text-xs text-slate-500">
            {dirty ? "You have unsaved changes." : pkg ? "All changes saved." : "Fill in the required fields to create the package."}
          </p>
          <div className="flex gap-2">
            <Link href="/admin/packages" className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              {pkg ? "Back to packages" : "Cancel"}
            </Link>
            <Btn loading={saving} icon={<Save size={15} />} onClick={submit}>
              {pkg ? "Save changes" : "Create Package"}
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}
