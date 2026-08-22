import { env, isProduction } from "@/lib/env";

export type TurnstileResult = {
  /** Whether the submission is allowed to proceed. */
  ok: boolean;
  /** Whether Cloudflare actually validated a token, for accurate record-keeping. */
  verified: boolean;
};

export async function verifyTurnstileToken(token?: string): Promise<TurnstileResult> {
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

  if (!token) {
    return { ok: false, verified: false };
  }

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      secret: env.turnstileSecretKey,
      response: token,
    }),
  });

  if (!response.ok) {
    return { ok: false, verified: false };
  }

  const payload = (await response.json()) as { success?: boolean };
  const success = Boolean(payload.success);
  return { ok: success, verified: success };
}
