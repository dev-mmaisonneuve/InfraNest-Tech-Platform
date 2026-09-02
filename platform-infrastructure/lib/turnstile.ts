import { env, isProduction } from "@/lib/env";
import { siteUrl } from "@/lib/site-url";

/**
 * Bound to the form that minted the token. Cloudflare echoes the action back
 * from siteverify, so a token solved on the contact form cannot be redeemed
 * against the quote endpoint.
 */
export type TurnstileAction = "contact" | "quote";

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/** Real tokens sit well under this; anything longer is not worth a round trip. */
const TOKEN_MAX_LENGTH = 2048;

/** Without a deadline a hung siteverify holds the request open indefinitely. */
const SITEVERIFY_TIMEOUT_MS = 10_000;

export type TurnstileResult = {
  /** Whether the submission is allowed to proceed. */
  ok: boolean;
  /** Whether Cloudflare actually validated a token, for accurate record-keeping. */
  verified: boolean;
};

type SiteverifyPayload = {
  success?: boolean;
  action?: string;
  hostname?: string;
  "error-codes"?: string[];
};

/**
 * The hostnames a solved challenge is allowed to have come from.
 *
 * Checking this is what stops a token minted by this widget on some other page
 * from being redeemed here — success alone only proves Cloudflare issued the
 * token, not where. The widget's own hostname list is the outer bound; this is
 * the per-deployment one.
 *
 * The default is derived from NEXT_PUBLIC_SITE_URL rather than read from a
 * dedicated variable so the allowlist can never be empty in production: that
 * variable is already required, and the build fails without it. A required
 * TURNSTILE_HOSTNAMES would instead turn one forgotten console entry into
 * every form submission being rejected.
 *
 * www.infranests.com serves the site directly rather than redirecting to the
 * apex, so both spellings are legitimate places to solve a challenge and the
 * counterpart is always included. Set TURNSTILE_HOSTNAMES to override the pair
 * entirely — the Amplify default domain needs that, for instance.
 */
function approvedHostnames(): Set<string> {
  const configured = (process.env.TURNSTILE_HOSTNAMES ?? "")
    .split(",")
    .map((hostname) => hostname.trim())
    .filter(Boolean);

  if (configured.length > 0) {
    return new Set(configured);
  }

  // Read live rather than through the module-scope `siteUrl` constant so the
  // allowlist can be exercised per case in tests. Importing site-url is still
  // what matters for safety: its build-time guard runs on import and fails a
  // production build with no NEXT_PUBLIC_SITE_URL, so the fallback below is
  // only ever reachable in development.
  const canonical = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? siteUrl).hostname;
  const hostnames = new Set([canonical]);
  hostnames.add(canonical.startsWith("www.") ? canonical.slice(4) : `www.${canonical}`);

  if (process.env.NODE_ENV !== "production") {
    hostnames.add("localhost");
    hostnames.add("127.0.0.1");
  }

  return hostnames;
}

export async function verifyTurnstileToken(
  token: string | undefined,
  action: TurnstileAction,
  remoteIp?: string,
): Promise<TurnstileResult> {
  if (!env.turnstileSecretKey) {
    if (isProduction) {
      // Without this the site silently rejects every submission with a generic
      // spam-protection error and nothing points at the missing config.
      console.error(
        "TURNSTILE_SECRET_KEY is not set. All form submissions will be rejected until it is configured.",
      );
      return { ok: false, verified: false };
    }

    // Local development convenience: allow through, but never claim it was checked.
    return { ok: true, verified: false };
  }

  if (typeof token !== "string" || token.length === 0 || token.length > TOKEN_MAX_LENGTH) {
    return { ok: false, verified: false };
  }

  const body = new URLSearchParams({
    secret: env.turnstileSecretKey,
    response: token,
  });

  // Optional, and only as good as the proxy chain in front of this handler —
  // sent when available because it sharpens Cloudflare's own risk scoring.
  if (remoteIp) {
    body.set("remoteip", remoteIp);
  }

  let payload: SiteverifyPayload;
  try {
    const response = await fetch(SITEVERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      signal: AbortSignal.timeout(SITEVERIFY_TIMEOUT_MS),
      body,
    });

    if (!response.ok) {
      return { ok: false, verified: false };
    }

    payload = (await response.json()) as SiteverifyPayload;
  } catch {
    return { ok: false, verified: false };
  }

  if (!payload.success) {
    return { ok: false, verified: false };
  }

  // The two checks below are logged because they are the ones that reject a
  // token Cloudflare itself considered valid. A visitor sees the same generic
  // message either way, so without a log there is nothing to diagnose from.
  if (payload.action !== action) {
    console.warn(
      `Turnstile rejected: action "${payload.action ?? ""}" did not match the expected "${action}".`,
    );
    return { ok: false, verified: false };
  }

  const approved = approvedHostnames();
  if (!payload.hostname || !approved.has(payload.hostname)) {
    console.warn(
      `Turnstile rejected: hostname "${payload.hostname ?? ""}" is not in the approved list ` +
        `(${[...approved].join(", ")}).`,
    );
    return { ok: false, verified: false };
  }

  return { ok: true, verified: true };
}
