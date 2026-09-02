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
import { siteUrl } from "@/lib/site-url";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  // 700 for card/panel headings, 800 for page and section headings. The 600
  // and 900 files shipped unused: no display-font rule asks for either (the
  // one font-weight: 900 in the CSS is a checkbox glyph set in Inter, which
  // is variable and covers it for free).
  weight: ["700", "800"],
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-serif",
  // Kept deliberately — the italic accent is part of the brand's voice. The
  // upright style was a second file nothing referenced: every serif use on
  // the site sets font-style: italic.
  style: ["italic"],
  weight: "400",
  display: "swap",
});


export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "InfraNest Technologies | Managed IT Operations and Cloud Support",
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
  // Icons come from the app/icon.png and app/apple-icon.png file
  // conventions, sized for their actual render targets — the previous
  // metadata block pointed every role, favicon included, at the 83kB
  // 425x425 badge.
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
        {/*
          Reveal animations are progressive enhancement. This runs before first
          paint: without JavaScript the .js class never lands and content is
          simply visible. The timer covers the harder failure — HTML delivered
          but the bundle blocked, failed, or slow — by force-revealing
          everything unless hydration (RevealObserver) checks in within 2.5s.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              'document.documentElement.classList.add("js");window.setTimeout(function(){if(!window.__revealReady)document.documentElement.classList.add("reveal-fallback")},2500);',
          }}
        />
        {/* Must be the first focusable element so it is reachable on the first Tab. */}
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <div className="site-background" aria-hidden="true" />
        <SiteHeader />
        {/*
          The skip link targets this element. A fragment link only moves keyboard
          focus if its target can receive focus, so without tabIndex the link
          scrolls the page but leaves focus in the header — the next Tab lands
          back in the nav, which is the thing the user just asked to skip.
        */}
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
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
              description:
                "Managed IT operations, cloud infrastructure, SaaS administration, and responsive technology support for small businesses.",
              email: company.email,
              telephone: company.phone,
              areaServed: company.serviceArea,
              url: siteUrl,
              logo: `${siteUrl}${brandAssets.badge.src}`,
              image: `${siteUrl}/opengraph-image`,
              sameAs: [company.linkedIn, company.instagram],
            }),
          }}
        />
      </body>
    </html>
  );
}
