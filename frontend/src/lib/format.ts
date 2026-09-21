import type { Package } from "@/lib/types";

const number = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

export function formatPrice(pkg: Pick<Package, "price_from" | "price_to" | "currency">): string {
  const from = number.format(pkg.price_from);
  if (pkg.price_to <= pkg.price_from) return `${pkg.currency} ${from}`;
  return `${pkg.currency} ${from} – ${number.format(pkg.price_to)}`;
}
