/** Static CSS globe: the loading state and the no-WebGL / low-power fallback. No JS, no canvas. */
export function GlobeFallback({ className }: { className?: string }) {
  return (
    <div aria-hidden className={`relative aspect-square w-full ${className ?? ""}`}>
      <div
        className="absolute inset-[3%] rounded-full"
        style={{
          background:
            "radial-gradient(circle at 34% 28%, #2f7fb0 0%, #174a72 38%, #0b2340 72%, #08172b 100%)",
          boxShadow:
            "0 0 90px rgba(39,179,207,0.28), inset -34px -34px 90px rgba(0,0,0,0.55), inset 12px 12px 50px rgba(92,195,239,0.18)",
        }}
      />
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-[3%] text-white/15"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.3"
      >
        <ellipse cx="50" cy="50" rx="47" ry="47" />
        <ellipse cx="50" cy="50" rx="24" ry="47" />
        <ellipse cx="50" cy="50" rx="47" ry="20" />
        <path d="M3 50h94M50 3v94" />
      </svg>
    </div>
  );
}
