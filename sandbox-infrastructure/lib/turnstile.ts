import { env, isProduction } from "@/lib/env";

export async function verifyTurnstileToken(token?: string) {
  if (!env.turnstileSecretKey) {
    return !isProduction;
  }

  if (!token) {
    return false;
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
    return false;
  }

  const payload = (await response.json()) as { success?: boolean };
  return Boolean(payload.success);
}
