// WhatsApp click-to-chat links. The number always comes from site settings (never hard-coded here).

export const GENERIC_WHATSAPP_MESSAGE =
  "Hello Elite Escape Tourism, I would like to enquire about a travel package.";

export function packageWhatsAppMessage(packageTitle: string) {
  return `Hello Elite Escape Tourism, I am interested in the ${packageTitle} package. Please share more details.`;
}

/** Returns null when no number is configured, so callers can hide the button. */
export function whatsappUrl(number: string, message: string): string | null {
  const digits = number.replace(/\D/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
