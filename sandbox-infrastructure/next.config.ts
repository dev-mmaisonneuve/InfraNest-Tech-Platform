import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";

/**
 * `unsafe-inline` is required for scripts because Next.js injects inline
 * bootstrap and hydration scripts; removing it means adopting nonces via
 * middleware. It is still worth sending: the directive continues to restrict
 * which *hosts* scripts may come from, which is the part that matters here.
 *
 * Applied in production only — the dev server needs `unsafe-eval` for HMR.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  // challenges.cloudflare.com: Turnstile. plausible.io: optional analytics.
  "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://plausible.io",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  // next/font self-hosts the Google fonts at build time, so 'self' covers them.
  "font-src 'self' data:",
  "connect-src 'self' https://challenges.cloudflare.com https://plausible.io",
  "frame-src https://challenges.cloudflare.com",
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  ...(isProduction ? [{ key: "Content-Security-Policy", value: contentSecurityPolicy }] : []),
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
