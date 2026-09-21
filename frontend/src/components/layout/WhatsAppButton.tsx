import { GENERIC_WHATSAPP_MESSAGE, whatsappUrl } from "@/lib/whatsapp";

export function WhatsAppButton({ number }: { number: string }) {
  const href = whatsappUrl(number, GENERIC_WHATSAPP_MESSAGE);
  if (!href) return null;

  return (
    <a
      data-whatsapp-float
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_8px_24px_rgba(37,211,102,0.4)] transition-transform duration-200 hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6" aria-hidden="true">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.84.5 3.56 1.38 5.03L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.92C21.96 6.45 17.5 2 12.04 2Zm5.8 14.02c-.24.68-1.42 1.3-1.96 1.38-.5.08-1.13.11-1.83-.12-.42-.13-.96-.31-1.65-.6-2.9-1.25-4.8-4.15-4.94-4.34-.15-.19-1.18-1.57-1.18-3 0-1.42.75-2.12 1.01-2.41.27-.29.58-.36.78-.36.19 0 .39.002.56.01.18.008.42-.07.66.5.24.58.83 2.02.9 2.17.08.15.13.32.03.51-.1.19-.15.31-.3.48-.15.17-.3.38-.44.5-.15.13-.3.28-.13.56.17.29.75 1.24 1.62 2.01 1.12.99 2.05 1.31 2.35 1.46.3.14.47.12.65-.05.18-.17.75-.87.95-1.17.2-.3.4-.24.68-.14.28.1 1.79.85 2.1 1 .31.15.51.23.59.36.08.14.08.78-.16 1.46Z" />
      </svg>
    </a>
  );
}
