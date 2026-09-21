import { FloatingElement } from "@/components/motion/FloatingElement";
import { PointerLayer, PointerScene } from "@/components/motion/PointerScene";

// Passport-stamp artwork for the Visa page hero: circular ink stamps drifting at different depths.
// Purely decorative; the labels are generic (no claims about approvals or processing).
function Stamp({
  id,
  text,
  className,
}: {
  id: string;
  text: string;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 200 200" className={className} fill="none" stroke="currentColor">
      <defs>
        <path id={id} d="M100 100 m-72 0 a72 72 0 1 1 144 0 a72 72 0 1 1 -144 0" />
      </defs>
      <circle cx="100" cy="100" r="92" strokeWidth="2.5" />
      <circle cx="100" cy="100" r="84" strokeWidth="1" strokeDasharray="3 5" />
      <circle cx="100" cy="100" r="46" strokeWidth="1.5" />
      <text fill="currentColor" stroke="none" fontSize="15" letterSpacing="5" fontWeight="700">
        <textPath href={`#${id}`}>{text}</textPath>
      </text>
      <path d="M100 68v64M68 100h64" strokeWidth="1" opacity="0.5" />
      <path d="M100 78 108 100 100 122 92 100Z" fill="currentColor" stroke="none" opacity="0.6" />
    </svg>
  );
}

export function VisaStamps() {
  return (
    <PointerScene className="pointer-events-none hidden sm:block">
      <PointerLayer depth={10} className="absolute inset-0">
        <FloatingElement className="absolute -left-6 top-24 text-brand-teal-light/25 lg:left-[6%]" duration={12}>
          <Stamp id="stamp-a" text="ENTRY • VISA • TRAVEL •" className="h-40 w-40 -rotate-12 lg:h-52 lg:w-52" />
        </FloatingElement>
      </PointerLayer>
      <PointerLayer depth={22} className="absolute inset-0">
        <FloatingElement
          className="absolute -right-4 bottom-8 text-white/15 lg:right-[7%]"
          duration={14}
          delay={2}
        >
          <Stamp id="stamp-b" text="ELITE ESCAPE • GLOBAL •" className="h-36 w-36 rotate-12 lg:h-48 lg:w-48" />
        </FloatingElement>
      </PointerLayer>
    </PointerScene>
  );
}
