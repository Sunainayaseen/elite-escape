import type { NextConfig } from "next";

// Old WordPress URLs (eliteescapetourism.com before the rebuild) -> new routes, so existing search
// rankings and inbound links keep working. The injected casino/spam URLs are deliberately NOT
// redirected: they should return 404/410 so search engines drop them.
const LEGACY_REDIRECTS = [
  // Package pages: /tour/<slug>/ -> /holidays/<category>/<slug>
  { source: "/tour/japan-tour-package", destination: "/holidays/asia/japan-tour-package" },
  { source: "/tour/bali-tour-package", destination: "/holidays/asia/bali-tour-package" },
  { source: "/tour/georgia-armenia", destination: "/holidays/caucasus/georgia-armenia" },
  { source: "/tour/russia-tour-package", destination: "/holidays/europe/russia-tour-package" },
  { source: "/tour/uk-tour-package", destination: "/holidays/europe/uk-tour-package" },
  {
    source: "/tour/paris-france-tour-package",
    destination: "/holidays/europe/paris-france-tour-package",
  },
  // Destination pages: /destination/<name>/ -> the matching package (or region)
  { source: "/destination/japan", destination: "/holidays/asia/japan-tour-package" },
  { source: "/destination/indonesia", destination: "/holidays/asia/bali-tour-package" },
  { source: "/destination/georgia", destination: "/holidays/caucasus/georgia-armenia" },
  { source: "/destination/armenia", destination: "/holidays/caucasus/georgia-armenia" },
  { source: "/destination/russia", destination: "/holidays/europe/russia-tour-package" },
  { source: "/destination/united-kingdom", destination: "/holidays/europe/uk-tour-package" },
  { source: "/destination/paris", destination: "/holidays/europe/paris-france-tour-package" },
  { source: "/destination", destination: "/holidays" },
  { source: "/destination/:path*", destination: "/holidays" },
  // Top-level pages (note the live site's "visa-assitance" typo)
  { source: "/visa-assitance", destination: "/global-visa" },
  { source: "/visa-assistance", destination: "/global-visa" },
  { source: "/seasonal-package", destination: "/seasonal-tours" },
  { source: "/about-us-2", destination: "/about" },
  { source: "/contact-us-2", destination: "/contact" },
];

// The admin dashboard talks to the backend through this site's own origin, so its HttpOnly session
// cookie is a plain first-party cookie (no cross-site cookie rules, no CORS). Uploaded images are
// served the same way, which keeps their stored paths ("/uploads/...") independent of the API host.
const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "");

const nextConfig: NextConfig = {
  async redirects() {
    return LEGACY_REDIRECTS.map((r) => ({ ...r, permanent: true }));
  },
  async rewrites() {
    return [
      { source: "/api/admin/:path*", destination: `${API_ORIGIN}/api/admin/:path*` },
      { source: "/uploads/:path*", destination: `${API_ORIGIN}/uploads/:path*` },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
};

export default nextConfig;
