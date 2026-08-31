import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
  // A 404 should never be indexed, but its links are still worth following.
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="page-shell">
      <div className="container">
        <div className="section-heading">
          <span className="eyebrow">404</span>
          <h1>That page isn&apos;t here.</h1>
          <p>
            The link may be out of date, or the page may have moved. Everything InfraNest offers is still a click away.
          </p>
        </div>
        <div className="hero-actions">
          <Link className="button" href="/">
            Back to home
          </Link>
          <Link className="button-secondary" href="/contact">
            Contact us
          </Link>
        </div>
      </div>
    </div>
  );
}
