# InfraNest Full Website Build Plan

## Summary
Build a full functioning v1 website in `/Users/mikemsnnve/Documents/Playground/platform-infrastructure` by replacing the current single static page with a `Next.js` app deployed on `Vercel`, using `Supabase` for lead storage and `Resend` for email notifications. The site will launch with four public pages: Home, Services, About, and Contact, plus two working lead flows: a general contact form and a quote/service request form.

This plan prioritizes a polished user experience, real business functionality, and long-term manageability. The current [`index.html`](/Users/mikemsnnve/Documents/Playground/platform-infrastructure/index.html) can be used as a visual and content reference, but the design does not need to be preserved exactly. During implementation, we should either refine the current direction into a more premium version or redesign it entirely if that produces a more impressive result. No client login, portal, payments, blog, or scheduling in the first release.

## Product Direction
- Position the site as a premium startup service website: clear offer, strong visual identity, trust signals, and an obvious next step.
- Build a real application, not a static mockup: responsive frontend, working backend endpoints, persistent storage, email notifications, validation, and production deployment.
- Optimize for maintainability: simple page structure, code-managed content, minimal integrations, and no internal dashboard in v1.
- Treat the website as a lead-generation tool first, with enough polish to feel custom and credible.

## Key Changes

### Architecture
- Frontend: `Next.js` App Router, responsive multi-page marketing site, reusable layout/components, SEO-friendly server rendering, and a custom design system for a more premium look.
- Backend: `Next.js` route handlers for form submission. This is the default choice for clarity, portability, and easier testing.
- Database: `Supabase Postgres` with one `leads` table and one `quote_requests` table, each with explicit timestamps and submission metadata.
- Email: `Resend` to send notification emails for both forms to the business inbox.
- Hosting: `Vercel` for production deployment and preview deployments.
- Spam protection: `Cloudflare Turnstile` on both public forms.
- Analytics: add a lightweight analytics integration in v1; default to `Plausible` unless business tooling requires Google Analytics later.

### Public site behavior
- `Home`: premium landing page with a strong headline, short value proposition, visual hero, primary CTA, service overview, proof/trust section, and contact path.
- `Services`: clear breakdown of offerings, who they are for, likely outcomes, engagement flow, and CTA into quote form.
- `About`: founder/business positioning, working style, service area, process, and why clients should trust the business.
- `Contact`: direct contact details plus general inquiry form.
- Global header/footer navigation across all pages.
- Use current logo assets only if they support the new direction; otherwise refine branding, typography, spacing, and layout into a more intentional production-ready system.
- Include tasteful motion, stronger typography, and visual hierarchy so the site feels custom rather than template-like.

### Functional requirements
- Multi-page routing with dedicated page-level metadata.
- Shared header, footer, and responsive mobile navigation.
- Working contact form connected to backend validation, spam protection, database storage, and email notification.
- Working quote form connected to backend validation, spam protection, database storage, and email notification.
- Server-side validation and typed request handling for both forms.
- Structured content modules so copy can be updated without digging through component markup.
- Production-ready environment variable handling and deployment setup.

### Form and data interfaces
- `Contact form` fields:
  - `name`
  - `email`
  - `phone` optional
  - `company` optional
  - `message`
- `Quote form` fields:
  - `name`
  - `email`
  - `phone` optional
  - `company` optional
  - `service_interest` multi-select or checkbox group
  - `project_summary`
  - `timeline` optional
  - `budget_range` optional
- Backend validation on all fields with server-side schema validation.
- On successful submit:
  - save record to Supabase
  - send notification email to business inbox
  - show user-facing success state
- On failure:
  - keep user on form
  - show a clear inline error message
  - do not lose already entered values where feasible

### Content and editing model
- Store page content in code as structured constants/data modules, not scattered inline strings.
- No CMS in v1.
- No authenticated admin area in v1.
- Supabase dashboard is the official submission review workflow.
- Keep copy concise enough that future edits remain easy for a non-technical founder to request and maintain.

## Public APIs / Interfaces / Types
- `POST /api/contact`
  - input: contact form payload
  - output: success/error JSON for client form handling
- `POST /api/quote`
  - input: quote request payload
  - output: success/error JSON for client form handling
- Core shared types:
  - `ContactSubmission`
  - `QuoteRequestSubmission`
  - `ServiceInterest`
- Database tables:
  - `leads`
  - `quote_requests`
- Recommended shared columns on both tables:
  - `id`
  - `created_at`
  - `name`
  - `email`
  - `phone`
  - `company`
  - `source`
  - `status`
  - `turnstile_verified`
- Quote-specific columns:
  - `service_interest`
  - `project_summary`
  - `timeline`
  - `budget_range`
- Environment variables:
  - Supabase URL/key
  - Resend API key
  - destination notification email
  - Turnstile site key/secret
  - public site URL for canonical/open graph metadata

## Content Strategy
- Keep the message simple: what InfraNest does, who it helps, why it is trustworthy, and how to get started.
- Avoid vague enterprise language in v1.
- Write copy in a direct, founder-friendly tone.
- Default CTA should be a quote/request conversation, with contact as the lower-friction alternate path.

## Visual Direction
- The existing design may be reused, evolved, or replaced depending on which path produces the strongest result.
- The final site should feel polished, modern, and custom, not like a default starter theme.
- Favor strong spacing, confident typography, clear section structure, refined color usage, and restrained animation.
- If the current design is kept, it should be upgraded substantially in layout quality, responsiveness, and visual hierarchy.

## Test Plan
- Page rendering:
  - all four pages load without runtime errors
  - navigation works on desktop and mobile
  - metadata/canonical tags are present
- Forms:
  - valid contact form stores record and sends email
  - valid quote form stores record and sends email
  - invalid submissions show validation errors
  - duplicate rapid submissions are blocked or gracefully handled
  - spam protection is enforced
- Responsiveness:
  - layout works cleanly on mobile, tablet, and desktop
  - mobile nav opens/closes correctly
- Accessibility:
  - keyboard navigation works across nav, buttons, and forms
  - labels, focus states, and error messaging are screen-reader friendly
- Automation targets:
  - unit tests for schema validation and submit handlers
  - at least one end-to-end happy path per form
  - manual visual QA for layout, copy, and mobile polish
- Production readiness:
  - environment variables required at build/runtime are documented
  - deployment works on Vercel preview and production
  - forms still function against production Supabase and email provider

## Assumptions And Defaults
- Recommended stack is locked as `Next.js + Vercel + Supabase + Resend + Turnstile`.
- v1 scope is a marketing/business website, not a client portal.
- Content will be edited in code by default.
- Submission review happens in Supabase, not a custom internal dashboard.
- Blog, case studies, booking, CRM integration, auth, and payments are out of scope for v1.
- The build workspace is `/Users/mikemsnnve/Documents/Playground/platform-infrastructure`.
- The existing [`index.html`](/Users/mikemsnnve/Documents/Playground/platform-infrastructure/index.html) is only a reference point, not a design constraint.
