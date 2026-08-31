import type { Metadata } from "next";
import Link from "next/link";

import { SectionHeading } from "@/components/section-heading";
import { company } from "@/data/site-content";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How InfraNest Technologies collects, uses, stores, and protects the information you submit through this website.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "Privacy Policy | InfraNest Technologies",
    description:
      "How InfraNest Technologies collects, uses, stores, and protects the information you submit through this website.",
    url: "/privacy",
  },
};

/**
 * Update this whenever the substance of the policy changes, not on every edit.
 * It is the date visitors and regulators rely on to know which version applied.
 */
const lastUpdated = "August 27, 2026";

export default function PrivacyPage() {
  return (
    <div className="page-shell">
      <div className="container stack">
        <SectionHeading
          h1
          eyebrow="Privacy"
          title="Privacy Policy"
          description={`How InfraNest handles the information you share through this website. Last updated ${lastUpdated}.`}
        />

        <div className="panel" style={{ padding: "2rem", maxWidth: "72ch" }}>
          <h2>What we collect</h2>
          <p>
            InfraNest only collects information you choose to submit through the contact form or the quote request
            form on this site. We do not buy contact data or collect personal information in the background.
          </p>
          <p>Depending on which form you use, that may include:</p>
          <ul>
            <li>Your name</li>
            <li>Your email address</li>
            <li>Your phone number, if you provide one</li>
            <li>Your company name, if you provide one</li>
            <li>The message or project summary you write</li>
            <li>For quote requests: the services you select, and any timeline and budget range you choose</li>
          </ul>
          <p>
            On the contact form, only your name, email address, and message are required. A quote request also
            needs at least one service selection and a short project summary. Every other field is optional.
          </p>

          <h2>Why we collect it</h2>
          <p>
            Solely to respond to your enquiry and, if there is a fit, to discuss working together. We do not use
            it for advertising, we do not send marketing email, and we do not sell or rent it to anyone.
          </p>

          <h2>Where it is stored</h2>
          <p>
            Submissions are stored in Amazon DynamoDB in Amazon Web Services&rsquo; US East (N. Virginia) region,
            in the United States. Notification emails are delivered through Amazon Simple Email Service, also in
            the United States, to an InfraNest business inbox hosted on Google Workspace.
          </p>
          <p>
            If you are contacting us from outside the United States, your information will be transferred to and
            stored in the United States.
          </p>

          <h2>Spam protection</h2>
          <p>
            Both forms are protected by Cloudflare Turnstile, which helps confirm that a submission comes from a
            person rather than an automated script. The Turnstile widget loads as soon as you open the contact or
            quote page, so Cloudflare receives your IP address and technical information about your browser at
            that point &mdash; before you submit anything, and whether or not you go on to submit at all. InfraNest
            never receives that data itself. Cloudflare&rsquo;s handling of it is governed by{" "}
            <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer">
              Cloudflare&rsquo;s privacy policy
            </a>
            .
          </p>

          <h2>Cookies and analytics</h2>
          <p>
            This site does not set advertising or tracking cookies, and does not currently run website analytics.
            If we introduce analytics in future we intend to use a privacy-focused, cookieless service, and this
            policy will be updated before that happens.
          </p>

          <h2>Who else can see it</h2>
          <p>
            Nobody outside InfraNest, other than the infrastructure providers that operate the systems above:
            Amazon Web Services for storage and email delivery, Google Workspace for our business inbox, and
            Cloudflare for spam protection. Each processes the data only to provide those services.
          </p>
          <p>We will disclose information if legally required to do so, and will tell you where we are permitted to.</p>

          <h2>How long we keep it</h2>
          <p>
            We keep enquiries for as long as they remain relevant to an active or potential working relationship,
            and delete them when they no longer are. You can ask us to delete your information sooner at any time.
          </p>

          <h2>Your choices</h2>
          <p>
            You can ask us to tell you what information we hold about you, correct it, or delete it. Email{" "}
            <a href={`mailto:${company.email}`}>{company.email}</a> and we will respond within a reasonable
            period. There is no cost, and asking will not affect how we treat your enquiry.
          </p>

          <h2>Children</h2>
          <p>
            This site is intended for businesses. We do not knowingly collect information from anyone under 16.
            If you believe a child has submitted information, contact us and we will delete it.
          </p>

          <h2>Changes to this policy</h2>
          <p>
            If this policy changes we will update the date at the top. Material changes will be described here
            rather than made quietly.
          </p>

          <h2>Contact</h2>
          <p>
            {company.name}
            <br />
            {company.serviceArea}
            <br />
            <a href={`mailto:${company.email}`}>{company.email}</a>
            <br />
            <a href={`tel:${company.phone.replace(/[^\d]/g, "")}`}>{company.phone}</a>
          </p>
        </div>

        <p style={{ textAlign: "center" }}>
          <Link href="/contact">Back to contact</Link>
        </p>
      </div>
    </div>
  );
}
