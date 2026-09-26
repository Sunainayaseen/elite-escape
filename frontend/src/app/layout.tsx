import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { WhatsAppProvider } from "@/components/layout/WhatsAppLink";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { getBlogPosts, getPackages, getSiteSettings } from "@/lib/data";
import { toMenuPackages } from "@/lib/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationSchema, SITE_DESCRIPTION, SITE_TITLE } from "@/lib/seo";
import { SITE_URL } from "@/lib/site-url";

// Self-hosted variable fonts (latin subset), so builds and dev never depend on reaching Google Fonts.
const fraunces = localFont({
  variable: "--font-fraunces",
  display: "swap",
  src: [
    { path: "./fonts/fraunces.woff2", weight: "400 700", style: "normal" },
    { path: "./fonts/fraunces-italic.woff2", weight: "400 700", style: "italic" },
  ],
  fallback: ["Georgia", "serif"],
});

const manrope = localFont({
  variable: "--font-manrope",
  display: "swap",
  src: [{ path: "./fonts/manrope.woff2", weight: "400 800", style: "normal" }],
  fallback: ["Arial", "Helvetica", "sans-serif"],
});

// Marks the page as script-capable so scroll reveals may hide content until they animate it in.
// If hydration has not started within 3.5s the marker is removed and everything shows, so a
// failed or very slow script bundle can never leave content invisible.
const JS_FLAG = `document.documentElement.classList.add("js");setTimeout(function(){if(!window.__reveal)document.documentElement.classList.remove("js")},3500);`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  alternates: { canonical: "./" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Elite Escape Tourism",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [settings, posts, packages] = await Promise.all([
    getSiteSettings(),
    getBlogPosts(),
    getPackages(),
  ]);

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fraunces.variable} ${manrope.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: JS_FLAG }} />
      </head>
      <body className="relative min-h-full flex flex-col bg-bg-deepest text-text-ink">
        <JsonLd
          data={organizationSchema([settings.instagram_url, settings.facebook_url, settings.x_url])}
        />
        <MotionProvider>
        <WhatsAppProvider number={settings.whatsapp_number}>
        <SiteChrome
          header={<Header packages={toMenuPackages(packages)} />}
          footer={<Footer settings={settings} hasBlog={posts.length > 0} />}
          floating={
            <>
              <WhatsAppButton number={settings.whatsapp_number} />
              <ScrollToTop />
            </>
          }
        >
          {children}
        </SiteChrome>
        </WhatsAppProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
