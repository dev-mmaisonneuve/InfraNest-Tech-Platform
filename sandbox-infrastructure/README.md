# InfraNest Technologies

Multi-page marketing site for InfraNest Technologies — a managed IT services company. Built with Next.js 15 App Router. Primary purpose: lead capture via contact and quote request forms, with backend lead storage and email notifications.

## Stack

- `Next.js 15` App Router (static + server-rendered pages)
- `TypeScript`
- `Supabase` for lead storage (`leads` and `quote_requests` tables)
- `Resend` for email notifications on new submissions
- `Cloudflare Turnstile` for bot/spam protection on forms
- `Vercel` for deployment
- `Plausible` for optional analytics

## Local development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy env template and fill in values:
   ```bash
   cp .env.example .env.local
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```

## Commands

```bash
npm run dev       # Start local dev server
npm run build     # Production build
npm run start     # Start production server
npm test          # Run tests (Node.js native test runner with tsx)
```

## Required environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key |
| `RESEND_API_KEY` | Yes | Resend API key for email |
| `NOTIFICATION_EMAIL` | Yes | Email address for lead notifications |
| `TURNSTILE_SECRET_KEY` | Yes | Cloudflare Turnstile secret |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Yes | Cloudflare Turnstile site key |
| `NEXT_PUBLIC_SITE_URL` | Yes | Canonical site URL |
| `NEXT_PUBLIC_FORMSPREE_FALLBACK_EMAIL` | No | Fallback public email |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | No | Domain for Plausible analytics |

## Database

Apply [`supabase/schema.sql`](supabase/schema.sql) to your Supabase project to create the `leads` and `quote_requests` tables used by the API routes.

## Tests

```bash
npm test       # Zod schema validation + submission fingerprinting
npm run build  # Full production build check
```
