import type { Metadata } from "next";
import Link from "next/link";

import { SectionHeading } from "@/components/section-heading";
import { platforms, serviceBestFor, services } from "@/data/site-content";

export const metadata: Metadata = {
  title: "Services",
  description: "Managed IT operations, cloud platform help, SaaS administration, and ongoing technology support for growing businesses.",
  alternates: { canonical: "/services" },
  openGraph: {
    title: "Services | InfraNest Technologies",
    description: "Managed IT operations, cloud platform help, SaaS administration, and ongoing technology support for growing businesses.",
    url: "/services",
  },
};

const serviceIcons = [
  // IT Operations & Technology Management — monitor/desktop
  <svg key="it" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>,
  // Cloud & Platform Engineering — cloud
  <svg key="cloud" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
  </svg>,
  // SaaS & Workspace Administration — grid
  <svg key="saas" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>,
  // Managed IT Services & Support — shield
  <svg key="support" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>,
  // Workplace Technology & Collaboration — cast/screen-share
  <svg key="workplace" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2 8V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6" />
    <path d="M2 12a9 9 0 0 1 8 8" />
    <path d="M2 16a5 5 0 0 1 4 4" />
    <line x1="2" y1="20" x2="2.01" y2="20" />
  </svg>,
  // Web Presence & Managed Hosting — link
  <svg key="web" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>,
  // Security & Access Foundations — lock
  <svg key="security" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>,
  // Flexible Engagement Models — layers
  <svg key="flexible" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
    <path d="M2 17l10 5 10-5" />
    <path d="M2 12l10 5 10-5" />
  </svg>,
];

export default function ServicesPage() {
  return (
    <div className="page-shell">
      <div className="container stack">
        <SectionHeading
          eyebrow="Services"
          title="Technology support that runs quietly so your business doesn't have to."
          description="InfraNest focuses on the practical systems, workflows, and operational responsibilities that keep a growing business moving."
          h1
          reveal
        />

        <div className="service-grid">
          {services.map((service, index) => (
            <article className="service-card" key={service.title} data-reveal data-delay={String((index % 4) + 1)}>
              <div className="card-icon-wrap">{serviceIcons[index]}</div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <div className="service-best-for">
                <strong>Best for:</strong> {serviceBestFor[index]}
              </div>
              <ul>
                {service.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        {/* ─── Who / Outcomes ─── */}
        <div className="section-split">
          <div className="about-card" data-reveal>
            <div className="card-icon-wrap" style={{ marginBottom: "0.75rem" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h3>Who this is for</h3>
            <p>
              Small businesses and growing teams that need reliable operational coverage, smarter support structure, and
              better technology ownership without building a full internal IT function too early.
            </p>
          </div>
          <div className="about-card" data-reveal data-delay="1">
            <div className="card-icon-wrap" style={{ marginBottom: "0.75rem" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
            </div>
            <h3>What outcomes to expect</h3>
            <ul>
              <li>Cleaner SaaS and account administration</li>
              <li>More dependable user support and issue response</li>
              <li>Healthier cloud and platform foundations</li>
              <li>Better clarity around what to fix next and why</li>
            </ul>
          </div>
        </div>

        {/* ─── Platforms ─── */}
        <div className="panel" style={{ padding: "1.5rem 2rem" }} data-reveal>
          <div className="stack" style={{ gap: "0.9rem" }}>
            <span className="eyebrow">Platforms we support</span>
            <div className="marquee-track">
              <div className="marquee-inner">
                {[...platforms, ...platforms].map((p, i) => (
                  <span className="platform-badge" key={i}>{p}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ─── CTA ─── */}
        <div className="panel" style={{ padding: "2rem" }}>
          <div className="section-split">
            <div className="stack">
              <span className="eyebrow">Next step</span>
              <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "clamp(1.9rem, 4vw, 2.6rem)", fontWeight: 800, letterSpacing: "-0.025em", lineHeight: 1.08 }}>
                If you already know the business needs hands-on support, start with the quote flow.
              </h2>
              <p className="meta-copy">
                Share what is happening, the kind of support you need, and your expected timing. InfraNest will reply
                with a practical starting point.
              </p>
            </div>
            <div className="inline-actions" style={{ alignSelf: "center", flexDirection: "column", gap: "0.75rem" }}>
              <Link className="button" href="/quote" style={{ width: "100%", justifyContent: "center" }}>
                Request a quote
              </Link>
              <Link className="button-secondary" href="/contact" style={{ width: "100%", justifyContent: "center" }}>
                Ask a question
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
