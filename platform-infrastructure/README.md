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
| `NOTIFICATION_FROM` | Prod | Sender address, on a domain verified in Resend. Unset, it falls back to `onboarding@resend.dev`, which only delivers to the Resend account owner |
| `TURNSTILE_SECRET_KEY` | Yes | Cloudflare Turnstile secret |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Yes | Cloudflare Turnstile site key |
| `NEXT_PUBLIC_SITE_URL` | Yes | Canonical site URL |
| `NEXT_PUBLIC_FORMSPREE_FALLBACK_EMAIL` | No | Fallback public email |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | No | Domain for Plausible analytics |

## Database

Apply [`supabase/schema.sql`](supabase/schema.sql) to your Supabase project to create the `leads` and `quote_requests` tables used by the API routes.

The file is applied by hand, so committing a change to it does nothing on its own. It also enables row level security on both tables — without that, PostgREST exposes every lead's name, email, phone, and message to anyone holding the project's anon key. The API routes use the service role key, which bypasses RLS, so applying it does not affect them.

## Production checklist

- [ ] Apply `supabase/schema.sql` to the live project, including the RLS statements and the `(email, created_at)` indexes.
- [ ] Set `NOTIFICATION_FROM` to an address on a Resend-verified domain, and send a test lead through both forms to confirm it arrives.
- [ ] Set all variables listed above in Vercel. Anything missing is logged on server start — check the deployment logs for `Missing required environment variables`.
- [ ] Confirm `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is set. With the secret set but the site key missing, the widget never renders and every submission is rejected.

## Security headers

[`next.config.ts`](next.config.ts) sends CSP, HSTS, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, and `Permissions-Policy` on every route. The CSP allows `challenges.cloudflare.com` (Turnstile) and `plausible.io` (analytics); everything else is same-origin. It is applied in production only, since the dev server needs `unsafe-eval` for hot reload. Adding any third-party script means adding its host here first.

## Tests

```bash
npm test       # Zod schema validation, service selection rules, email normalisation
npm run build  # Full production build check
```
