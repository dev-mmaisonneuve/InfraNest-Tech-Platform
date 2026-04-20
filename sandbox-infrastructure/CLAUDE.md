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

Client form → POST `/api/contact` or `/api/quote` → Zod validation → duplicate throttle check (45s window, email+IP fingerprint) → Cloudflare Turnstile verification → Supabase insert → Resend email notification

### Page Structure

| Route | Purpose | Key Sections |
|-------|---------|--------------|
| `/` | Home — lean landing page | Hero, 4 featured services, Why InfraNest (3 principles), Testimonials, CTA |
| `/services` | Full service detail | 8 service cards with "Best for" taglines, Who/Outcomes cards, Platforms strip, CTA |
| `/about` | Brand story + credibility | Story panel, Credibility (trust cards), Working Process, CTA |
| `/contact` | Contact form + info | Info panel with next-steps flow, ContactForm, FAQ accordion |
| `/quote` | Quote request form | Info panel, QuoteForm with 8 service checkboxes |

### Key Directories

- `app/api/` — Two API routes: `contact/route.ts` and `quote/route.ts`. All server-side form logic lives here.
- `lib/` — Shared utilities: `forms.ts` (Zod schemas), `submissions.ts` (duplicate prevention), `email.ts` (Resend), `turnstile.ts` (bot verification), `supabase.ts` (DB client), `env.ts` (env var validation), `types.ts` (shared TypeScript types).
- `components/` — React components; form components (`contact-form.tsx`, `quote-form.tsx`) are `"use client"` and manage their own state.
- `data/site-content.ts` — **Single source of truth** for all marketing copy, navigation, service options, form options, and content arrays. Always edit here first when changing visible text, form options, or content blocks. Exports: `company`, `navigation`, `homeContent`, `services`, `serviceBestFor`, `aboutContent`, `contactDetails`, `quoteOptions`, `budgetRanges`, `timelineOptions`, `testimonials`, `platforms`, `nextSteps`, `faqItems`.
- `supabase/schema.sql` — Database schema for `leads` and `quote_requests` tables. Apply manually to Supabase project.

### Services

There are **8 services** defined in `data/site-content.ts` → `services` array:

1. IT Operations & Technology Management
2. Cloud & Platform Engineering
3. SaaS & Workspace Administration
4. Managed IT Services & Support
5. Workplace Technology & Collaboration
6. Web Presence & Managed Hosting
7. Security & Access Foundations
8. Flexible Engagement Models

The **home page** (`app/page.tsx`) features only 4 of these via `featuredServices`:
```ts
const featuredServices = [services[0], services[1], services[3], services[5]];
// IT Ops, Cloud, Managed IT Support, Web Presence
```
The `serviceIcons` array in `app/page.tsx` must stay in sync with `featuredServices` order. The full 8-service list with icons lives in `app/services/page.tsx`.

### Design System (`app/globals.css`)

All UI is built from a shared CSS design system — no component library. Key conventions:

- **Colors**: `--accent` (#70c2ff blue), `--accent-green` (#8eedc3 teal), `--text` (#111827), `--muted` (#334155), `--border` (#cdd8e8)
- **Fonts**: `--font-body` (Inter), `--font-display` (Outfit) for headings and badges
- **Panels**: `.panel`, `.info-panel`, `.form-panel` — glassmorphic with gradient border via `::before` pseudo-element
- **Cards**: `.card`, `.service-card`, `.trust-card`, `.process-card`, `.about-card`, `.testimonial-card` — all share hover lift behavior
- **Layout**: `.section-split` (2-col), `.service-grid` (2-col), `.trust-grid` / `.cards-grid` (3-col), `.process-grid` (2-col)
- **Inline SVG icons**: No icon library — all icons are inline SVGs using `stroke="currentColor"`. Match the existing `viewBox="0 0 24 24"` style. Only use `<path>`, `<line>`, and `<rect>` elements — `<polygon>` and `<circle>` do not inherit `fill="none"` reliably and will render blank.
- **Hero visual**: `.hero-spotlight` uses a pure CSS gradient + grid pattern (no external image).

### Components

| Component | Type | Notes |
|-----------|------|-------|
| `site-header.tsx` | Server | Sticky dark nav, scroll-spy active state, mobile toggle |
| `site-footer.tsx` | Server | 3-column grid: brand + tagline (left), vertical nav links (center), contact + copyright (right) |
| `section-heading.tsx` | Server | Reusable eyebrow + h1/h2 + description block |
| `contact-form.tsx` | Client | 5 fields, Turnstile, `/api/contact` POST |
| `quote-form.tsx` | Client | 8 service checkboxes with SVG icons, dropdowns, Turnstile, `/api/quote` POST |
| `turnstile-widget.tsx` | Client | Cloudflare Turnstile wrapper, dark theme |
| `back-to-top.tsx` | Client | Fixed bottom-right, appears after 360px scroll |

### Environment Variables

Copy `.env.example` to `.env.local`. Required: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `NOTIFICATION_EMAIL`, `TURNSTILE_SECRET_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`. Optional: `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`.

### Testing

Tests use Node.js native test runner (`node --import tsx --test`). Test file at `tests/forms.test.ts` covers Zod schema validation and submission fingerprinting logic.

### Content Editing Quick Reference

| What to change | Where |
|----------------|-------|
| Any visible text, headlines, copy | `data/site-content.ts` |
| All 8 service cards (title, description, bullets) | `data/site-content.ts` → `services` array |
| "Best for" taglines on service cards | `data/site-content.ts` → `serviceBestFor` array (must stay 8 items, index-matched) |
| Which 4 services appear on the home page | `app/page.tsx` → `featuredServices` array + `serviceIcons` array (keep in sync) |
| Service icons on the full services page | `app/services/page.tsx` → `serviceIcons` array (8 items, index-matched to `services`) |
| Testimonials | `data/site-content.ts` → `testimonials` array |
| Platforms strip | `data/site-content.ts` → `platforms` array |
| FAQ items | `data/site-content.ts` → `faqItems` array |
| "What happens next" steps (contact page) | `data/site-content.ts` → `nextSteps` array |
| Quote form service checkboxes | `data/site-content.ts` → `quoteOptions` array + `serviceIcons` record in `components/quote-form.tsx` |
| Company email, phone, service area | `data/site-content.ts` → `company` object |
| Navigation links | `data/site-content.ts` → `navigation` array |
| Colors, spacing, typography | `app/globals.css` CSS variables |
| Page layout / section order | Individual page file in `app/` |
