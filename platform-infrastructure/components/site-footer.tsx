import Image from "next/image";
import Link from "next/link";

import { CurrentYear } from "@/components/current-year";
import { company, navigation } from "@/data/site-content";
import { brandAssets } from "@/lib/brand-assets";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-panel panel">
          <Image
            className="footer-badge-watermark"
            src={brandAssets.badge.src}
            alt=""
            aria-hidden="true"
            width={brandAssets.badge.width}
            height={brandAssets.badge.height}
          />
          <div className="footer-grid">

            {/* ─── Brand column ─── */}
            <div className="footer-brand-col">
              <div className="brand-mark">
                <Image
                  className="brand-wordmark footer-brand-larger"
                  src="/assets/Infra-logo.png"
                  alt="InfraNest Technologies"
                  width={292}
                  height={112}
                />
              </div>
              <p className="footer-tagline">
                Dependable IT operations, cloud infrastructure, and managed business support for lean, growing teams.
              </p>
              <span className="footer-area">{company.serviceArea}</span>
            </div>

            {/* ─── Navigation column ─── */}
            <div className="footer-col">
              <span className="footer-col-label">Navigation</span>
              <nav className="footer-links">
                {navigation.map((item) => (
                  <Link key={item.href} href={item.href}>{item.label}</Link>
                ))}
                <Link href="/quote">Quote</Link>
                <Link href="/privacy">Privacy</Link>
              </nav>
            </div>

            {/* ─── Contact column ─── */}
            <div className="footer-col">
              <span className="footer-col-label">Get in touch</span>
              <div className="footer-contact-stack">
                <a className="footer-contact-link" href={`mailto:${company.email}`}>{company.email}</a>
                <a className="footer-contact-link" href={`tel:${company.phone.replace(/[^\d]/g, "")}`}>{company.phone}</a>
              </div>
              <span className="footer-legal">&copy; <CurrentYear fallback={new Date().getFullYear()} /> InfraNest Technologies.<br />All rights reserved.</span>
            </div>

          </div>
        </div>
      </div>
    </footer>
  );
}
