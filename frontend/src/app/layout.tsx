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

const SITE_TITLE = "Elite Escape Tourism | Holiday Packages & Visa Assistance";
const SITE_DESCRIPTION =
  "Elite Escape Tourism offers holiday packages, visa assistance, attractions and seasonal tours, with offices in Dubai and Lahore.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
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
      className={`${fraunces.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="relative min-h-full flex flex-col bg-bg-deepest text-text-ink">
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
