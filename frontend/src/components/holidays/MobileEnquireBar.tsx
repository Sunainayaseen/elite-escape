// Sticky bottom bar for phones and tablets; the desktop layout has a sticky side panel instead.
// `data-sticky-cta` lets globals.css lift the floating WhatsApp button above this bar.
import { WhatsAppLink } from "@/components/layout/WhatsAppLink";
import { packageWhatsAppMessage } from "@/lib/whatsapp";

export function MobileEnquireBar({ price, title }: { price: string; title: string }) {
  return (
    <div
      data-sticky-cta
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line/10 bg-white/95 px-4 py-3 shadow-[0_-8px_24px_rgba(15,27,43,0.08)] backdrop-blur-md lg:hidden"
    >
      <div className="mx-auto flex max-w-xl items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] text-text-muted">Per person</p>
          <p className="truncate font-serif text-base font-semibold text-text-ink">{price}</p>
        </div>
        <WhatsAppLink
          message={packageWhatsAppMessage(title)}
          fallbackHref="#enquire"
          className="inline-flex shrink-0 items-center justify-center rounded-full bg-brand-navy-accent px-6 py-3 text-sm font-semibold text-white transition-colors duration-300 hover:bg-brand-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal-light"
        >
          Enquire Now
        </WhatsAppLink>
      </div>
    </div>
  );
}
