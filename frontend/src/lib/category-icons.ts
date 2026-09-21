import {
  Compass,
  Landmark,
  Mountain,
  Palmtree,
  Plane,
  Star,
  Wallet,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  Wallet,
  Landmark,
  Palmtree,
  Plane,
  Star,
  Mountain,
  Compass,
};

export const CATEGORY_ICON_NAMES = Object.keys(ICONS);

export function categoryIcon(name: string | null | undefined): LucideIcon {
  return (name && ICONS[name]) || Compass;
}
