import type { Metadata } from "next";

import { QuoteForm } from "@/components/quote-form";
import { SectionHeading } from "@/components/section-heading";

export const metadata: Metadata = {
  title: "Request a Quote",
  description: "Tell InfraNest what support you need and request a quote for managed IT, cloud, SaaS, or ongoing business technology help.",
  alternates: { canonical: "/quote" },
  openGraph: {
    title: "Request a Quote | InfraNest Technologies",
    description: "Tell InfraNest what support you need and request a quote for managed IT, cloud, SaaS, or ongoing business technology help.",
    url: "/quote",
  },
};

export default function QuotePage() {
  return (
    <div className="page-shell">
      <div className="container stack">
        <SectionHeading
          eyebrow="Request a quote"
          title="Tell us what you need."
          description="For businesses that need hands-on help with IT operations, cloud systems, SaaS administration, or managed support."
          h1
        />

        <div className="section-split">
          <div className="info-panel" style={{ padding: "1.5rem" }}>
            <div className="stack" style={{ gap: "1.1rem" }}>
              <span className="eyebrow">How this works</span>
              <h2 className="panel-heading">
                A straightforward starting point.
              </h2>
              <p className="meta-copy">
                Share a little context about your environment and current needs, and we&rsquo;ll come back with a sensible
                first step.
              </p>
              <ul className="meta-list">
                <li>Ideal for scoped support requests and ongoing service conversations</li>
                <li>Use it for cloud, SaaS, IT operations, or broader technology cleanup</li>
                <li>Most new quote requests receive a response within 24 hours</li>
              </ul>
            </div>
          </div>

          <div><QuoteForm /></div>
        </div>
      </div>
    </div>
  );
}
