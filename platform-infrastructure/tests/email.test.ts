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
