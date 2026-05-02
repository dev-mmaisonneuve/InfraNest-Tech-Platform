import Link from "next/link";

import { SectionHeading } from "@/components/section-heading";
import { aboutContent, homeContent, services, testimonials } from "@/data/site-content";

// The 4 services featured on the home page
const featuredServices = [services[0], services[1], services[3], services[5]];

const pillarIcons = [
  <svg key="cog" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>,
  <svg key="msg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>,
  <svg key="trend" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>,
];

const serviceIcons = [
  // IT Operations & Technology Management — monitor
  <svg key="it" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>,
  // Cloud & Platform Engineering — cloud
  <svg key="cloud" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
  </svg>,
  // Managed IT Services & Support — shield
  <svg key="support" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>,
  // Web Presence & Managed Hosting — link
  <svg key="web" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>,
];

export default function HomePage() {
  return (
    <div id="main-content">

      {/* ─── Hero ─── */}
      <section className="hero" id="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow" data-reveal>{homeContent.eyebrow}</span>
            <h1 data-reveal data-delay="1">
              Keep your technology{" "}
              <em className="gradient-text serif-accent">reliable, secure, and ready to scale.</em>
            </h1>
            <p data-reveal data-delay="2">{homeContent.description}</p>
            <div className="hero-actions" data-reveal data-delay="3">
              <Link className="button" href={homeContent.primaryCta.href}>
                {homeContent.primaryCta.label}
              </Link>
              <Link className="button-secondary" href={homeContent.secondaryCta.href}>
                {homeContent.secondaryCta.label}
              </Link>
            </div>

            <div className="stats-grid" data-reveal data-delay="4">
              {homeContent.stats.map((stat) => (
                <article className="stat-card" key={stat.label}>
                  <div className="stat-icon" aria-hidden="true">
                    {stat.icon === "clock" ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    ) : stat.icon === "grid" ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                    )}
                  </div>
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </article>
              ))}
            </div>
          </div>

          <aside className="hero-panel" data-reveal="right">
            <div className="hero-spotlight">
              {/* Decorative network nodes */}
              <svg viewBox="0 0 400 300" fill="none" aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.55 }}>
                <line x1="80" y1="70" x2="200" y2="130" stroke="#70c2ff" strokeWidth="1" />
                <line x1="200" y1="130" x2="330" y2="80" stroke="#70c2ff" strokeWidth="1" />
                <line x1="200" y1="130" x2="145" y2="215" stroke="#8eedc3" strokeWidth="1" />
                <line x1="200" y1="130" x2="285" y2="195" stroke="#8eedc3" strokeWidth="1" />
                <line x1="330" y1="80" x2="365" y2="155" stroke="#70c2ff" strokeWidth="0.75" />
                <line x1="60" y1="155" x2="145" y2="215" stroke="#8eedc3" strokeWidth="0.75" />
                <line x1="285" y1="195" x2="340" y2="240" stroke="#70c2ff" strokeWidth="0.75" />
                <circle cx="80" cy="70" r="5" fill="#70c2ff" opacity="0.75" />
                <circle cx="200" cy="130" r="9" fill="#70c2ff" opacity="0.85" className="hero-node-pulse" />
                <circle cx="330" cy="80" r="6" fill="#8eedc3" opacity="0.8" />
                <circle cx="145" cy="215" r="5" fill="#8eedc3" opacity="0.7" />
                <circle cx="285" cy="195" r="7" fill="#70c2ff" opacity="0.75" />
                <circle cx="365" cy="155" r="4" fill="#8eedc3" opacity="0.65" />
                <circle cx="60" cy="155" r="3.5" fill="#70c2ff" opacity="0.55" />
                <circle cx="340" cy="240" r="4" fill="#8eedc3" opacity="0.6" />
                <circle cx="200" cy="130" r="20" fill="none" stroke="#70c2ff" strokeWidth="0.75" strokeDasharray="3 3" opacity="0.5" className="hero-node-ring" />
              </svg>
              <div className="hero-spotlight-content">
                <span className="hero-kicker">Why growing teams trust InfraNest</span>
                <div className="hero-value">Dependable support backed by operator-level thinking.</div>
                <div className="hero-feature-rows">
                  <div className="hero-feature-row">
                    <span className="hero-feature-dot" aria-hidden="true" />
                    <span>IT ops, cloud infrastructure, web presence &amp; managed support</span>
                  </div>
                  <div className="hero-feature-row">
                    <span className="hero-feature-dot" aria-hidden="true" />
                    <span>1-day typical first response</span>
                  </div>
                  <div className="hero-feature-row">
                    <span className="hero-feature-dot" aria-hidden="true" />
                    <span>Greater Boston anchor &amp; remote US coverage</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* ─── Services ─── */}
      <section className="section section-tinted" id="services">
        <div className="container">
          <SectionHeading
            eyebrow="Service lanes"
            title="Technology support built around how your business actually works."
            description="InfraNest is designed for companies that need more than ad hoc help, but are not ready for a large in-house IT team."
            reveal
          />

          <div className="service-grid">
            {featuredServices.map((service, index) => (
              <article className="service-card" key={service.title} data-reveal data-delay={String(index + 1)}>
                <div className="card-icon-wrap">{serviceIcons[index]}</div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <ul>
                  {service.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <div className="inline-actions" style={{ marginTop: "1.5rem" }}>
            <Link className="button-secondary" href="/services">
              View all services
            </Link>
            <Link className="button-subtle" href="/quote">
              Request a quote →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Why InfraNest ─── */}
      <section className="section" id="about-preview">
        <div className="container">
          <SectionHeading
            eyebrow="Why InfraNest"
            title="Three principles that shape every engagement."
            description="The philosophy behind InfraNest is simple: clear communication, practical operations, and systems designed to stay manageable as the business grows."
            reveal
          />

          <div className="cards-grid">
            {aboutContent.pillars.map((pillar, index) => (
              <article className="about-card" key={pillar.title} data-reveal data-delay={String(index + 1)}>
                <div className="card-icon-wrap">{pillarIcons[index]}</div>
                <h3>{pillar.title}</h3>
                <p>{pillar.body}</p>
              </article>
            ))}
          </div>

          <div className="inline-actions" style={{ marginTop: "1.5rem" }}>
            <Link className="button-secondary" href="/about">
              Learn more about InfraNest
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="section" id="testimonials">
        <div className="container">
          <SectionHeading
            eyebrow="From the field"
            title="What clients say after the first engagement."
            description="These reflect what working with InfraNest is typically like, from early conversations to steady ongoing support."
            reveal
          />
          <div className="trust-grid">
            {testimonials.map((t, i) => (
              <article className="testimonial-card" key={t.name} data-reveal data-delay={String(i + 1)}>
                <p className="testimonial-quote">{t.quote}</p>
                <div className="testimonial-attribution">
                  <div className="testimonial-avatar" aria-hidden="true">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="testimonial-name">{t.name}</div>
                    <div className="testimonial-company">{t.company}</div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="section" id="cta">
        <div className="container panel" style={{ padding: "2rem" }}>
          <div className="section-split" data-reveal>
            <div className="stack">
              <span className="eyebrow">Get started</span>
              <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.05 }}>
                Ready to build a steadier technology foundation?
              </h2>
              <p className="meta-copy">
                Request a quote if you already know you need support, or start with a general conversation if you are
                still shaping the right engagement.
              </p>
              <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                No commitment required. Most responses within one business day.
              </p>
            </div>

            <div className="inline-actions" style={{ alignSelf: "center", justifyContent: "flex-start", flexDirection: "column", gap: "0.75rem" }}>
              <Link className="button" href="/quote" style={{ width: "100%", justifyContent: "center" }}>
                Request a quote
              </Link>
              <Link className="button-secondary" href="/contact" style={{ width: "100%", justifyContent: "center" }}>
                Contact InfraNest
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
