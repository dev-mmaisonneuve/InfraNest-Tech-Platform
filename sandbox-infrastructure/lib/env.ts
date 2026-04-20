export const env = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  resendApiKey: process.env.RESEND_API_KEY,
  notificationEmail: process.env.NOTIFICATION_EMAIL,
  turnstileSecretKey: process.env.TURNSTILE_SECRET_KEY,
  turnstileSiteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
};

export const isProduction = process.env.NODE_ENV === "production";

export function assertRuntimeConfig() {
  const missing = [
    ["SUPABASE_URL", env.supabaseUrl],
    ["SUPABASE_SERVICE_ROLE_KEY", env.supabaseServiceRoleKey],
    ["RESEND_API_KEY", env.resendApiKey],
    ["NOTIFICATION_EMAIL", env.notificationEmail],
  ].filter(([, value]) => !value);

  if (missing.length > 0) {
    throw new Error(`Missing runtime env vars: ${missing.map(([name]) => name).join(", ")}`);
  }
}
