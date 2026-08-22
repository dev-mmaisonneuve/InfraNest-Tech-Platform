/**
 * Next.js calls this once per server start (per cold start on Vercel).
 *
 * It exists so a misconfigured deployment announces itself in the logs instead
 * of surfacing later as forms that quietly do not deliver.
 */
export async function register() {
  // Guarded so the check runs once on the server rather than in the edge runtime too.
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    return;
  }

  const { reportRuntimeConfig } = await import("@/lib/env");
  reportRuntimeConfig();
}
