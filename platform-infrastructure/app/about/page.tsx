import type { Metadata } from "next";
import Link from "next/link";

import { SectionHeading } from "@/components/section-heading";
import { aboutContent, company, homeContent } from "@/data/site-content";

export const metadata: Metadata = {
  title: "About",
  description: "Learn how InfraNest approaches managed IT operations, cloud support, and scalable business technology guidance.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About | InfraNest Technologies",
    description: "Learn how InfraNest approaches managed IT operations, cloud support, and scalable business technology guidance.",
    url: "/about",
  },
};

const trustIcons = [
  <svg key="check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>,
  <svg key="layers" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>,
  <svg key="users" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>,
];

export default function AboutPage() {
  return (
    <div className="page-shell">
      <div className="container stack">

        {/* ─── Page Heading ─── */}
        <SectionHeading
          eyebrow="About InfraNest"
          title="A steadier foundation for business technology."
          description="InfraNest is built for businesses that want clean systems, responsive support, and a thoughtful operator on the technology side of the business."
          h1
        />

        {/* ─── Story ─── */}
        <div className="section-split">
          <div className="info-panel" style={{ padding: "1.5rem" }}>
            <div className="stack">
              <span className="eyebrow">Our story</span>
              <h2 className="panel-heading">
                Small businesses deserve strong technology operations before things become chaotic.
              </h2>
              <p className="meta-copy">{aboutContent.story}</p>
              <ul className="meta-list">
                <li>{company.serviceArea}</li>
                <li>Professional, approachable support</li>
                <li>Designed for long-term manageability, not one-time fixes</li>
              </ul>
            </div>
          </div>

          <div className="cards-grid" style={{ gridTemplateColumns: "1fr", alignContent: "start" }}>
            <article className="card">
              <h3>What makes InfraNest different</h3>
              <p>
                The work is not limited to tickets or isolated tools. InfraNest looks at support, accounts, platforms,
                workflows, and operational ownership together so the business environment gets easier to run over time.
              </p>
            </article>
            <article className="card">
              <h3>What it&rsquo;s like to work with us</h3>
              <p>
                Clear communication, steady follow-through, and practical recommendations. The goal is a calm, credible
                experience for business owners and lean teams.
              </p>
            </article>
            <article className="card">
              <h3>Where support happens</h3>
              <p>
                InfraNest uses Greater Boston as the local trust anchor while supporting teams remotely when the work is a
                better fit for distributed delivery.
              </p>
            </article>
          </div>
        </div>

        {/* ─── Credibility ─── */}
        <div>
          <SectionHeading
            eyebrow="Credibility"
            title="A calm, structured approach to business technology."
            description="The goal is not more noise. A cleaner operating environment, steadier support, and better decisions around the systems your business depends on."
          />
          <div className="trust-grid">
            {homeContent.trustPoints.map((point, index) => (
              <article className="trust-card" key={point.title}>
                <div className="card-icon-wrap">{trustIcons[index]}</div>
                <h3>{point.title}</h3>
                <p>{point.body}</p>
              </article>
            ))}
          </div>
        </div>

        {/* ─── Working Process ─── */}
        <div className="section-split">
          <div>
            <SectionHeading
              eyebrow="Working process"
              title="Simple enough to move quickly. Thoughtful enough to scale well."
              description="Every engagement starts by understanding the current environment, stabilizing what matters most, and building a support model that matches the business."
            />
          </div>
          <div className="process-grid">
            {homeContent.process.map((step, index) => (
              <article className="process-card" key={step.title}>
                <div className="step-badge">{index + 1}</div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </article>
            ))}
          </div>
        </div>

        {/* ─── Bottom CTA ─── */}
        <div className="panel" style={{ padding: "var(--card-pad)" }}>
          <div className="section-split">
            <div className="stack">
              <span className="eyebrow">Work with InfraNest</span>
              <h2 className="cta-heading">
                Ready to talk about what steady technology support looks like?
              </h2>
              <p className="meta-copy">
                Start with a quote if you already know what you need, or reach out for a general conversation if you are
                still shaping the right approach.
              </p>
            </div>
            <div className="inline-actions" style={{ alignSelf: "center", flexDirection: "column", gap: "0.75rem" }}>
              <Link className="button" href="/quote" style={{ width: "100%", justifyContent: "center" }}>
                Request a quote
              </Link>
              <Link className="button-secondary" href="/contact" style={{ width: "100%", justifyContent: "center" }}>
                Get in touch
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
