import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { getBlogPosts, getSiteSettings } from "@/lib/data";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationSchema, SITE_DESCRIPTION, SITE_TITLE } from "@/lib/seo";
import { SITE_URL } from "@/lib/site-url";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
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
  const [settings, posts] = await Promise.all([getSiteSettings(), getBlogPosts()]);

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
        <SiteChrome
          header={<Header />}
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
        </MotionProvider>
      </body>
    </html>
  );
}
