import type { Metadata } from "next";

import { ContactForm } from "@/components/contact-form";
import { FaqAccordion } from "@/components/faq-accordion";
import { SectionHeading } from "@/components/section-heading";
import { company, contactDetails, nextSteps } from "@/data/site-content";

export const metadata: Metadata = {
  title: "Contact",
  description: "Reach InfraNest Technologies for managed IT, cloud, SaaS administration, and support inquiries.",
};

const contactIcons: Record<string, React.ReactNode> = {
  Email: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="1rem" height="1rem" aria-hidden="true">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  Phone: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="1rem" height="1rem" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.77 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.37a16 16 0 0 0 6.72 6.72l1.83-1.83a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 23 16.92z" />
    </svg>
  ),
  "Service area": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="1rem" height="1rem" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
};

export default function ContactPage() {
  return (
    <div className="page-shell" id="main-content">
      <div className="container stack">
        <SectionHeading
          eyebrow="Contact"
          title="Get in touch. We'll take it from there."
          description="Use the contact form for general questions, or jump to the quote page if you already know you need a scoped engagement."
          h1
          reveal
        />

        <div className="section-split contact-split">
          <div className="info-panel" style={{ padding: "1.75rem" }} data-reveal="left">
            <div className="stack">
              <span className="eyebrow">Direct contact</span>
              <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "clamp(1.35rem, 2.5vw, 1.75rem)", fontWeight: 700, lineHeight: 1.3, letterSpacing: "-0.02em" }}>
                Clear response times and a low-friction path in.
              </h2>

              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.4rem 0.85rem", borderRadius: "999px", background: "rgba(142, 237, 195, 0.18)", border: "1px solid rgba(142, 237, 195, 0.45)", fontSize: "0.82rem", fontWeight: 600, color: "#0a6b4f" }}>
                <span style={{ width: "0.45rem", height: "0.45rem", borderRadius: "50%", background: "#14a07a", display: "inline-block", flexShrink: 0 }} />
                {company.schedulingNote}
              </div>

              <ul className="contact-list" style={{ gap: "0.85rem" }}>
                {contactDetails.map((detail) => (
                  <li key={detail.label} style={{ display: "flex", alignItems: "center", gap: "0.6rem", paddingLeft: 0 }}>
                    <span style={{ color: "#1a8fd1", flexShrink: 0, display: "flex" }}>{contactIcons[detail.label]}</span>
                    <span>
                      <strong style={{ marginRight: "0.3rem" }}>{detail.label}:</strong>
                      {detail.href ? <a href={detail.href}>{detail.value}</a> : detail.value}
                    </span>
                  </li>
                ))}
              </ul>

              <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1rem" }}>
                <p style={{ fontSize: "0.82rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#1a7fc4", marginBottom: "0.75rem" }}>What happens next</p>
                <div className="next-steps">
                  {nextSteps.map((item, i) => (
                    <div className="next-step" key={item.step}>
                      <span className="next-step-num">{i + 1}</span>
                      <div className="next-step-body">
                        <strong>{item.step}</strong>
                        <span>{item.detail}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div data-reveal="right"><ContactForm /></div>
        </div>

        {/* ─── FAQ ─── */}
        <div className="stack" style={{ gap: "1.25rem" }} data-reveal>
          <div>
            <span className="eyebrow">FAQ</span>
            <h2 style={{ margin: "0.75rem 0 0.5rem", fontFamily: "var(--font-display)", fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.15 }}>
              Common questions answered.
            </h2>
            <p style={{ color: "var(--muted)", fontSize: "1rem", lineHeight: 1.7, maxWidth: "38rem" }}>
              If you have a question not covered here, use the form above or reach out directly.
            </p>
          </div>
          <FaqAccordion />
        </div>

      </div>
    </div>
  );
}
