// WhatsApp click-to-chat links. The number always comes from site settings (never hard-coded here).

export const GENERIC_WHATSAPP_MESSAGE =
  "Hello Elite Escape Tourism, I would like to enquire about a travel package.";

export function packageWhatsAppMessage(packageTitle: string) {
  return `Hello Elite Escape Tourism, I am interested in the ${packageTitle} package. Please share more details.`;
}

export function visaWhatsAppMessage(country?: string) {
  return country
    ? `Hello Elite Escape Tourism, I need visa assistance for ${country}. Please guide me on the process.`
    : "Hello Elite Escape Tourism, I need visa assistance. Please guide me on the process.";
}

export function seasonalWhatsAppMessage(tourName: string) {
  return `Hello Elite Escape Tourism, I am interested in the ${tourName} seasonal tour. Please share more details.`;
}

/** Returns null when no number is configured, so callers can hide the button. */
export function whatsappUrl(number: string, message: string): string | null {
  const digits = number.replace(/\D/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function attractionWhatsAppMessage(attraction?: string) {
  return attraction
    ? `Hello Elite Escape Tourism, I would like to include ${attraction} in my UAE trip. Please share the options.`
    : "Hello Elite Escape Tourism, I would like help planning which UAE attractions to include in my trip.";
}
