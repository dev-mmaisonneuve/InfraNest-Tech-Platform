export const env = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  resendApiKey: process.env.RESEND_API_KEY,
  notificationEmail: process.env.NOTIFICATION_EMAIL,
  notificationFrom: process.env.NOTIFICATION_FROM,
  turnstileSecretKey: process.env.TURNSTILE_SECRET_KEY,
  turnstileSiteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
};

export const isProduction = process.env.NODE_ENV === "production";

/** Everything the two form endpoints need in order to work end to end. */
const requiredRuntimeConfig: Array<[string, string | undefined]> = [
  ["SUPABASE_URL", env.supabaseUrl],
  ["SUPABASE_SERVICE_ROLE_KEY", env.supabaseServiceRoleKey],
  ["RESEND_API_KEY", env.resendApiKey],
  ["NOTIFICATION_EMAIL", env.notificationEmail],
  ["TURNSTILE_SECRET_KEY", env.turnstileSecretKey],
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
 * catches is otherwise silent — a missing RESEND_API_KEY leaves the lead stored
 * and the visitor thanked, with nothing surfacing that no one was notified.
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
