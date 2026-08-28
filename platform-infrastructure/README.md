# InfraNest Technologies

Multi-page marketing site for InfraNest Technologies — a managed IT services company. Built with Next.js 15 App Router. Primary purpose: lead capture via contact and quote request forms, with backend lead storage and email notifications.

## Stack

- `Next.js 15` App Router (static + server-rendered pages)
- `TypeScript`
- `Amazon DynamoDB` for lead storage (`leads` and `quote_requests` tables)
- `Amazon SES` for email notifications on new submissions
- `Cloudflare Turnstile` for bot/spam protection on forms
- `AWS Amplify Hosting` for deployment
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
| `LEADS_TABLE_NAME` | Yes | DynamoDB table for contact form leads |
| `QUOTE_REQUESTS_TABLE_NAME` | Yes | DynamoDB table for quote requests |
| `ACKNOWLEDGMENTS_TABLE_NAME` | Yes | DynamoDB table holding one row per address that has been sent an acknowledgment |
| `AWS_REGION` | No | Defaults to `us-east-1`. Lambda sets this automatically in Amplify, so it only matters locally |
| `NOTIFICATION_EMAIL` | Yes | Email address for lead notifications |
| `NOTIFICATION_FROM` | Yes | Sender address, on a domain verified in SES. SES refuses unverified senders, so there is no fallback |
| `TURNSTILE_SECRET_KEY` | Yes | Cloudflare Turnstile secret |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Yes | Cloudflare Turnstile site key |
| `NEXT_PUBLIC_SITE_URL` | Yes | Canonical site URL |
| `NEXT_PUBLIC_FORMSPREE_FALLBACK_EMAIL` | No | Fallback public email |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | No | Domain for Plausible analytics |

## Database

Run [`infrastructure/create-tables.sh`](infrastructure/create-tables.sh) to create the `leads` and `quote_requests` DynamoDB tables used by the API routes:

```bash
./infrastructure/create-tables.sh us-east-1
```

The script is applied by hand, so committing a change to it does nothing on its own. It is idempotent — existing tables are skipped.

Both tables use `email` as the partition key and `created_at` as the sort key. That is not incidental: it is what makes the duplicate-submission check a bounded range query against a single partition rather than a table scan. The script also enables point-in-time recovery, since leads are business records.

AWS credentials are never read from environment variables. Locally the default credential chain applies; in Amplify the compute role supplies them, and it should be scoped to `dynamodb:PutItem` and `dynamodb:Query` on just these two tables plus `ses:SendEmail`.

## Production checklist

- [ ] Run `infrastructure/create-tables.sh` against the live account to create both DynamoDB tables.
- [ ] Verify the sending domain in SES and set `NOTIFICATION_FROM` to an address on it, then send a test lead through both forms to confirm it arrives. Note that SES starts in a sandbox that only delivers to verified addresses.
- [ ] Set all variables listed above in Amplify. Anything missing is logged on server start — check the deployment logs for `Missing required environment variables`.
- [ ] Confirm `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is set. With the secret set but the site key missing, the widget never renders and every submission is rejected.

## Security headers

[`next.config.ts`](next.config.ts) sends CSP, HSTS, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, and `Permissions-Policy` on every route. The CSP allows `challenges.cloudflare.com` (Turnstile) and `plausible.io` (analytics); everything else is same-origin. It is applied in production only, since the dev server needs `unsafe-eval` for hot reload. Adding any third-party script means adding its host here first.

## Tests

```bash
npm test       # Zod schema validation, service selection rules, email normalisation
npm run build  # Full production build check
```
