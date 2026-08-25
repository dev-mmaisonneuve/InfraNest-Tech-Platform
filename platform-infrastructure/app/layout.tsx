import type { Metadata } from "next";
import Script from "next/script";
import { Inter, Outfit, Instrument_Serif } from "next/font/google";

import { RevealObserver } from "@/components/reveal-observer";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { BackToTop } from "@/components/back-to-top";
import { company } from "@/data/site-content";
import { brandAssets } from "@/lib/brand-assets";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  weight: ["600", "700", "800", "900"],
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-serif",
  style: ["normal", "italic"],
  weight: "400",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "InfraNest Technologies | Premium IT Operations and Cloud Support",
    template: "%s | InfraNest Technologies",
  },
  description:
    "InfraNest helps small businesses stay reliable, secure, and supported with managed IT operations, cloud infrastructure, SaaS administration, and responsive technology support.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "InfraNest Technologies",
    description:
      "Managed IT operations, cloud platform support, SaaS administration, and hands-on business technology support for small businesses.",
    url: siteUrl,
    siteName: "InfraNest Technologies",
    images: [
      {
        url: brandAssets.socialPreview.src,
        width: brandAssets.socialPreview.width,
        height: brandAssets.socialPreview.height,
        alt: "InfraNest Technologies managed IT and cloud support",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "InfraNest Technologies",
    description:
      "Managed IT operations, cloud platform support, SaaS administration, and hands-on business technology support for small businesses.",
    images: [brandAssets.socialPreview.src],
  },
  icons: {
    icon: brandAssets.badge.src,
    shortcut: brandAssets.badge.src,
    apple: brandAssets.badge.src,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} ${instrumentSerif.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        {/* Must be the first focusable element so it is reachable on the first Tab. */}
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <div className="site-background" aria-hidden="true" />
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
        <BackToTop />
        <RevealObserver />
        {plausibleDomain ? (
          <Script
            defer
            data-domain={plausibleDomain}
            src="https://plausible.io/js/script.js"
          />
        ) : null}
        <Script
          id="organization-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ProfessionalService",
              name: company.name,
              email: company.email,
              telephone: company.phone,
              areaServed: company.serviceArea,
              url: siteUrl,
            }),
          }}
        />
      </body>
    </html>
  );
}
