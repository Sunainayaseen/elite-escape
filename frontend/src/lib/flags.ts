// Windows has no flag emoji font (it shows "AU", "CA"...), so flags are self-hosted SVGs from
// flag-icons (public/flags, MIT). The ISO code is read back out of the stored emoji's two
// regional-indicator characters, so the admin form keeps working unchanged.
export function flagCode(emoji: string | null | undefined) {
  const points = [...(emoji ?? "")].map((ch) => ch.codePointAt(0) ?? 0);
  if (points.length !== 2 || points.some((cp) => cp < 0x1f1e6 || cp > 0x1f1ff)) return null;
  return points.map((cp) => String.fromCharCode(cp - 0x1f1e6 + 97)).join("");
}

export function flagSrc(emoji: string | null | undefined) {
  const code = flagCode(emoji);
  return code ? `/flags/${code}.svg` : null;
}
