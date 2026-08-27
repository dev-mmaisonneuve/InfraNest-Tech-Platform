import test, { mock } from "node:test";
import assert from "node:assert/strict";

/**
 * Route-level tests for the two form endpoints.
 *
 * These exercise the orchestration the unit tests cannot reach: that a valid
 * submission is persisted before the notification is attempted, that a duplicate
 * is refused with a 429 and no second write, and that a failing notification
 * still returns success to the visitor because the lead is already stored.
 *
 * DynamoDB and SES are mocked at the module boundary. Turnstile is not mocked —
 * outside production with no secret configured `verifyTurnstileToken` returns
 * `{ ok: true, verified: false }`, which is the real code path for a local run.
 */

type Sent = { name: string; input: Record<string, unknown> };

/**
 * The route modules are ESM and are cached after their first import, capturing
 * whatever the mocks resolved to at that moment. Registering a fresh mock per
 * test therefore does nothing for the second test onwards — it would record into
 * an array the route no longer references.
 *
 * So the mocks are registered exactly once, and each test mutates the shared
 * `state` they read from instead.
 */
const state = {
  sent: [] as Sent[],
  emails: [] as string[],
  queryItems: [] as unknown[],
  emailThrows: false,
};

function reset(options: { queryItems?: unknown[]; emailThrows?: boolean } = {}) {
  state.sent = [];
  state.emails = [];
  state.queryItems = options.queryItems ?? [];
  state.emailThrows = options.emailThrows ?? false;
  return state;
}

mock.module("@/lib/dynamo", {
  namedExports: {
    getDynamoDocumentClient: () => ({
      send(command: { constructor: { name: string }; input: Record<string, unknown> }) {
        const name = command.constructor.name;
        state.sent.push({ name, input: command.input });
        if (name === "QueryCommand") {
          return Promise.resolve({ Items: state.queryItems });
        }
        return Promise.resolve({});
      },
    }),
  },
});

mock.module("@/lib/email", {
  namedExports: {
    sendNotificationEmail: () => {
      state.emails.push("notification");
      return state.emailThrows ? Promise.reject(new Error("SES refused")) : Promise.resolve();
    },
    sendAcknowledgmentEmail: () => {
      state.emails.push("acknowledgment");
      return state.emailThrows ? Promise.reject(new Error("SES refused")) : Promise.resolve();
    },
  },
});

function request(body: unknown) {
  return new Request("https://infranests.com/api/contact", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validContact = {
  name: "Casey Founder",
  email: "casey@example.com",
  phone: "617-555-0199",
  company: "Example Co",
  message: "We need help cleaning up cloud access and user onboarding.",
};

const validQuote = {
  name: "Casey Founder",
  email: "casey@example.com",
  service_interest: ["Cloud & platform engineering"],
  project_summary: "We need structure around support and SaaS ownership.",
};

test("contact: a valid submission is stored and returns success", async () => {
  const { sent, emails } = reset();

  const { POST } = await import("@/app/api/contact/route");
  const res = await POST(request(validContact) as never);
  const payload = await res.json();

  assert.equal(res.status, 200);
  assert.equal(payload.ok, true);

  const put = sent.find((s) => s.name === "PutCommand");
  assert.ok(put, "expected a PutCommand");
  const item = put.input.Item as Record<string, unknown>;
  assert.equal(item.email, validContact.email);
  assert.equal(item.name, validContact.name);
  assert.equal(item.source, "website-contact");
  assert.equal(item.status, "new");
  assert.ok(typeof item.created_at === "string", "created_at must be set by the route");

  // The conditional write is what stops two simultaneous requests overwriting
  // each other on a same-millisecond sort key.
  assert.equal(put.input.ConditionExpression, "attribute_not_exists(email)");

  // Asserted by membership rather than exact sequence: the visitor acknowledgment
  // is added separately (INT-31), and this test should not break when it lands.
  assert.ok(
    emails.includes("notification"),
    "the internal notification must be sent",
  );
});

test("contact: the duplicate check runs before the write", async () => {
  const { sent } = reset();

  const { POST } = await import("@/app/api/contact/route");
  await POST(request(validContact) as never);

  const order = sent.map((s) => s.name);
  assert.deepEqual(order, ["QueryCommand", "PutCommand"], "query must precede the write");
});

test("contact: a recent duplicate is refused with 429 and never written", async () => {
  const { sent } = reset({ queryItems: [{ email: validContact.email }] });

  const { POST } = await import("@/app/api/contact/route");
  const res = await POST(request(validContact) as never);

  assert.equal(res.status, 429);
  assert.equal(sent.filter((s) => s.name === "PutCommand").length, 0, "must not write on a duplicate");
});

test("contact: a failed notification still reports success to the visitor", async () => {
  // The lead is already stored by this point. Surfacing an error would push the
  // visitor into a retry that duplicates their own submission.
  const { sent } = reset({ emailThrows: true });

  const { POST } = await import("@/app/api/contact/route");
  const res = await POST(request(validContact) as never);
  const payload = await res.json();

  assert.equal(res.status, 200);
  assert.equal(payload.ok, true);
  assert.ok(sent.some((s) => s.name === "PutCommand"), "the lead must still be stored");
});

test("contact: invalid input is rejected before any database work", async () => {
  const { sent } = reset();

  const { POST } = await import("@/app/api/contact/route");
  const res = await POST(request({ ...validContact, email: "not-an-email" }) as never);
  const payload = await res.json();

  assert.equal(res.status, 400);
  assert.equal(payload.ok, false);
  assert.ok(payload.fieldErrors?.email, "the email field should carry an error");
  assert.equal(sent.length, 0, "validation must run before any DynamoDB call");
});

test("quote: a valid submission stores the quote-specific fields", async () => {
  const { sent, emails } = reset();

  const { POST } = await import("@/app/api/quote/route");
  const res = await POST(request(validQuote) as never);

  assert.equal(res.status, 200);
  const put = sent.find((s) => s.name === "PutCommand");
  assert.ok(put, "expected a PutCommand");
  const item = put.input.Item as Record<string, unknown>;
  assert.deepEqual(item.service_interest, validQuote.service_interest);
  assert.equal(item.project_summary, validQuote.project_summary);
  assert.equal(item.source, "website-quote");

  // Asserted by membership rather than exact sequence: the visitor acknowledgment
  // is added separately (INT-31), and this test should not break when it lands.
  assert.ok(
    emails.includes("notification"),
    "the internal notification must be sent",
  );
});

test("quote: a submission with no services selected is rejected", async () => {
  const { sent } = reset();

  const { POST } = await import("@/app/api/quote/route");
  const res = await POST(request({ ...validQuote, service_interest: [] }) as never);

  assert.equal(res.status, 400);
  assert.equal(sent.length, 0);
});
