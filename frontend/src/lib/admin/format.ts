const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });
const dateTimeFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

// The API returns naive UTC timestamps (no zone suffix); tell the browser so it converts to local time.
function parse(value: string): Date {
  return new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(value) ? value : `${value}Z`);
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  // Plain calendar dates (travel dates) must not shift with the time zone.
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split("-").map(Number);
    return dateFmt.format(new Date(y, m - 1, d));
  }
  return dateFmt.format(parse(value));
}

export function formatDateTime(value: string | null | undefined): string {
  return value ? dateTimeFmt.format(parse(value)) : "—";
}

export function formatPrice(currency: string, from: number, to: number): string {
  const n = (v: number) => new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(v);
  return from === to ? `${currency} ${n(from)}` : `${currency} ${n(from)} – ${n(to)}`;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function slugPreview(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[^\x00-\x7F]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
