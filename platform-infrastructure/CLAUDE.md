# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start local dev server
npm run build     # Production build
npm run start     # Start production server
npm test          # Run tests (Node.js native test runner with tsx)
```

## Architecture

**InfraNest Technologies** — Next.js 15 App Router marketing site for a managed IT services company. Primary purpose: lead capture via two forms (contact and quote request), with backend lead storage and email notifications.

### Request Flow

Client form → POST `/api/contact` or `/api/quote` → Zod validation → Cloudflare Turnstile verification → duplicate check (DynamoDB query for the same email within 45s) → conditional DynamoDB write → SES email notification (best-effort)

Turnstile runs before any database work so unverified traffic never reaches DynamoDB. The duplicate check queries the stored items rather than in-process state, because serverless instances do not share memory; it fails open, and the notification email is best-effort once the item is committed — neither can turn a captured lead into an error the visitor sees.

The lead tables are keyed on `email` (partition) + `created_at` (sort), which is what makes the duplicate check a bounded range query on one partition. The write carries `ConditionExpression: attribute_not_exists(email)` so two simultaneous requests cannot silently overwrite each other on a same-millisecond sort key; that failure is caught and returned as the same 429 as the duplicate check.

### Page Structure

| Route | Purpose | Key Sections |
|-------|---------|--------------|
| `/` | Home — lean landing page | Hero, 4 featured services, Why InfraNest (3 principles), Testimonials, CTA |
| `/services` | Full service detail | 8 service cards with "Best for" taglines, Who/Outcomes cards, Platforms strip, CTA |
| `/about` | Brand story + credibility | Story panel, Credibility (trust cards), Working Process, CTA |
| `/contact` | Contact form + info | Info panel with next-steps flow, ContactForm, FAQ accordion |
| `/quote` | Quote request form | Info panel, QuoteForm with 8 service checkboxes |

Each page exports its own `metadata` object for SEO (title, description, canonical, OG).

### Key Directories

- `app/api/` — Two API routes: `contact/route.ts` and `quote/route.ts`. All server-side form logic lives here.
- `app/not-found.tsx` / `app/error.tsx` — Branded 404 and route-level error boundary, both built from the shared design system (`.page-shell`, `.section-heading`, `.hero-actions`). `error.tsx` is a client component and logs the error before rendering.
- `next.config.ts` — Security headers for every route: CSP, HSTS, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`. The CSP allowlists `challenges.cloudflare.com` (Turnstile) and `plausible.io`; everything else is same-origin, and `next/font` self-hosts so no font CDN is needed. **Adding a third-party script requires adding its host to `contentSecurityPolicy` first, or it will be blocked.** CSP is production-only because the dev server needs `unsafe-eval`.
- `instrumentation.ts` — Next.js `register()` startup hook; calls `reportRuntimeConfig()` so a misconfigured deployment logs the missing variables on boot. Logs rather than throws, so a missing key never takes down the static marketing pages.
- `lib/` — Shared utilities: `forms.ts` (Zod schemas), `submissions.ts` (duplicate prevention), `email.ts` (SES), `turnstile.ts` (bot verification), `dynamo.ts` (DynamoDB document client), `env.ts` (env var reads plus the startup config check), `types.ts` (shared TypeScript types), `brand-assets.ts` (centralises all asset paths — `badge` drives favicon, `socialPreview` drives OG/Twitter preview image via `/opengraph-image` dynamic route).
- `components/` — React components; form components (`contact-form.tsx`, `quote-form.tsx`) are `"use client"` and manage their own state.
- `data/site-content.ts` — **Single source of truth** for all marketing copy, navigation, service options, form options, and content arrays. Always edit here first when changing visible text, form options, or content blocks. Exports: `company`, `navigation`, `homeContent`, `services`, `serviceBestFor`, `aboutContent`, `contactDetails`, `quoteOptions`, `budgetRanges`, `timelineOptions`, `testimonials`, `platforms`, `nextSteps`, `faqItems`. In `navigation`, items without a `section` property highlight by `pathname` match instead of scroll-spy — "Contact" links directly to `/contact` this way.
- `app/sitemap.ts` — Auto-generates `/sitemap.xml`; reads `NEXT_PUBLIC_SITE_URL`. Lists all 5 routes with priority weights.
- `app/robots.ts` — Auto-generates `/robots.txt`; allows all crawlers, disallows `/api/`, references sitemap.
- `infrastructure/create-tables.sh` — Creates the `leads` and `quote_requests` DynamoDB tables (composite key, point-in-time recovery) plus the `acknowledgments` table (keyed on `email`, TTL on `expires_at`). Applied manually, like the schema file it replaced — committing a change to it does nothing on its own.

### Services

**8 services** defined in `data/site-content.ts` → `services` array (see that file for names/copy; `serviceBestFor` is index-matched to it, 8 items).

The **home page** (`app/page.tsx`) features only 4 of these via `featuredServices`:
```ts
const featuredServices = [services[0], services[1], services[3], services[5]];
// IT Ops, Cloud, Managed IT Support, Web Presence
```
The `serviceIcons` array in `app/page.tsx` must stay in sync with `featuredServices` order. The full 8-service list with icons lives in `app/services/page.tsx`.

### Design System (`app/globals.css`)

All UI is built from a shared CSS design system — no component library. Key conventions:

- **Colors**: `--accent` (#70c2ff blue), `--accent-green` (#8eedc3 teal), `--text` (#111827), `--muted` (#334155), `--border` (#cdd8e8)
- **Fonts**: `--font-body` (Inter), `--font-display` (Outfit) for headings and badges, `--font-serif` (Instrument Serif) for italic editorial accents — use `className="serif-accent"` or `font-family: var(--font-serif); font-style: italic`
- **Panels**: `.panel`, `.info-panel`, `.form-panel` — glassmorphic with gradient border via `::before` pseudo-element
- **Cards**: `.card`, `.service-card`, `.trust-card`, `.process-card`, `.about-card`, `.testimonial-card` — all share hover lift behavior
- **Layout**: `.section-split` (2-col), `.service-grid` (2-col), `.trust-grid` / `.cards-grid` (3-col), `.process-grid` (2-col)
- **Scroll reveal**: Add `data-reveal` to any element for a fade-up entrance. Use `data-reveal="left"` / `data-reveal="right"` for horizontal slides. Add `data-delay="1"` through `data-delay="8"` for stagger. The `RevealObserver` client component in layout handles the IntersectionObserver.
- **Inline SVG icons**: No icon library — all icons are inline SVGs using `stroke="currentColor"`. Match the existing `viewBox="0 0 24 24"` style. Only use `<path>`, `<line>`, and `<rect>` elements — `<polygon>` and `<circle>` do not inherit `fill="none"` reliably and will render blank.
- **Hero visual**: `.hero-spotlight` uses a pure CSS gradient + grid pattern (no external image). Wrapped in `HeroSpotlightWrapper` on the home page for mouse parallax via CSS `translate`. On mobile (≤760px) switches to `display: flex` so `.hero-spotlight-content` flows without clipping.
- **Eyebrow pulse**: Add `eyebrow--pulse` class (or `pulse` prop on `SectionHeading`) to give the eyebrow dot a sonar-ring animation. Currently enabled on the home hero badge and "Service lanes" only — avoid on informational/form pages.
- **Responsive breakpoints**: 980px (collapse all multi-col grids to 1-col) and 760px (mobile nav toggle, reduce gaps/padding, revert pill navbar to full-width bar).

### Components

| Component | Type | Notes |
|-----------|------|-------|
| `site-header.tsx` | Client | Floating pill navbar; scroll-spy active state; mobile hamburger toggle; pill reverts to full-width bar at 760px |
| `site-footer.tsx` | Server | 3-column grid: brand + tagline (left), vertical nav links (center), contact + copyright (right); `infra-badge.png` watermark centered |
| `section-heading.tsx` | Server | Reusable eyebrow + h1/h2 + description block; pass `reveal` prop to enable scroll animation; pass `pulse` prop to add sonar-ping animation to the eyebrow dot |
| `hero-spotlight-wrapper.tsx` | Client | Wraps `.hero-spotlight` on the home page; tracks `mousemove` to drive CSS vars `--px`/`--py` for parallax on glass slabs and atmosphere shapes |
| `reveal-observer.tsx` | Client | IntersectionObserver that adds `is-visible` to `[data-reveal]` elements; re-runs on route change via `usePathname` |
| `faq-accordion.tsx` | Client | One-at-a-time accordion using `useRef` array; closing siblings on `onToggle` |
| `contact-form.tsx` | Client | 5 fields, Turnstile, `/api/contact` POST |
| `quote-form.tsx` | Client | 8 service checkboxes with SVG icons, dropdowns, Turnstile, `/api/quote` POST |
| `turnstile-widget.tsx` | Client | Cloudflare Turnstile wrapper, dark theme |
| `back-to-top.tsx` | Client | Fixed bottom-right, appears after 360px scroll |

### Environment Variables

Copy `.env.example` to `.env.local`. Required: `LEADS_TABLE_NAME`, `QUOTE_REQUESTS_TABLE_NAME`, `ACKNOWLEDGMENTS_TABLE_NAME`, `NOTIFICATION_EMAIL`, `NOTIFICATION_FROM`, `TURNSTILE_SECRET_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `NEXT_PUBLIC_SITE_URL` (e.g. `https://infranests.com` — used by sitemap, robots.txt, and OG metadata). Optional: `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`.

`AWS_REGION` defaults to `us-east-1` and is set automatically by Lambda in Amplify, so it only matters locally. AWS credentials come from the compute role via the default provider chain — no access keys in env vars.

`NOTIFICATION_FROM` sets the notification sender and must be an address on a domain verified in SES. SES refuses any unverified sender outright, so there is no fallback address — it is required, not optional.

The seven variables the forms and metadata depend on are checked once at server start by `reportRuntimeConfig()` in `lib/env.ts`, called from `instrumentation.ts`. Missing values are logged as an error in production and a warning in development; the server still starts either way.

### Testing

Tests use Node.js native test runner (`node --import tsx --test`). `tests/forms.test.ts` covers Zod schema validation, service selection rules, and email normalisation. `tests/submissions.test.ts` covers the duplicate-check query shape and its fail-open behaviour, using a stub document client.
