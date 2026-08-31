"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Route-level error boundary. Without this a render error shows the unstyled
 * Next.js default, which on a marketing site reads as the whole thing being down.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled page error", error);
  }, [error]);

  return (
    <div className="page-shell">
      <div className="container">
        <div className="section-heading">
          <span className="eyebrow">Something went wrong</span>
          <h1>This page failed to load.</h1>
          <p>
            The issue has been logged. Trying again often clears it — if it does not, InfraNest is reachable by email or
            phone.
          </p>
        </div>
        <div className="hero-actions">
          <button className="button" type="button" onClick={reset}>
            Try again
          </button>
          <Link className="button-secondary" href="/contact">
            Contact us
          </Link>
        </div>
      </div>
    </div>
  );
}
