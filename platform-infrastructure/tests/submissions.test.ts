import test from "node:test";
import assert from "node:assert/strict";

import type { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

import { ConditionalCheckFailedException } from "@aws-sdk/client-dynamodb";

import { claimAcknowledgmentSlot, isDuplicateSubmission } from "@/lib/submissions";

type SentCommand = { input: Record<string, unknown> };

/** Minimal stand-in for the document client: records the command, returns a canned result. */
function stubClient(result: unknown | (() => never)) {
  const sent: SentCommand[] = [];

  const client = {
    send(command: SentCommand) {
      sent.push(command);
      if (typeof result === "function") {
        return Promise.reject((result as () => never)());
      }
      return Promise.resolve(result);
    },
  } as unknown as DynamoDBDocumentClient;

  return { client, sent };
}

test("reports a duplicate when a recent item exists", async () => {
  const { client } = stubClient({ Items: [{ email: "casey@example.com" }] });

  assert.equal(await isDuplicateSubmission(client, "leads", "casey@example.com"), true);
});

test("allows the submission when no recent item exists", async () => {
  const { client } = stubClient({ Items: [] });

  assert.equal(await isDuplicateSubmission(client, "leads", "casey@example.com"), false);
});

test("allows the submission when DynamoDB returns no Items key at all", async () => {
  const { client } = stubClient({});

  assert.equal(await isDuplicateSubmission(client, "leads", "casey@example.com"), false);
});

test("fails open when the query throws", async () => {
  // Losing a real lead is worse than accepting a duplicate, so a broken check
  // must let the submission through rather than reject it.
  const { client } = stubClient(() => {
    throw new Error("DynamoDB unavailable");
  });

  assert.equal(await isDuplicateSubmission(client, "leads", "casey@example.com"), false);
});

test("queries the given table by email within the throttle window", async () => {
  const { client, sent } = stubClient({ Items: [] });
  const before = Date.now();

  await isDuplicateSubmission(client, "quote_requests", "casey@example.com");

  assert.equal(sent.length, 1);
  const input = sent[0].input;

  assert.equal(input.TableName, "quote_requests");
  assert.equal(input.Limit, 1);

  const values = input.ExpressionAttributeValues as Record<string, string>;
  assert.equal(values[":email"], "casey@example.com");

  // The window is 45s; assert the bound lands inside it rather than pinning an
  // exact timestamp, which would make the test clock-sensitive.
  const sinceMs = Date.parse(values[":since"]);
  assert.ok(sinceMs <= before - 45_000 + 1_000, "since should be at least ~45s in the past");
  assert.ok(sinceMs > before - 60_000, "since should not be more than a minute in the past");
});

test("aliases both key attributes so reserved words cannot break the query", async () => {
  const { client, sent } = stubClient({ Items: [] });

  await isDuplicateSubmission(client, "leads", "casey@example.com");

  const names = sent[0].input.ExpressionAttributeNames as Record<string, string>;
  assert.equal(names["#email"], "email");
  assert.equal(names["#created_at"], "created_at");
  assert.equal(sent[0].input.KeyConditionExpression, "#email = :email AND #created_at >= :since");
});

// ── claimAcknowledgmentSlot ──────────────────────────────────────────────────
// Guards against the forms being used to mail a stranger repeatedly. Its failure
// modes are silent in both directions: too strict and no visitor is ever
// acknowledged, too loose and the site becomes a spam relay.

test("claims the slot with a conditional write, not a read", async () => {
  // A read-then-decide check cannot be safe here: concurrent requests each look
  // for evidence of the others and may all find none, so all send. Only a
  // conditional write is atomic enough to let exactly one win.
  const { client, sent } = stubClient({});

  assert.equal(await claimAcknowledgmentSlot(client, "acks", "casey@example.com"), true);
  assert.equal(sent.length, 1);
  assert.equal(sent[0].input.TableName, "acks");
  assert.match(String(sent[0].input.ConditionExpression), /attribute_not_exists\(email\)/);
});

test("refuses the slot when another request already holds it", async () => {
  // This is what DynamoDB raises when the condition fails — the losing side of a
  // concurrent race, which must not send.
  const { client } = stubClient(() => {
    throw new ConditionalCheckFailedException({ message: "conditional request failed", $metadata: {} });
  });

  assert.equal(await claimAcknowledgmentSlot(client, "acks", "casey@example.com"), false);
});

test("fails closed when the claim errors for any other reason", async () => {
  // Opposite of isDuplicateSubmission on purpose: skipping one acknowledgment is
  // a minor inconvenience, while sending unsolicited mail risks the sending
  // reputation that internal lead notifications also depend on.
  const { client } = stubClient(() => {
    throw new Error("DynamoDB unavailable");
  });

  assert.equal(await claimAcknowledgmentSlot(client, "acks", "casey@example.com"), false);
});

test("allows a new claim only once the 24 hour window has passed", async () => {
  const { client, sent } = stubClient({});
  const before = Date.now();

  await claimAcknowledgmentSlot(client, "acks", "casey@example.com");

  const values = sent[0].input.ExpressionAttributeValues as Record<string, string>;
  const lookbackMs = before - Date.parse(values[":since"]);
  const dayMs = 24 * 60 * 60 * 1000;

  assert.ok(Math.abs(lookbackMs - dayMs) < 5_000, `window was ${lookbackMs}ms, expected ~${dayMs}ms`);
  // Materially longer than the 45s submission throttle, which is short enough to
  // simply wait out.
  assert.ok(lookbackMs > 45_000, "must be far longer than the submission throttle");
});

test("sets a TTL well beyond the window so cleanup cannot reopen it early", async () => {
  // DynamoDB may take up to 48 hours to delete an expired item, so TTL is only
  // garbage collection — but it must never remove a row the condition still
  // needs to compare against.
  const { client, sent } = stubClient({});

  await claimAcknowledgmentSlot(client, "acks", "casey@example.com");

  const item = sent[0].input.Item as Record<string, unknown>;
  const ttlMs = Number(item.expires_at) * 1000 - Date.parse(String(item.sent_at));
  assert.ok(ttlMs > 24 * 60 * 60 * 1000, "TTL must outlast the acknowledgment window");
});
