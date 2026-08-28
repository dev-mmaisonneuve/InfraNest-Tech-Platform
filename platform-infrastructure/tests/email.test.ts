import test, { mock } from "node:test";
import assert from "node:assert/strict";

/**
 * Tests for the acknowledgment email's configuration guard.
 *
 * The failure this pins down is silent and misleading: with NOTIFICATION_EMAIL
 * unset, SES would happily send the acknowledgment anyway — it only requires a
 * sender — but with no Reply-To, so the footer's promise that replying reaches
 * InfraNest would route visitor replies to the unmonitored sending address.
 *
 * The env module is mocked with a mutable object so tests can flip the
 * configuration at call time; lib/email reads env properties per call, not at
 * import. SES is mocked at the SDK boundary so no network is involved.
 */

const sesSends: Array<Record<string, unknown>> = [];

const fakeEnv: {
  awsRegion: string;
  notificationFrom: string | undefined;
  notificationEmail: string | undefined;
} = {
  awsRegion: "us-east-1",
  notificationFrom: "InfraNest Website <notifications@infranests.com>",
  notificationEmail: undefined,
};

mock.module("@/lib/env", {
  namedExports: { env: fakeEnv, isProduction: false },
});

mock.module("@aws-sdk/client-sesv2", {
  namedExports: {
    SESv2Client: class {
      send(command: { input: Record<string, unknown> }) {
        sesSends.push(command.input);
        return Promise.resolve({});
      }
    },
    SendEmailCommand: class {
      input: Record<string, unknown>;
      constructor(input: Record<string, unknown>) {
        this.input = input;
      }
    },
  },
});

test("refuses the acknowledgment when no monitored reply address is configured", async () => {
  sesSends.length = 0;
  fakeEnv.notificationEmail = undefined;

  const { sendAcknowledgmentEmail } = await import("@/lib/email");

  await assert.rejects(
    () => sendAcknowledgmentEmail("contact", "casey@example.com"),
    /Notification email is not configured/,
  );
  assert.equal(sesSends.length, 0, "nothing may reach SES when the promise in the footer cannot be kept");
});

test("sends with Reply-To pointing at the monitored inbox when configured", async () => {
  sesSends.length = 0;
  fakeEnv.notificationEmail = "info@infranests.com";

  const { sendAcknowledgmentEmail } = await import("@/lib/email");
  await sendAcknowledgmentEmail("quote", "casey@example.com");

  assert.equal(sesSends.length, 1);
  const input = sesSends[0] as {
    Destination: { ToAddresses: string[] };
    ReplyToAddresses?: string[];
    FromEmailAddress: string;
  };
  assert.deepEqual(input.Destination.ToAddresses, ["casey@example.com"]);
  assert.deepEqual(input.ReplyToAddresses, ["info@infranests.com"]);
  assert.equal(input.FromEmailAddress, fakeEnv.notificationFrom);
});

test("the notification itself still fails loudly without a recipient", async () => {
  // Pre-existing behaviour, pinned here so the two guards stay consistent: the
  // internal notification and the acknowledgment must both refuse to operate on
  // a half-configured environment rather than degrade in different ways.
  sesSends.length = 0;
  fakeEnv.notificationEmail = undefined;

  const { sendNotificationEmail } = await import("@/lib/email");

  await assert.rejects(
    () => sendNotificationEmail({ subject: "s", heading: "h", rows: [["a", "b"]] }),
    /Notification email is not configured/,
  );
  assert.equal(sesSends.length, 0);
});

// ── toSafeFirstName ──────────────────────────────────────────────────────────
// The only place visitor-supplied text is echoed into the acknowledgment, which
// goes to an address the same visitor chose. Escaping is not sufficient on its
// own: a "name" that is syntactically harmless can still smuggle a URL, a phone
// number, or a sentence of instructions into a stranger's inbox under this
// domain. These pin the allowlist, not just the escaping.

test("keeps an ordinary first name and drops the rest of the input", async () => {
  const { toSafeFirstName } = await import("@/lib/email");

  assert.equal(toSafeFirstName("Casey Founder"), "Casey");
  assert.equal(toSafeFirstName("  Mike   M.  "), "Mike");
});

test("preserves punctuation that genuinely occurs inside names", async () => {
  const { toSafeFirstName } = await import("@/lib/email");

  assert.equal(toSafeFirstName("Anne-Marie Dubois"), "Anne-Marie");
  assert.equal(toSafeFirstName("O'Brien"), "O'Brien");
  assert.equal(toSafeFirstName("Zoë Müller"), "Zoë");
});

test("rejects non-name input outright rather than laundering it into a name", async () => {
  const { toSafeFirstName } = await import("@/lib/email");

  // Stripping disallowed characters would turn these into plausible-looking
  // tokens ("httpevilexample", "scriptalertscript") and echo attacker-chosen
  // text into a branded greeting. They must be refused, not repaired.
  assert.equal(toSafeFirstName("http://evil.example"), "");
  assert.equal(toSafeFirstName("<script>alert(1)</script>"), "");
  assert.equal(toSafeFirstName("6175551234"), "");
  assert.equal(toSafeFirstName("casey@example.com"), "");
});

test("rejects punctuation-only tokens that would render as a broken greeting", async () => {
  const { toSafeFirstName } = await import("@/lib/email");

  // These previously passed a length check that counted characters rather than
  // letters, producing greetings like "Hi --,".
  assert.equal(toSafeFirstName("--"), "");
  assert.equal(toSafeFirstName("''"), "");
  assert.equal(toSafeFirstName("!!!"), "");
});

test("trims surrounding punctuation so ordinary typing still works", async () => {
  const { toSafeFirstName } = await import("@/lib/email");

  assert.equal(toSafeFirstName("Casey,"), "Casey");
  assert.equal(toSafeFirstName("(Casey)"), "Casey");
});

test("takes only the first token, so a sentence cannot be delivered", async () => {
  const { toSafeFirstName } = await import("@/lib/email");

  assert.equal(toSafeFirstName("Call 6175551234 now"), "Call");
  assert.equal(toSafeFirstName("Visit http://evil.example for details"), "Visit");
});

test("rejects an over-long token instead of truncating it", async () => {
  const { toSafeFirstName } = await import("@/lib/email");

  // Truncating would again manufacture an acceptable token out of input that
  // was never a name.
  assert.equal(toSafeFirstName("A".repeat(200)), "");
});

test("still requires at least two letters", async () => {
  const { toSafeFirstName } = await import("@/lib/email");

  assert.equal(toSafeFirstName(""), "");
  assert.equal(toSafeFirstName("X"), "", "a single stray letter reads as noise, not a name");
});

test("greets by name when safe and impersonally when not", async () => {
  sesSends.length = 0;
  fakeEnv.notificationEmail = "info@infranests.com";
  const { sendAcknowledgmentEmail } = await import("@/lib/email");

  await sendAcknowledgmentEmail("contact", "casey@example.com", "Casey Founder");
  const named = JSON.stringify(sesSends[0]);
  assert.match(named, /Hi Casey,/);

  sesSends.length = 0;
  await sendAcknowledgmentEmail("contact", "casey@example.com", "!!!");
  assert.match(JSON.stringify(sesSends[0]), /Hi there,/);
});
