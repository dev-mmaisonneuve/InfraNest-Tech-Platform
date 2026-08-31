/**
 * The single source of the site's absolute URL. Canonical links, Open Graph
 * URLs, the sitemap and robots.txt all derive from this value, and the same
 * fallback used to be pasted into three files independently.
 *
 * The fallback is a development convenience only. A production build without
 * the variable fails here, loudly, at build time — the alternative was a
 * deploy that succeeds while every canonical URL and sitemap entry points at
 * http://localhost:3000, which nothing would ever flag except a search
 * console weeks later. CI sets the variable explicitly for its verification
 * build (.github/workflows/ci.yml).
 */
const configured = process.env.NEXT_PUBLIC_SITE_URL;

if (!configured && process.env.NODE_ENV === "production") {
  throw new Error(
    "NEXT_PUBLIC_SITE_URL is not set. Production builds refuse to fall back " +
      "to localhost because the value feeds canonical URLs, Open Graph, the " +
      "sitemap and robots.txt. Set it in the Amplify environment (and it is " +
      "set in CI via ci.yml).",
  );
}

export const siteUrl = configured ?? "http://localhost:3000";
