// Passport-stamp artwork for the Visa page hero. Purely decorative; the labels are generic
// (no claims about approvals or processing).
export function Stamp({
  id,
  text,
  className,
}: {
  id: string;
  text: string;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 200 200" className={className} fill="none" stroke="currentColor" aria-hidden>
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
