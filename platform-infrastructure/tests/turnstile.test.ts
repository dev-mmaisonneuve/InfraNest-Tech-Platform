import test from "node:test";
import assert from "node:assert/strict";

/**
 * lib/env reads TURNSTILE_SECRET_KEY once at module scope, so it has to be set
 * before the first import. Everything the allowlist depends on is read per
 * call, so one module instance serves every case.
 */
type Verifier = (
  token: string | undefined,
  action: "contact" | "quote",
  remoteIp?: string,
) => Promise<{ ok: boolean; verified: boolean }>;

let cached: Verifier | undefined;

/** Imported lazily so the secret is in place before lib/env snapshots it. */
async function verifier(): Promise<Verifier> {
  if (!cached) {
    process.env.TURNSTILE_SECRET_KEY = "test-secret";
    cached = (await import("@/lib/turnstile")).verifyTurnstileToken as Verifier;
  }
  return cached;
}

type Environment = Record<string, string | undefined>;

/** Applies an environment for one case and hands back the undo. */
function withEnvironment(environment: Environment) {
  const previous: Environment = {};
  for (const [key, value] of Object.entries(environment)) {
    previous[key] = process.env[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }

  return () => {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  };
}

/** Stands in for siteverify, recording the body so the request can be asserted on. */
function stubSiteverify(payload: unknown, status = 200) {
  const calls: URLSearchParams[] = [];
  const original = globalThis.fetch;

  globalThis.fetch = (async (_url: string, init: { body: URLSearchParams }) => {
    calls.push(init.body);
    return { ok: status === 200, status, json: async () => payload };
  }) as unknown as typeof fetch;

  return { calls, restore: () => { globalThis.fetch = original; } };
}

const productionEnv: Environment = {
  NODE_ENV: "production",
  NEXT_PUBLIC_SITE_URL: "https://infranests.com",
  TURNSTILE_HOSTNAMES: undefined,
};

test("accepts a token whose action and hostname both match", async () => {
  const verify = await verifier();
  const restore = withEnvironment(productionEnv);
  const siteverify = stubSiteverify({ success: true, action: "quote", hostname: "infranests.com" });

  const result = await verify("token", "quote");
  assert.deepEqual(result, { ok: true, verified: true });

  siteverify.restore();
  restore();
});

test("accepts the www counterpart, which serves the site rather than redirecting", async () => {
  const verify = await verifier();
  const restore = withEnvironment(productionEnv);
  const siteverify = stubSiteverify({ success: true, action: "contact", hostname: "www.infranests.com" });

  assert.equal((await verify("token", "contact")).ok, true);

  siteverify.restore();
  restore();
});

test("rejects a token solved on a hostname that is not approved", async () => {
  const verify = await verifier();
  const restore = withEnvironment(productionEnv);
  const siteverify = stubSiteverify({ success: true, action: "quote", hostname: "attacker.example" });

  assert.deepEqual(await verify("token", "quote"), { ok: false, verified: false });

  siteverify.restore();
  restore();
});

test("rejects a token minted for the other form", async () => {
  const verify = await verifier();
  const restore = withEnvironment(productionEnv);
  const siteverify = stubSiteverify({ success: true, action: "contact", hostname: "infranests.com" });

  assert.deepEqual(await verify("token", "quote"), { ok: false, verified: false });

  siteverify.restore();
  restore();
});

test("rejects a token carrying no action at all", async () => {
  const verify = await verifier();
  const restore = withEnvironment(productionEnv);
  const siteverify = stubSiteverify({ success: true, hostname: "infranests.com" });

  assert.equal((await verify("token", "quote")).ok, false);

  siteverify.restore();
  restore();
});

test("TURNSTILE_HOSTNAMES replaces the derived pair outright", async () => {
  const verify = await verifier();
  const restore = withEnvironment({
    ...productionEnv,
    TURNSTILE_HOSTNAMES: "main.duvgb0v6cgit7.amplifyapp.com",
  });
  const siteverify = stubSiteverify({ success: true, action: "quote", hostname: "main.duvgb0v6cgit7.amplifyapp.com" });

  assert.equal((await verify("token", "quote")).ok, true);

  siteverify.restore();

  // ...and having replaced it, the canonical host is no longer implied.
  const second = stubSiteverify({ success: true, action: "quote", hostname: "infranests.com" });
  assert.equal((await verify("token", "quote")).ok, false);
  second.restore();

  restore();
});

test("localhost is approved outside production only", async () => {
  const verify = await verifier();
  const development = withEnvironment({
    ...productionEnv,
    NODE_ENV: "development",
    NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
  });
  const permitted = stubSiteverify({ success: true, action: "contact", hostname: "localhost" });
  assert.equal((await verify("token", "contact")).ok, true);
  permitted.restore();
  development();

  const production = withEnvironment(productionEnv);
  const rejected = stubSiteverify({ success: true, action: "contact", hostname: "localhost" });
  assert.equal((await verify("token", "contact")).ok, false);
  rejected.restore();
  production();
});

test("sends remoteip when the caller has one, and omits it otherwise", async () => {
  const verify = await verifier();
  const restore = withEnvironment(productionEnv);
  const siteverify = stubSiteverify({ success: true, action: "quote", hostname: "infranests.com" });

  await verify("token", "quote", "203.0.113.7");
  assert.equal(siteverify.calls[0].get("remoteip"), "203.0.113.7");

  await verify("token", "quote");
  assert.equal(siteverify.calls[1].has("remoteip"), false);

  siteverify.restore();
  restore();
});

test("refuses an oversized token without calling siteverify", async () => {
  const verify = await verifier();
  const restore = withEnvironment(productionEnv);
  const siteverify = stubSiteverify({ success: true, action: "quote", hostname: "infranests.com" });

  assert.equal((await verify("x".repeat(2049), "quote")).ok, false);
  assert.equal(siteverify.calls.length, 0);

  siteverify.restore();
  restore();
});

test("a failed siteverify request is a rejection, not an exception", async () => {
  const verify = await verifier();
  const restore = withEnvironment(productionEnv);
  const siteverify = stubSiteverify({}, 502);

  assert.deepEqual(await verify("token", "quote"), { ok: false, verified: false });

  siteverify.restore();
  restore();
});
