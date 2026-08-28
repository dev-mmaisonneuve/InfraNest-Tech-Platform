export const env = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  // Lambda sets AWS_REGION automatically, so this resolves correctly in Amplify
  // without anyone configuring it. The fallback only matters locally.
  awsRegion: process.env.AWS_REGION ?? "us-east-1",
  leadsTableName: process.env.LEADS_TABLE_NAME ?? "infranest-leads",
  quoteRequestsTableName: process.env.QUOTE_REQUESTS_TABLE_NAME ?? "infranest-quote-requests",
  acknowledgmentsTableName: process.env.ACKNOWLEDGMENTS_TABLE_NAME ?? "infranest-acknowledgments",
  notificationEmail: process.env.NOTIFICATION_EMAIL,
  notificationFrom: process.env.NOTIFICATION_FROM,
  turnstileSecretKey: process.env.TURNSTILE_SECRET_KEY,
  turnstileSiteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
};

export const isProduction = process.env.NODE_ENV === "production";

/** Everything the two form endpoints need in order to work end to end. */
const requiredRuntimeConfig: Array<[string, string | undefined]> = [
  // Checked against the raw values rather than the `env` fields below, because
  // those fall back to defaults. A default table name that does not exist in the
  // account fails at write time with a ResourceNotFoundException per submission,
  // which is exactly the silent breakage this check exists to pre-empt.
  ["LEADS_TABLE_NAME", process.env.LEADS_TABLE_NAME],
  ["QUOTE_REQUESTS_TABLE_NAME", process.env.QUOTE_REQUESTS_TABLE_NAME],
  ["ACKNOWLEDGMENTS_TABLE_NAME", process.env.ACKNOWLEDGMENTS_TABLE_NAME],
  ["NOTIFICATION_EMAIL", env.notificationEmail],
  // SES rejects any sender that is not on a verified identity, so unlike the
  // previous Resend setup there is no usable fallback to degrade to.
  ["NOTIFICATION_FROM", env.notificationFrom],
  ["TURNSTILE_SECRET_KEY", env.turnstileSecretKey],
  // Without the public site key the widget never renders, so the form sends an
  // empty token and the secret-key check above rejects every submission.
  ["NEXT_PUBLIC_TURNSTILE_SITE_KEY", env.turnstileSiteKey],
  // Checked against the raw value because `env.siteUrl` falls back to localhost:
  // unset, the sitemap and OG metadata would publish localhost URLs.
  ["NEXT_PUBLIC_SITE_URL", process.env.NEXT_PUBLIC_SITE_URL],
];

export function getMissingRuntimeConfig() {
  return requiredRuntimeConfig.filter(([, value]) => !value).map(([name]) => name);
}

/**
 * Reports missing configuration once when the server boots.
 *
 * This logs rather than throwing on purpose: the marketing pages are static and
 * work fine without any of these, so failing hard would take the whole site down
 * over a missing key that only the forms need. It matters because the failure it
 * catches is otherwise silent — a missing NOTIFICATION_FROM leaves the lead
 * stored and the visitor thanked, with nothing surfacing that no one was notified.
 */
export function reportRuntimeConfig() {
  const missing = getMissingRuntimeConfig();

  if (missing.length === 0) {
    return;
  }

  const names = missing.join(", ");

  if (isProduction) {
    console.error(
      `Missing required environment variables: ${names}. Form submissions will not work correctly until these are set.`,
    );
    return;
  }

  console.warn(`Missing environment variables: ${names}. Forms will not work locally until these are set.`);
}
